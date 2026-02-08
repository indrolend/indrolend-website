/**
 * Journal Page Script
 * Loads and displays journal entries from JOURNAL_ENTRIES.md
 */

(function() {
  'use strict';

  const JOURNAL_ENTRIES_URL = '../JOURNAL_ENTRIES.md';

  /**
   * Load journal entries from markdown file
   */
  async function loadJournalEntries() {
    const contentDiv = document.getElementById('markdown-content');
    
    if (!contentDiv) {
      console.error('Content div not found');
      return;
    }

    try {
      const response = await fetch(JOURNAL_ENTRIES_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      
      // Simple markdown to HTML conversion
      const html = convertMarkdownToHTML(markdown);
      
      contentDiv.innerHTML = html;
    } catch (error) {
      console.error('Error loading journal entries:', error);
      contentDiv.innerHTML = '<p class="error-message">Failed to load journal entries. Please try again later.</p>';
    }
  }

  /**
   * Simple markdown to HTML converter
   * Handles basic markdown syntax needed for journal entries
   */
  function convertMarkdownToHTML(markdown) {
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Convert bold text BEFORE italic to avoid conflicts
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert italic text (after bold is already processed)
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Convert paragraphs (lines with content)
    const lines = html.split('\n');
    let inParagraph = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip if it's already an HTML tag
      if (trimmed.startsWith('<')) {
        if (inParagraph) {
          result.push('</p>');
          inParagraph = false;
        }
        result.push(line);
      } else if (trimmed === '') {
        if (inParagraph) {
          result.push('</p>');
          inParagraph = false;
        }
        result.push('');
      } else {
        if (!inParagraph) {
          result.push('<p>');
          inParagraph = true;
        } else {
          result.push('<br>');
        }
        result.push(line);
      }
    }

    if (inParagraph) {
      result.push('</p>');
    }

    return result.join('\n');
  }

  /**
   * Initialize the journal page
   */
  function init() {
    // Load entries when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadJournalEntries);
    } else {
      loadJournalEntries();
    }
  }

  init();
})();
