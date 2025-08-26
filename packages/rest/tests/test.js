import { REST } from '../dist/index.js';
import { config } from 'dotenv';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

// Test configuration
const TEST_CONFIG = {
  // Test categories to run
  categories: {
    auth: process.env.TEST_AUTH === 'true',
    users: process.env.TEST_USERS === 'true',
    posts: process.env.TEST_POSTS === 'true',
    dialogs: process.env.TEST_DIALOGS === 'true',
    photos: process.env.TEST_PHOTOS === 'true',
    files: process.env.TEST_FILES === 'true',
    video: process.env.TEST_VIDEO === 'true',
    musebase: process.env.TEST_MUSEBASE === 'true',
    search: process.env.TEST_SEARCH === 'true',
    shop: process.env.TEST_SHOP === 'true',
    apps: process.env.TEST_APPS === 'true'
  },
  
  // Test data
  testData: {
    email: process.env.TEST_EMAIL,
    password: process.env.TEST_PASSWORD,
    token: process.env.YURBA_TOKEN,
    userId: process.env.TEST_USER_ID,
    postId: process.env.TEST_POST_ID,
    photoId: process.env.TEST_PHOTO_ID,
    videoId: process.env.TEST_VIDEO_ID,
    trackId: process.env.TEST_TRACK_ID,
    fileId: process.env.TEST_FILE_ID,
    dialogId: process.env.TEST_DIALOG_ID,
    appId: process.env.TEST_APP_ID,
    appPublicKey: process.env.TEST_APP_PUBLIC_KEY,
    appSecret: process.env.TEST_APP_SECRET
  }
};

// Type checking utilities
const TYPES_FILE = join(process.cwd(), 'tests', 'expected-types.json');

function loadExpectedTypes() {
  if (existsSync(TYPES_FILE)) {
    return JSON.parse(readFileSync(TYPES_FILE, 'utf8'));
  }
  return {};
}

function saveExpectedTypes(types) {
  writeFileSync(TYPES_FILE, JSON.stringify(types, null, 2));
}

function checkAndRecordType(methodName, result, expectedTypes) {
  const actualType = getTypeSignature(result);
  
  if (expectedTypes[methodName]) {
    if (JSON.stringify(expectedTypes[methodName]) !== JSON.stringify(actualType)) {
      console.warn(`⚠️  Type mismatch for ${methodName}:`);
      console.warn(`   Expected:`, expectedTypes[methodName]);
      console.warn(`   Actual:`, actualType);
    } else {
      console.log(`✅ Type match for ${methodName}`);
    }
  } else {
    console.log(`📝 Recording new type for ${methodName}:`, actualType);
    expectedTypes[methodName] = actualType;
  }
}

function getTypeSignature(obj) {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (Array.isArray(obj)) {
    return {
      type: 'array',
      length: obj.length,
      itemType: obj.length > 0 ? getTypeSignature(obj[0]) : 'unknown'
    };
  }
  if (typeof obj === 'object') {
    const signature = { type: 'object', properties: {} };
    for (const [key, value] of Object.entries(obj)) {
      signature.properties[key] = typeof value;
    }
    return signature;
  }
  return typeof obj;
}

// Initialize REST client (only if token provided)
let rest;
if (TEST_CONFIG.testData.token) {
  rest = new REST(TEST_CONFIG.testData.token);
}
const expectedTypes = loadExpectedTypes();

// Test runner
class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  async run(name, testFn, category, expectedErrors = []) {
    if (!TEST_CONFIG.categories[category]) {
      console.log(`⏭️  Skipping ${name} (category disabled)`);
      this.results.skipped++;
      return;
    }

    if (!rest) {
      console.log(`⏭️  Skipping ${name} (no token provided)`);
      this.results.skipped++;
      return;
    }

    try {
      console.log(`🧪 Testing ${name}...`);
      const result = await testFn();
      
      if (result !== undefined) {
        checkAndRecordType(name, result, expectedTypes);
      }
      
      console.log(`✅ ${name} passed`);
      this.results.passed++;
    } catch (error) {
      const isExpectedError = expectedErrors.some(expectedMsg => 
        error.message.includes(expectedMsg)
      );
      
      if (isExpectedError) {
        console.log(`⚠️  ${name} failed as expected: ${error.message}`);
        this.results.passed++;
      } else {
        console.error(`❌ ${name} failed:`, error.message);
        this.results.failed++;
        this.results.errors.push({ test: name, error: error.message });
      }
    }
  }

  printSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏭️  Skipped: ${this.results.skipped}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n🚨 Errors:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`  ${test}: ${error}`);
      });
    }
    
    saveExpectedTypes(expectedTypes);
    console.log(`\n💾 Types saved to ${TYPES_FILE}`);
  }
}

// Test suites
const runner = new TestRunner();

async function runAllTests() {
  console.log('🚀 Starting yurba.js REST API tests\n');

  // Auth tests
  await runner.run('account.login', async () => {
    if (!TEST_CONFIG.testData.email || !TEST_CONFIG.testData.password) {
      throw new Error('Email and password required for login test');
    }
    return await rest.account.login(TEST_CONFIG.testData.email, TEST_CONFIG.testData.password);
  }, 'auth');

  await runner.run('account.getTokens', async () => {
    return await rest.account.getTokens();
  }, 'auth');

  // User tests
  await runner.run('users.me', async () => {
    return await rest.users.me();
  }, 'users');

  await runner.run('users.get', async () => {
    const userId = TEST_CONFIG.testData.userId || '@me';
    return await rest.users.get(userId);
  }, 'users');

  await runner.run('users.friends', async () => {
    return await rest.users.friends();
  }, 'users');

  await runner.run('users.getFriends', async () => {
    const userId = TEST_CONFIG.testData.userId || '@me';
    return await rest.users.getFriends(userId, 0);
  }, 'users', ['Access denied', 'resource does not exist']);

  await runner.run('users.gifts', async () => {
    return await rest.users.gifts();
  }, 'users');

  await runner.run('users.getGifts', async () => {
    const userId = TEST_CONFIG.testData.userId || '@me';
    return await rest.users.getGifts(userId);
  }, 'users');

  // Post tests
  await runner.run('posts.create', async () => {
    return await rest.posts.create('@me', {
      content: `Test post from yurba.js at ${new Date().toISOString()}`
    });
  }, 'posts');

  await runner.run('posts.get', async () => {
    return await rest.posts.get('@me', {});
  }, 'posts');

  await runner.run('posts.getComments', async () => {
    const postId = TEST_CONFIG.testData.postId;
    if (!postId) throw new Error('Post ID required for comments test');
    return await rest.posts.getComments(parseInt(postId));
  }, 'posts');

  // Dialog tests
  await runner.run('dialogs.getAll', async () => {
    return await rest.dialogs.getAll();
  }, 'dialogs');

  await runner.run('dialogs.get', async () => {
    const dialogId = TEST_CONFIG.testData.dialogId;
    if (!dialogId) throw new Error('Dialog ID required for dialog test');
    return await rest.dialogs.get(parseInt(dialogId));
  }, 'dialogs', ['Dialog ID required', 'not found', 'Access denied']);

  // Photos tests
  await runner.run('photos.getAll', async () => {
    return await rest.photos.getAll();
  }, 'photos');

  await runner.run('photos.get', async () => {
    const photoId = TEST_CONFIG.testData.photoId;
    if (!photoId) throw new Error('Photo ID required for photo test');
    return await rest.photos.get(photoId);
  }, 'photos', ['Photo ID required', 'not found']);

  // Files tests
  await runner.run('files.getAll', async () => {
    return await rest.files.getAll();
  }, 'files');

  await runner.run('files.get', async () => {
    const fileId = TEST_CONFIG.testData.fileId;
    if (!fileId) throw new Error('File ID required for file test');
    return await rest.files.get(parseInt(fileId));
  }, 'files', ['File ID required', 'not found']);

  // Video tests
  await runner.run('video.getAll', async () => {
    return await rest.video.getAll();
  }, 'video');

  await runner.run('video.get', async () => {
    const videoId = TEST_CONFIG.testData.videoId;
    if (!videoId) throw new Error('Video ID required for video test');
    return await rest.video.get(parseInt(videoId));
  }, 'video');

  // Musebase tests
  await runner.run('musebase.getTrack', async () => {
    const trackId = TEST_CONFIG.testData.trackId;
    if (!trackId) throw new Error('Track ID required for track test');
    return await rest.musebase.getTrack(parseInt(trackId));
  }, 'musebase');

  await runner.run('musebase.getUserPlaylists', async () => {
    const userId = TEST_CONFIG.testData.userId || 'yurbajs';
    return await rest.musebase.getUserPlaylists(userId.toString());
  }, 'musebase');

  // Search tests
  await runner.run('search.users', async () => {
    return await rest.search.users({
      sort: 0,
      country: 0,
      region: 0,
      city: 0,
      worksAt: '',
      relationships: 0,
      online: 0,
      avatar: 0
    });
  }, 'search');

  await runner.run('search.tracks', async () => {
    return await rest.search.tracks('test');
  }, 'search');

  await runner.run('search.dialogs', async () => {
    return await rest.search.dialogs('test', {
      sort: 0,
      type: 0,
      country: 0,
      topic: 0
    });
  }, 'search');

  // Shop tests
  await runner.run('shop.get', async () => {
    return await rest.shop.get();
  }, 'shop');

  await runner.run('shop.inventory', async () => {
    return await rest.shop.inventory();
  }, 'shop');

  // Apps tests
  await runner.run('apps.getAll', async () => {
    return await rest.apps.getAll();
  }, 'apps');

  await runner.run('apps.get', async () => {
    const appPublicKey = TEST_CONFIG.testData.appPublicKey;
    if (!appPublicKey) throw new Error('App public key required for app test');
    return await rest.apps.get(appPublicKey);
  }, 'apps');

  runner.printSummary();
}

// Create example .env file
function createExampleEnv() {
  const envExample = `# Yurba.js REST API Test Configuration

# Test categories (set to 'true' to enable)
TEST_AUTH=false
TEST_USERS=true
TEST_POSTS=true
TEST_DIALOGS=false
TEST_PHOTOS=false
TEST_FILES=false
TEST_VIDEO=false
TEST_MUSEBASE=false
TEST_SEARCH=false
TEST_SHOP=false
TEST_APPS=false

# Authentication
YURBA_TOKEN=y.your_token_here
TEST_EMAIL=your_email@example.com
TEST_PASSWORD=your_password

# Test data IDs (optional, will use @me if not provided)
TEST_USER_ID=12345
TEST_POST_ID=67890
TEST_PHOTO_ID=11111
TEST_VIDEO_ID=22222
TEST_TRACK_ID=33333
TEST_FILE_ID=44444
TEST_DIALOG_ID=55555

# App credentials (for app-specific tests)
TEST_APP_ID=66666
TEST_APP_PUBLIC_KEY=your_app_public_key_here
TEST_APP_SECRET=your_app_secret_here

# Rate limiting (optional)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
`;

  const envPath = join(process.cwd(), '.env.example');
  writeFileSync(envPath, envExample);
  console.log(`📝 Created ${envPath}`);
}

// Main execution
if (process.argv.includes('--create-env')) {
  createExampleEnv();
} else {
  runAllTests().catch(console.error);
}