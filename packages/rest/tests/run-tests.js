#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const presets = {
  basic: {
    TEST_USERS: 'true',
    TEST_POSTS: 'false',
    TEST_DIALOGS: 'false',
    TEST_PHOTOS: 'false',
    TEST_FILES: 'false',
    TEST_VIDEO: 'false',
    TEST_MUSEBASE: 'false',
    TEST_SEARCH: 'false',
    TEST_SHOP: 'false',
    TEST_APPS: 'false',
  },

  content: {
    TEST_USERS: 'true',
    TEST_POSTS: 'true',
    TEST_PHOTOS: 'true',
    TEST_FILES: 'true',
    TEST_VIDEO: 'true',
    TEST_MUSEBASE: 'true',
    TEST_DIALOGS: 'false',
    TEST_SEARCH: 'false',
    TEST_SHOP: 'false',
    TEST_APPS: 'false',
  },

  social: {
    TEST_USERS: 'true',
    TEST_POSTS: 'true',
    TEST_DIALOGS: 'true',
    TEST_SEARCH: 'true',
    TEST_PHOTOS: 'false',
    TEST_FILES: 'false',
    TEST_VIDEO: 'false',
    TEST_MUSEBASE: 'false',
    TEST_SHOP: 'false',
    TEST_APPS: 'false',
  },

  full: {
    TEST_AUTH: 'false',
    TEST_USERS: 'true',
    TEST_POSTS: 'true',
    TEST_DIALOGS: 'true',
    TEST_PHOTOS: 'true',
    TEST_FILES: 'true',
    TEST_VIDEO: 'true',
    TEST_MUSEBASE: 'true',
    TEST_SEARCH: 'true',
    TEST_SHOP: 'true',
    TEST_APPS: 'true',
  },
};

function showHelp() {
  console.log(`
🧪 Yurba.js REST API Test Runner

Usage: node run-tests.js [preset] [options]

Presets:
  basic    - Only user tests (safe, no external dependencies)
  content  - User + content tests (posts, photos, files, video, music)
  social   - User + social tests (posts, dialogs, search)
  full     - All tests except auth (requires test data IDs)

Options:
  --help   - Show this help
  --list   - List available presets
  --env    - Create example .env file

Examples:
  node run-tests.js basic
  node run-tests.js content
  node run-tests.js full
  node run-tests.js --env
`);
}

function listPresets() {
  console.log('📋 Available test presets:\n');

  Object.entries(presets).forEach(([name, config]) => {
    const enabledTests = Object.entries(config)
      .filter(([key, value]) => value === 'true')
      .map(([key]) => key.replace('TEST_', '').toLowerCase())
      .join(', ');

    console.log(`  ${name.padEnd(8)} - ${enabledTests}`);
  });
}

function runTests(preset = 'basic') {
  if (!presets[preset]) {
    console.error(`❌ Unknown preset: ${preset}`);
    console.log('Available presets:', Object.keys(presets).join(', '));
    process.exit(1);
  }

  console.log(`🚀 Running ${preset} test preset...\n`);

  // Set environment variables
  const env = { ...process.env, ...presets[preset] };

  try {
    execSync('node tests/test.js', {
      stdio: 'inherit',
      env,
      cwd: process.cwd(),
    });
  } catch (error) {
    console.error('❌ Tests failed');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
case '--help':
case '-h':
  showHelp();
  break;

case '--list':
case '-l':
  listPresets();
  break;

case '--env':
  execSync('node tests/test.js --create-env', { stdio: 'inherit' });
  break;

case undefined:
  runTests('basic');
  break;

default:
  if (presets[command]) {
    runTests(command);
  } else {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
}
