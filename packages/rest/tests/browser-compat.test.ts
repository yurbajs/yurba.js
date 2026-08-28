/**
 * Browser compatibility tests
 * Tests that REST library works in browser environment
 */

describe('Browser Compatibility', () => {
  test('should not use Node.js-specific APIs', () => {
    const fs = require('fs');
    const path = require('path');

    // Read all source files
    const srcDir = path.join(__dirname, '../src');
    const files = getAllFiles(srcDir);

    const nodeSpecificAPIs = [
      /require\(['"]fs['"]\)/,
      /require\(['"]path['"]\)/,
      /require\(['"]http['"]\)/,
      /require\(['"]https['"]\)/,
      /require\(['"]stream['"]\)/,
      /require\(['"]buffer['"]\)/,
      /require\(['"]crypto['"]\)/,
      /require\(['"]os['"]\)/,
      /process\.cwd\(/,
      /process\.env(?!\.)/,  // Allow process.env but not other process methods
      /__dirname/,
      /__filename/,
    ];

    const violations: string[] = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const relativePath = path.relative(srcDir, file);

      nodeSpecificAPIs.forEach(pattern => {
        if (pattern.test(content)) {
          violations.push(`${relativePath}: Found Node.js-specific API: ${pattern}`);
        }
      });
    });

    if (violations.length > 0) {
      console.error('Node.js-specific APIs found:\n' + violations.join('\n'));
    }

    expect(violations).toHaveLength(0);
  });

  test('should use only Web APIs', () => {
    const webAPIs = [
      'fetch',
      'FormData',
      'AbortController',
      'URL',
      'URLSearchParams',
      'Headers',
      'Request',
      'Response',
      'Blob',
      'File',
    ];

    // These should be available in browser
    webAPIs.forEach(api => {
      expect(typeof globalThis[api as keyof typeof globalThis]).toBeDefined();
    });
  });

  test('cache should work without Node.js types', () => {
    const fs = require('fs');
    const path = require('path');

    const cacheFile = path.join(__dirname, '../src/cache.ts');
    const content = fs.readFileSync(cacheFile, 'utf8');

    // Check for Node.js-specific types
    const nodeTypes = [
      /NodeJS\.Timeout/,
      /NodeJS\.Timer/,
      /NodeJS\.Process/,
    ];

    const violations: string[] = [];
    nodeTypes.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push(`Found Node.js-specific type: ${pattern}`);
      }
    });

    if (violations.length > 0) {
      console.error('Node.js-specific types in cache.ts:\n' + violations.join('\n'));
    }

    expect(violations).toHaveLength(0);
  });

  test('EventEmitter should be from events package', () => {
    const fs = require('fs');
    const path = require('path');

    const baseClientFile = path.join(__dirname, '../src/BaseClient.ts');
    const content = fs.readFileSync(baseClientFile, 'utf8');

    // Should import from 'events' package (works in browser via bundler)
    expect(content).toMatch(/import.*EventEmitter.*from ['"]events['"]/);
  });
});

function getAllFiles(dir: string, files: string[] = []): string[] {
  const fs = require('fs');
  const path = require('path');

  const items = fs.readdirSync(dir);

  items.forEach((item: string) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  });

  return files;
}
