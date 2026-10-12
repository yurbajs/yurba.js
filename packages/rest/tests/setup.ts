import { config } from 'dotenv';

config({ quiet: true });

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

export const skipIfNoToken = () => {
  if (!TEST_CONFIG.token) {
    console.warn('⚠️  Skipping API tests - no YURBA_TOKEN provided');
    return true;
  }
  return false;
};

export interface MockRoute {
  method?: string;
  match: string;
  ok?: boolean;
  status?: number;
  body: unknown;
}

export function installFetchMock(): void {
  global.fetch = jest.fn();
}

export function mockFetchRoutes(routes: MockRoute[]): void {
  (global.fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
    const href = String(url);
    const method = (options?.method || 'GET').toUpperCase();
    const route = routes
      .filter((r) => href.includes(r.match) && (!r.method || r.method.toUpperCase() === method))
      .sort((a, b) => b.match.length - a.match.length)[0];

    if (!route) {
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => JSON.stringify({ detail: 'not_found' }),
      };
    }

    const ok = route.ok ?? true;
    const status = route.status ?? (ok ? 200 : 400);

    return {
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      text: async () =>
        typeof route.body === 'string' ? route.body : JSON.stringify(route.body),
    };
  });
}

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
