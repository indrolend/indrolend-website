// Load and render the DEVELOPMENT_HISTORY.md file
document.addEventListener('DOMContentLoaded', async () => {
  // --- Initialize Particle Page Transitions ---
  if (typeof window.ParticleTransitionEngine !== 'undefined') {
    window.ParticleTransitionEngine.init({
      customBehaviors: window.ParticleTransitionEngine.behaviors
    });
  }

  const contentDiv = document.getElementById('markdown-content');
  
  try {
    // Fetch the markdown file
    const response = await fetch('../../DEVELOPMENT_HISTORY.md');
    if (!response.ok) {
      throw new Error(`Failed to load: ${response.status}`);
    }
    
    const markdown = await response.text();
    
    // Simple markdown to HTML converter
    const html = markdownToHtml(markdown);
    
    contentDiv.innerHTML = html;
  } catch (error) {
    console.error('Error loading development history:', error);
    contentDiv.innerHTML = `
      <div class="error-message">
        <p>Unable to load development history. Please try again later.</p>
        <p style="color: var(--text-muted); font-size: 14px;">Error: ${error.message}</p>
      </div>
    `;
  }
});

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
  let html = markdown;
  
  // Escape HTML entities first
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Line breaks and paragraphs
  const lines = html.split('\n');
  let result = [];
  let inList = false;
  let inOrderedList = false;
  let inCodeBlock = false;
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip empty lines
    if (line === '') {
      if (inList) {
        result.push('<ul>' + listItems.join('') + '</ul>');
        listItems = [];
        inList = false;
      }
      if (inOrderedList) {
        result.push('<ol>' + listItems.join('') + '</ol>');
        listItems = [];
        inOrderedList = false;
      }
      continue;
    }
    
    // Headers (already converted)
    if (line.startsWith('<h') || line === '<hr>') {
      if (inList) {
        result.push('<ul>' + listItems.join('') + '</ul>');
        listItems = [];
        inList = false;
      }
      if (inOrderedList) {
        result.push('<ol>' + listItems.join('') + '</ol>');
        listItems = [];
        inOrderedList = false;
      }
      result.push(line);
      continue;
    }
    
    // Unordered lists
    if (line.match(/^[-*+] /)) {
      if (inOrderedList) {
        result.push('<ol>' + listItems.join('') + '</ol>');
        listItems = [];
        inOrderedList = false;
      }
      const content = line.substring(2);
      listItems.push('<li>' + content + '</li>');
      inList = true;
      continue;
    }
    
    // Ordered lists
    if (line.match(/^\d+\. /)) {
      if (inList) {
        result.push('<ul>' + listItems.join('') + '</ul>');
        listItems = [];
        inList = false;
      }
      const content = line.replace(/^\d+\. /, '');
      listItems.push('<li>' + content + '</li>');
      inOrderedList = true;
      continue;
    }
    
    // Regular paragraph
    if (inList) {
      result.push('<ul>' + listItems.join('') + '</ul>');
      listItems = [];
      inList = false;
    }
    if (inOrderedList) {
      result.push('<ol>' + listItems.join('') + '</ol>');
      listItems = [];
      inOrderedList = false;
    }
    
    result.push('<p>' + line + '</p>');
  }
  
  // Close any remaining list
  if (inList) {
    result.push('<ul>' + listItems.join('') + '</ul>');
  }
  if (inOrderedList) {
    result.push('<ol>' + listItems.join('') + '</ol>');
  }
  
  return result.join('\n');
}
