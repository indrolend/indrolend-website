// Usage: node walk-entire-codebase.js
const acorn = require('acorn');
const walk = require('acorn-walk');
const fs = require('fs');
const path = require('path');

// Directories to scan (runtime code only)
const SCAN_DIRS = [
  path.join(__dirname, 'js', 'spa'),
  // add more if needed (e.g., engines, overlays)
];

// Directories to skip per your repo rules
const SKIP_DIRS = new Set(['legacy', 'external', 'assets', 'images', 'data', 'node_modules', '.git']);

function walkDir(dir, fileCallback) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walkDir(path.join(dir, entry.name), fileCallback);
      }
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fileCallback(path.join(dir, entry.name));
    }
  });
}

// Example: Find all function declarations and top-level info in all files
function analyzeFile(file) {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });
  } catch (err) {
    console.error(`Parse error in ${file}: ${err.message}`);
    return;
  }
  walk.simple(ast, {
    FunctionDeclaration(node) {
      const name = node.id ? node.id.name : '<anonymous>';
      console.log(`[${file}] function: ${name} (line ${node.loc.start.line})`);
    },
    // Add more handlers here for engines, managers, classes, etc. if needed
  });
}

SCAN_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir, analyzeFile);
  }
});