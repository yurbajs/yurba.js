const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

function processMarkdownFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  
  content = content.replace(
    /\[`([^`]+)`\]\(([^)]*\/(interfaces|classes|type-aliases)\/[^)]+\.md)\)/g,
    (match, name, href) => {
      const htmlHref = href.replace('.md', '.html');
      return `<ApiLink href="${htmlHref}" name="${name}">${name}</ApiLink>`;
    }
  );
  
  content = content.replace(
    /\[([^\]]+)\]\(([^)]*\/(interfaces|classes|type-aliases)\/[^)]+\.md)\)/g,
    (match, name, href) => {
      const htmlHref = href.replace('.md', '.html');
      return `<ApiLink href="${htmlHref}" name="${name}">${name}</ApiLink>`;
    }
  );
  
  content = content.replace(
    /\[`([^`]+)`\]\(([A-Z][^)]+\.md)\)/g,
    (match, name, href) => {
      const htmlHref = href.replace('.md', '.html');
      return `<ApiLink href="${htmlHref}" name="${name}">${name}</ApiLink>`;
    }
  );
  
  content = content.replace(
    /\[([A-Z][^\]]+)\]\(([A-Z][^)]+\.md)\)/g,
    (match, name, href) => {
      const htmlHref = href.replace('.md', '.html');
      return `<ApiLink href="${htmlHref}" name="${name}">${name}</ApiLink>`;
    }
  );
  
  writeFileSync(filePath, content, 'utf-8');
}

function processDirectory(dirPath) {
  const items = readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.md')) {
      processMarkdownFile(fullPath);
      console.log(`Processed: ${fullPath}`);
    }
  }
}

const docsPath = process.argv[2] || './apps/docs/dist';
processDirectory(docsPath);
console.log('Done!');
