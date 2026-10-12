import { REST } from '../src/index';
import { TEST_CONFIG, installFetchMock, mockFetchRoutes } from './setup';

const me = {
  ID: 1111,
  Name: 'Test',
  Surname: 'User',
  Link: 'tester',
  Avatar: 1,
};

const post = {
  ID: Number(TEST_CONFIG.postId),
  Content: 'Hello',
  Author: me,
};

describe('PostResource', () => {
  let rest: REST;

  beforeEach(() => {
    installFetchMock();
    rest = new REST().setToken('y.test-token-1234567890');
  });

  describe('Core Methods', () => {
    test('should get user posts', async () => {
      mockFetchRoutes([
        { match: '/get_me', body: me },
        { match: `/user/${me.ID}/posts`, body: [post] },
      ]);

      const posts = await rest.posts.get('@me', {});

      expect(Array.isArray(posts)).toBe(true);
      if (posts.length > 0) {
        expect(posts[0]).toHaveYurbaId();
        expect(posts[0]).toHaveProperty('Content');
        expect(posts[0]).toHaveProperty('Author');
      }
    });
  });

  describe('Comments Methods', () => {
    test('should get post comments', async () => {
      mockFetchRoutes([{
        match: `/posts/${TEST_CONFIG.postId}/comments`,
        body: [{ ID: 1, Content: 'Nice' }],
      }]);

      const comments = await rest.posts.getComments(parseInt(TEST_CONFIG.postId));
      expect(Array.isArray(comments)).toBe(true);
    });

    test('should add comment to post', async () => {
      mockFetchRoutes([{
        match: `/posts/${TEST_CONFIG.postId}/comment`,
        method: 'POST',
        body: { ID: 2, Content: 'Jest test comment' },
      }]);

      const comment = await rest.posts.addComment(
        parseInt(TEST_CONFIG.postId),
        'Jest test comment',
      );
      expect(comment).toBeValidYurbaResponse();
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid user', async () => {
      await expect(rest.posts.create('', {
        content: 'test',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: [],
      })).rejects.toThrow('Invalid user');
    });

    test('should throw error for invalid post data', async () => {
      await expect(rest.posts.create('@me', {
        content: '',
        photos_list: [],
        language: 1,
        nsfw: false,
        edit: null,
        repost: null,
        timestamp: 0,
        attachments: [],
      })).rejects.toThrow('Invalid post data');
    });

    test('should throw error for invalid post ID', async () => {
      await expect(rest.posts.delete(0))
        .rejects.toThrow('Invalid post ID');
    });
  });
});
