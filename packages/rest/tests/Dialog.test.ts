import { REST } from '../src/index';
import { DialogResource } from '../src/resources/Dialog';

// Mock fetch globally
global.fetch = jest.fn();

describe('DialogResource', () => {
  let rest: REST;
  let dialogs: DialogResource;

  beforeEach(() => {
    rest = new REST().setToken('y.test-token-1234567890');
    dialogs = rest.dialogs;
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get dialog by id', async () => {
      const mockDialog = { id: 123, name: 'Test Dialog' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockDialog),
      });

      const result = await dialogs.get(123);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/dialogs/123?code='),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            token: 'y.test-token-1234567890',
          }),
        }),
      );
      expect(result).toEqual(mockDialog);
    });

    it('should get dialog with invitation code', async () => {
      const mockDialog = { id: 456, name: 'Private Dialog' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockDialog),
      });

      await dialogs.get(456, 'invite123');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/dialogs/456?code=invite123'),
        expect.any(Object),
      );
    });
  });

  describe('sendMessage', () => {
    it('should send simple text message', async () => {
      const mockMessage = { id: 1, text: 'Hello' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockMessage),
      });

      const result = await dialogs.sendMessage(123, { text: 'Hello' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/dialogs/123/messages'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Hello',
            photos_list: [],
            replyTo: null,
            edit: null,
            attachments: [],
          }),
        }),
      );
      expect(result).toEqual(mockMessage);
    });

    it('should send message with attachments', async () => {
      const mockMessage = { id: 2, text: 'Media' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockMessage),
      });

      await dialogs.sendMessage(123, {
        text: 'Media',
        attachments: [
          { Type: 'video', Item: 28 },
          { Type: 'track', Item: 6422 },
        ],
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/dialogs/123/messages'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Media',
            photos_list: [],
            replyTo: null,
            edit: null,
            attachments: [
              { Type: 'video', Item: 28 },
              { Type: 'track', Item: 6422 },
            ],
          }),
        }),
      );
    });
  });

  describe('create', () => {
    it('should create dialog', async () => {
      const mockResponse = { id: 789, name: 'New Dialog' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify(mockResponse),
      });

      const result = await dialogs.create({
        name: 'New Dialog',
        description: 'Test description',
        type: 'channel',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error for invalid name', async () => {
      await expect(
        dialogs.create({ name: '', type: 'channel' }),
      ).rejects.toThrow('Invalid name');

      await expect(
        dialogs.create({ name: 'a'.repeat(331), type: 'channel' }),
      ).rejects.toThrow('Invalid name');
    });
  });
});
