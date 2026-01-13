#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const resourcesDir = path.join(__dirname, '../packages/rest/src/resources');
const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const stats = {
  withLink: [],
  withoutLink: [],
  total: 0
};

files.forEach(file => {
  const filePath = path.join(resourcesDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const restRegex = /@rest\s+(GET|POST|PUT|PATCH|DELETE)\s+([^\s]+)(?:\s+(.+))?$/gm;
  
  let match;
  while ((match = restRegex.exec(content)) !== null) {
    const [, method, endpoint, link] = match;
    const lineNum = content.substring(0, match.index).split('\n').length;
    stats.total++;
    
    const cleanLink = link?.trim().split(/\s+/)[0] || null;
    const hasLink = cleanLink && cleanLink !== '*' && cleanLink.length > 0;
    
    const entry = {
      file,
      line: lineNum,
      method,
      endpoint,
      link: hasLink ? cleanLink : null
    };
    
    if (hasLink) {
      stats.withLink.push(entry);
    } else {
      stats.withoutLink.push(entry);
    }
  }
});

const withLinkPercent = ((stats.withLink.length / stats.total) * 100).toFixed(1);
const withoutLinkPercent = ((stats.withoutLink.length / stats.total) * 100).toFixed(1);

console.log('📊 REST Tags Statistics\n');
console.log(`Total: ${stats.total}`);
console.log(`With link: ${stats.withLink.length} (${withLinkPercent}%)`);
console.log(`Without link: ${stats.withoutLink.length} (${withoutLinkPercent}%)\n`);

console.log('✅ With documentation link:');
stats.withLink.forEach(({ file, line, method, endpoint, link }) => {
  console.log(`  packages/rest/src/resources/${file}:${line} → ${method} ${endpoint} (${link})`);
});

console.log('\n❌ Without documentation link:');
stats.withoutLink.forEach(({ file, line, method, endpoint }) => {
  console.log(`  packages/rest/src/resources/${file}:${line} → ${method} ${endpoint}`);
});
