import { config } from 'dotenv';

// Load environment variables
config();

// Global test configuration
export const TEST_CONFIG = {
  token: process.env.YURBA_TOKEN || '',
  userId: process.env.TEST_USER_ID || '1111',
  postId: process.env.TEST_POST_ID || '3378',
  photoId: process.env.TEST_PHOTO_ID || '3385',
  videoId: process.env.TEST_VIDEO_ID || '28',
  trackId: process.env.TEST_TRACK_ID || '6422',
  fileId: process.env.TEST_FILE_ID || '684',
  dialogId: process.env.TEST_DIALOG_ID || '123',
  appPublicKey: process.env.TEST_APP_PUBLIC_KEY || '',
  timeout: 10000,
};

// Skip tests if no token provided
export const skipIfNoToken = () => {
  if (!TEST_CONFIG.token) {
    console.warn('⚠️  Skipping API tests - no YURBA_TOKEN provided');
    return true;
  }
  return false;
};

// Custom matchers
expect.extend({
  toBeValidYurbaResponse(received) {
    const pass = received && typeof received === 'object';
    return {
      message: () => `expected ${received} to be a valid Yurba API response`,
      pass,
    };
  },

  toHaveYurbaId(received) {
    const pass = received && typeof received.ID === 'number' && received.ID > 0;
    return {
      message: () => `expected ${received} to have a valid Yurba ID`,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidYurbaResponse(): R;
      toHaveYurbaId(): R;
    }
  }
}
