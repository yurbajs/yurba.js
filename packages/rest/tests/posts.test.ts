import { REST } from '../src/index';
import { TEST_CONFIG, skipIfNoToken } from './setup';

describe('PostResource', () => {
  let rest: REST;
  let createdPostId: number;

  beforeAll(() => {
    if (!skipIfNoToken()) {
      rest = new REST().setToken(TEST_CONFIG.token);
    }
  });

  describe('Core Methods', () => {
    test('should create a text post', async () => {
      if (skipIfNoToken()) {
        console.log('⏭️  Skipping test - no token provided');
        return;
      }
      
      const post = await rest.posts.create('@me', {
        content: `Jest test post - ${new Date().toISOString()}`,
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: []
      });
      
      expect(post).toBeValidYurbaResponse();
      expect(post).toHaveYurbaId();
      expect(post.Content).toBeDefined();
      
      createdPostId = post.ID;
    });

    test('should get user posts', async () => {
      if (skipIfNoToken()) return;
      
      const posts = await rest.posts.get('@me', {});
      
      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 0) {
        expect(posts[0]).toHaveYurbaId();
        expect(posts[0]).toHaveProperty('Content');
        expect(posts[0]).toHaveProperty('Author');
      }
    });

    test('should create post with photos', async () => {
      if (skipIfNoToken()) return;
      
      const post = await rest.posts.create('@me', {
        content: 'Jest test with photos',
        photos_list: [parseInt(TEST_CONFIG.photoId)],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: []
      });
      
      expect(post).toBeValidYurbaResponse();
      expect(post).toHaveYurbaId();
      expect(post.Photos).toBeDefined();
    });

    test('should create post with attachments', async () => {
      if (skipIfNoToken()) return;
      
      const post = await rest.posts.create('@me', {
        content: 'Jest test with attachments',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: [
          { Type: 'video', Item: parseInt(TEST_CONFIG.videoId) },
          { Type: 'track', Item: parseInt(TEST_CONFIG.trackId) }
        ]
      });
      
      expect(post).toBeValidYurbaResponse();
      expect(post).toHaveYurbaId();
    });

    test('should edit a post', async () => {
      if (skipIfNoToken() || !createdPostId) return;
      
      const editedPost = await rest.posts.edit(createdPostId, {
        content: 'Jest test - edited content',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: []
      });
      
      expect(editedPost).toBeValidYurbaResponse();
      expect(editedPost.ID).toBe(createdPostId);
    });

    test('should delete a post', async () => {
      if (skipIfNoToken() || !createdPostId) return;
      
      const result = await rest.posts.delete(createdPostId);
      
      expect(result).toBeValidYurbaResponse();
      expect(result.ok).toBeDefined();
    });
  });

  describe('Comments Methods', () => {
    test('should get post comments', async () => {
      if (skipIfNoToken()) return;
      
      try {
        const comments = await rest.posts.getComments(parseInt(TEST_CONFIG.postId));
        expect(Array.isArray(comments)).toBe(true);
      } catch (error: any) {
        expect(error.message).toMatch(/Invalid post ID|not found/);
      }
    });

    test('should add comment to post', async () => {
      if (skipIfNoToken()) return;
      
      try {
        const comment = await rest.posts.addComment(
          parseInt(TEST_CONFIG.postId), 
          'Jest test comment'
        );
        expect(comment).toBeValidYurbaResponse();
      } catch (error: any) {
        expect(error.message).toMatch(/Invalid post ID|not found|Access denied/);
      }
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid user', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.posts.create('', { 
        content: 'test',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: []
      })).rejects.toThrow('Invalid user');
    });

    test('should throw error for invalid post data', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.posts.create('@me', { 
        content: '',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: []
      })).rejects.toThrow('Invalid post data');
    });

    test('should throw error for invalid post ID', async () => {
      if (skipIfNoToken()) return;
      
      await expect(rest.posts.delete(0))
        .rejects.toThrow('Invalid post ID');
    });
  });
});