/**
 * File upload compatibility tests
 */

describe('File Upload Compatibility', () => {
  test('Files resource should use utility function', () => {
    const fs = require('fs');
    const path = require('path');

    const filesResource = path.join(__dirname, '../src/resources/Files.ts');
    const content = fs.readFileSync(filesResource, 'utf8');

    // Should not have static imports from 'fs'
    expect(content).not.toMatch(/^import.*from ['"]fs['"];?$/m);
    expect(content).not.toMatch(/require\(['"]fs['"]\)/);

    // Should use prepareFile utility
    expect(content).toMatch(/prepareFile/);
  });

  test('should support browser File/Blob upload', () => {
    // Browser APIs should be available
    expect(typeof FormData).toBe('function');
    expect(typeof Blob).toBe('function');
    expect(typeof File).toBe('function');
  });
});
