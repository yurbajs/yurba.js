const fs = require('fs');
const path = require('path');

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix double backticks in method signatures
  content = content.replace(/\(``/g, '(`');
  content = content.replace(/``\)/g, '`)');
  content = content.replace(/: ``/g, ': `');
  
  // Fix newline and backtick before span
  content = content.replace(/\n\n` </g, ' <');
  
  // Fix other double backticks
  content = content.replace(/``([^`\n]+?)``/g, '`$1`');
  content = content.replace(/````(javascript|typescript|js|ts)/g, '```$1');
  content = content.replace(/````$/gm, '```');
  content = content.replace(/(#### Returns\n\n)(`[^`]+`)\n\n([^\n#]+)/g, '$1> $2 *? $3');
  
  fs.writeFileSync(filePath, content);
};

const processDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.md')) {
      processFile(filePath);
    }
  });
};

exports.processMarkdown = (outDir) => {
  try {
    processDir(outDir);
  } catch (err) {
    console.error('Error post-processing markdown files:', err);
  }
};
