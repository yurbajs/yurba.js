const fs = require('fs');
const path = require('path');

const docsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'yurbadocs.json'), 'utf8'));

// Build lookup map: "METHOD /path" -> "doc_key"
const lookup = {};
for (const category in docsData) {
  if (category === 'base_url') continue;
  for (const key in docsData[category]) {
    const { method, path: apiPath } = docsData[category][key];
    lookup[`${method} ${apiPath}`] = key;
  }
}

const resourcesDir = path.join(__dirname, '../packages/rest/src/resources');
const files = fs.readdirSync(resourcesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(resourcesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Match: @rest METHOD /path [*]
  content = content.replace(/@rest\s+(\w+)\s+(\/\S+?)(?:\s+(\*|\w+))?(?=\s*$)/gm, (match, method, apiPath, existing) => {
    const key = `${method} ${apiPath}`;
    const docKey = lookup[key];

    if (docKey) {
      modified = true;
      return `@rest ${method} ${apiPath} ${docKey}`;
    } else if (existing === '*') {
      modified = true;
      return `@rest ${method} ${apiPath}`;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  } else {
    console.log(`  ${file} - no changes`);
  }
});

console.log('\nDone!');
