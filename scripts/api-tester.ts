/**
 * Yurba API Tester
 * Tests all API modules using @yurbajs/rest (no DELETE methods)
 *
 * Usage:
 *   YURBA_TOKEN=your_token node --experimental-strip-types scripts/api-tester.ts
 *   # or via package.json script:
 *   pnpm api-test
 *
 * Env vars (packages/rest/.env):
 *   YURBA_TOKEN=...          required
 *
 *   TEST_USER=tag_or_id      default: @me
 *   TEST_DIALOG_ID=123       for dialog-specific tests
 *   TEST_POST_ID=123         for post comment tests
 *   TEST_TRACK_ID=1          for musebase track test
 *   TEST_PHOTO_ID=123        for single photo test
 *   TEST_VIDEO_ID=123        for single video test
 *   TEST_FILE_ID=123         for single file test
 *   TEST_APP_KEY=abc         for app-specific tests
 *   TEST_PLAYLIST_ID=123     for playlist tests
 *
 *   # Mutating tests (POST/PATCH that create/modify real data)
 *   # Set to 'true' to enable — disabled by default to avoid side effects
 *   ENABLE_MUTATING=true
 */

// Uses built dist — run `pnpm build` first if needed
import { REST } from '../packages/rest/dist/index.js';

const TOKEN = process.env.YURBA_TOKEN;
if (!TOKEN) { console.error('❌ YURBA_TOKEN is required'); process.exit(1); }

const TEST_USER       = process.env.TEST_USER        ?? '@me';
const TEST_DIALOG_ID  = Number(process.env.TEST_DIALOG_ID  ?? 0);
const TEST_POST_ID    = Number(process.env.TEST_POST_ID    ?? 0);
const TEST_TRACK_ID   = Number(process.env.TEST_TRACK_ID   ?? 1);
const TEST_PHOTO_ID   = process.env.TEST_PHOTO_ID    ?? '';
const TEST_VIDEO_ID   = Number(process.env.TEST_VIDEO_ID   ?? 0);
const TEST_FILE_ID    = Number(process.env.TEST_FILE_ID    ?? 0);
const TEST_APP_KEY    = process.env.TEST_APP_KEY     ?? '';
const TEST_PLAYLIST_ID = Number(process.env.TEST_PLAYLIST_ID ?? 0);
const MUTATING        = process.env.ENABLE_MUTATING === 'true';

const rest = new REST();
rest.setToken(TOKEN);

type TestResult = { name: string; status: '✅' | '❌' | '⚠️'; detail?: string };
const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    const data = await fn();
    results.push({ name, status: '✅', detail: JSON.stringify(data)?.slice(0, 100) });
  } catch (err: unknown) {
    results.push({ name, status: '❌', detail: err instanceof Error ? err.message : String(err) });
  }
}

function skip(name: string, reason: string): void {
  results.push({ name, status: '⚠️', detail: `Skipped: ${reason}` });
}

function skipMutating(name: string): void {
  skip(name, 'mutating test — set ENABLE_MUTATING=true to run');
}

// ─── Account ─────────────────────────────────────────────────────────────────
async function testAccount() {
  // GET
  await test('account.getTokens', () => rest.account.getTokens());

  // POST — require captcha/credentials, always skip
  skip('account.login',         'requires credentials');
  skip('account.register',      'requires credentials + captcha');
  skip('account.confirm',       'requires captcha');
  skip('account.resetPassword', 'requires email');
  skip('account.activatePromo', 'requires valid promo code');

  // PATCH
  if (MUTATING) {
    await test('account.update (PATCH)', () => rest.account.update({}));
  } else {
    skipMutating('account.update (PATCH)');
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────
async function testUsers() {
  // GET
  await test('users.me',               () => rest.users.me());
  await test('users.get',              () => rest.users.get(TEST_USER));
  await test('users.friends',          () => rest.users.friends());
  await test('users.gifts',            () => rest.users.gifts());
  await test('users.incomingRequests', () => rest.users.incomingRequests());
  await test('users.outgoingRequests', () => rest.users.outgoingRequests());
  await test('users.getRelationships', () => rest.users.getRelationships(TEST_USER));

  // PATCH — subscribe toggles relationship, mutating
  if (MUTATING) {
    await test('users.subscribe (PATCH)', () => rest.users.subscribe(TEST_USER));
  } else {
    skipMutating('users.subscribe (PATCH)');
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────────
async function testPosts() {
  // GET
  await test('posts.get(@me)', () => rest.posts.get('@me', {}));

  if (TEST_POST_ID > 0) {
    await test('posts.getComments', () => rest.posts.getComments(TEST_POST_ID));
  } else {
    skip('posts.getComments', 'TEST_POST_ID not set');
  }

  // POST — creates real post/comment
  if (MUTATING) {
    await test('posts.create (POST)', () =>
      rest.posts.create('@me', { content: '[api-tester] test post' }),
    );
    if (TEST_POST_ID > 0) {
      await test('posts.addComment (POST)', () =>
        rest.posts.addComment(TEST_POST_ID, '[api-tester] test comment'),
      );
    } else {
      skip('posts.addComment (POST)', 'TEST_POST_ID not set');
    }
  } else {
    skipMutating('posts.create (POST)');
    skipMutating('posts.addComment (POST)');
  }

  // PATCH — edits existing post
  if (MUTATING && TEST_POST_ID > 0) {
    await test('posts.edit (PATCH)', () =>
      rest.posts.edit(TEST_POST_ID, { content: '[api-tester] edited post' }),
    );
  } else {
    skipMutating('posts.edit (PATCH)');
  }
}

// ─── Dialogs ─────────────────────────────────────────────────────────────────
async function testDialogs() {
  // GET
  await test('dialogs.getAll', () => rest.dialogs.getAll());

  if (TEST_DIALOG_ID > 0) {
    await test('dialogs.get',        () => rest.dialogs.get(TEST_DIALOG_ID));
    await test('dialogs.getMembers', () => rest.dialogs.getMembers(TEST_DIALOG_ID));
    await test('dialogs.getMessages',() => rest.dialogs.getMessages(TEST_DIALOG_ID));
  } else {
    skip('dialogs.get',         'TEST_DIALOG_ID not set');
    skip('dialogs.getMembers',  'TEST_DIALOG_ID not set');
    skip('dialogs.getMessages', 'TEST_DIALOG_ID not set');
  }

  // POST — creates dialog / sends message
  if (MUTATING) {
    await test('dialogs.create (POST)', () =>
      rest.dialogs.create({ name: '[api-tester] test dialog', description: 'test', type: 'group' }),
    );
    if (TEST_DIALOG_ID > 0) {
      await test('dialogs.sendMessage (POST)', () =>
        rest.dialogs.sendMessage(TEST_DIALOG_ID, { text: '[api-tester] test message' }),
      );
      await test('dialogs.join (POST)', () => rest.dialogs.join(TEST_DIALOG_ID));
    } else {
      skip('dialogs.sendMessage (POST)', 'TEST_DIALOG_ID not set');
      skip('dialogs.join (POST)',        'TEST_DIALOG_ID not set');
    }
  } else {
    skipMutating('dialogs.create (POST)');
    skipMutating('dialogs.sendMessage (POST)');
    skipMutating('dialogs.join (POST)');
  }

  // PATCH
  if (MUTATING && TEST_DIALOG_ID > 0) {
    await test('dialogs.mute (PATCH)',   () => rest.dialogs.mute(TEST_DIALOG_ID));
    await test('dialogs.update (PATCH)', () =>
      rest.dialogs.update(TEST_DIALOG_ID, { description: '[api-tester] updated' }),
    );
  } else {
    skipMutating('dialogs.mute (PATCH)');
    skipMutating('dialogs.update (PATCH)');
  }
}

// ─── Photos ──────────────────────────────────────────────────────────────────
async function testPhotos() {
  // GET
  await test('photos.getAll', () => rest.photos.getAll());

  if (TEST_PHOTO_ID) {
    await test('photos.get', () => rest.photos.get(TEST_PHOTO_ID));
  } else {
    skip('photos.get', 'TEST_PHOTO_ID not set');
  }

  // POST — uploads a real photo
  if (MUTATING) {
    const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    await test('photos.upload (POST)', () =>
      rest.photos.upload(buf, '[api-tester]', 'public', 'test.png'),
    );
  } else {
    skipMutating('photos.upload (POST)');
  }
}

// ─── Files ───────────────────────────────────────────────────────────────────
async function testFiles() {
  // GET
  await test('files.getAll', () => rest.files.getAll());

  if (TEST_FILE_ID > 0) {
    await test('files.get', () => rest.files.get(TEST_FILE_ID));
  } else {
    skip('files.get', 'TEST_FILE_ID not set');
  }

  // POST — uploads a real file
  if (MUTATING) {
    const buf = Buffer.from('[api-tester] test file content');
    await test('files.upload (POST)', () => rest.files.upload(buf, 'api-tester.txt'));
  } else {
    skipMutating('files.upload (POST)');
  }
}

// ─── Video ───────────────────────────────────────────────────────────────────
async function testVideo() {
  // GET
  await test('video.getAll', () => rest.video.getAll());

  if (TEST_VIDEO_ID > 0) {
    await test('video.get', () => rest.video.get(TEST_VIDEO_ID));
  } else {
    skip('video.get', 'TEST_VIDEO_ID not set');
  }

  // POST — uploading video is heavy, always skip
  skip('video.upload (POST)', 'requires a real video file — test manually');
}

// ─── Musebase ────────────────────────────────────────────────────────────────
async function testMusebase() {
  // GET
  await test('musebase.getTrack', () => rest.musebase.getTrack(TEST_TRACK_ID));

  if (TEST_PLAYLIST_ID > 0) {
    await test('musebase.getPlaylist', () => rest.musebase.getPlaylist(TEST_PLAYLIST_ID));
  } else {
    skip('musebase.getPlaylist', 'TEST_PLAYLIST_ID not set');
  }

  // POST — creates playlist / adds track
  if (MUTATING) {
    if (TEST_PHOTO_ID) {
      await test('musebase.createPlaylist (POST)', () =>
        rest.musebase.createPlaylist('[api-tester]', '2024', 'test', Number(TEST_PHOTO_ID)),
      );
    } else {
      skip('musebase.createPlaylist (POST)', 'TEST_PHOTO_ID required for cover');
    }
    if (TEST_PLAYLIST_ID > 0) {
      await test('musebase.addTrackToPlaylist (POST)', () =>
        rest.musebase.addTrackToPlaylist(TEST_PLAYLIST_ID, TEST_TRACK_ID),
      );
    } else {
      skip('musebase.addTrackToPlaylist (POST)', 'TEST_PLAYLIST_ID not set');
    }
  } else {
    skipMutating('musebase.createPlaylist (POST)');
    skipMutating('musebase.addTrackToPlaylist (POST)');
  }

  // PATCH
  if (MUTATING && TEST_PLAYLIST_ID > 0 && TEST_PHOTO_ID) {
    await test('musebase.updatePlaylist (PATCH)', () =>
      rest.musebase.updatePlaylist(TEST_PLAYLIST_ID, '[api-tester] updated', '2024', 'updated', Number(TEST_PHOTO_ID)),
    );
  } else {
    skipMutating('musebase.updatePlaylist (PATCH)');
  }
}

// ─── Search ──────────────────────────────────────────────────────────────────
async function testSearch() {
  // POST (search endpoints use POST)
  await test('search.users (POST)',   () =>
    rest.search.users({ sort: 0, country: 0, region: 0, city: 0, worksAt: '', relationships: 0, online: 0, avatar: 0 }),
  );
  await test('search.dialogs (POST)', () =>
    rest.search.dialogs('test', { sort: 0, type: 0, country: 0, topic: 0 }),
  );
  await test('search.tracks (GET)',   () => rest.search.tracks('test'));
}

// ─── Shop ────────────────────────────────────────────────────────────────────
async function testShop() {
  await test('shop.get',       () => rest.shop.get());
  await test('shop.inventory', () => rest.shop.inventory());
}

// ─── Apps ────────────────────────────────────────────────────────────────────
async function testApps() {
  // GET
  await test('apps.getAll', () => rest.apps.getAll());

  if (TEST_APP_KEY) {
    await test('apps.get',       () => rest.apps.get(TEST_APP_KEY));
    await test('apps.getToken',  () => rest.apps.getToken(TEST_APP_KEY));
    await test('apps.getTokens', () => rest.apps.getTokens(TEST_APP_KEY));
  } else {
    skip('apps.get',       'TEST_APP_KEY not set');
    skip('apps.getToken',  'TEST_APP_KEY not set');
    skip('apps.getTokens', 'TEST_APP_KEY not set');
  }

  // POST — creates real app
  if (MUTATING) {
    await test('apps.create (POST)', () =>
      rest.apps.create({ name: '[api-tester]', redirectUrl: 'https://example.com/callback' }),
    );
  } else {
    skipMutating('apps.create (POST)');
  }
}

// ─── Run all ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Yurba API Tester');
  console.log(`   Mutating tests (POST/PATCH): ${MUTATING ? '✅ enabled' : '⚠️  disabled (set ENABLE_MUTATING=true)'}\n`);

  const modules: [string, () => Promise<void>][] = [
    ['Account',  testAccount],
    ['Users',    testUsers],
    ['Posts',    testPosts],
    ['Dialogs',  testDialogs],
    ['Photos',   testPhotos],
    ['Files',    testFiles],
    ['Video',    testVideo],
    ['Musebase', testMusebase],
    ['Search',   testSearch],
    ['Shop',     testShop],
    ['Apps',     testApps],
  ];

  for (const [name, fn] of modules) {
    console.log(`\n── ${name} ──`);
    const before = results.length;
    await fn();
    for (const r of results.slice(before)) {
      console.log(`  ${r.status} ${r.name}${r.detail ? `  →  ${r.detail}` : ''}`);
    }
  }

  const passed  = results.filter(r => r.status === '✅').length;
  const failed  = results.filter(r => r.status === '❌').length;
  const skipped = results.filter(r => r.status === '⚠️').length;

  console.log('\n══════════════ SUMMARY ══════════════');
  console.log(`✅ ${passed}  ❌ ${failed}  ⚠️  ${skipped}  (total: ${results.length})`);

  if (failed > 0) process.exit(1);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
