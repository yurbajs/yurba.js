import { EventEmitter } from 'events';
import { REST } from '@yurbajs/rest';
import { 
  Message, 
  User, 
  Author, 
  DialogInfo, 
  MessageType, 
  DialogType,
  RelationshipState,
  Status,
  Online
} from '@yurbajs/types';

// Valid token for testing
export const VALID_TOKEN = 'y.AjqFIO1riKbU0ObhVXHscgnAC1LoZweW123456789';

// Mock user data
export const mockUser: User = {
  ID: 1,
  Name: 'TestBot',
  Surname: 'Bot',
  Link: 'testbot',
  RegisterDate: Math.floor(Date.now() / 1000),
  Avatar: 123,
  Banner: 0,
  CosmeticAvatar: 0,
  Status: 'Active Bot',
  About: 'Test bot for Yurba.js unit tests',
  Emoji: '',
  Creative: false,
  Ban: false,
  Deleted: false,
  Reports: 0,
  Country: 0,
  Region: 0,
  City: 0,
  CityNative: '',
  Birthday: '',
  Website: '',
  WorksAt: '',
  Languages: [],
  Sub: 0, // Subscription.None
  Verify: 'None' as any, // Using 'None' from Verification enum
  Coins: 0,
  Posts: 0,
  Friends: 0,
  Followers: 0,
  Online: {
    Online: true,
    LastBeen: Math.floor(Date.now() / 1000),
    Degree: '',
    Status: Status.Online
  },
  OriginalAccount: 0,
  RelationshipState: RelationshipState.None,
  PostState: 0, // Privacy.All
  CommentsState: 0, // Privacy.All
  AddFriendState: true,
  ViewFriendsState: 0, // Privacy.All
  SendMessageState: 0, // Privacy.All
  ViewAvatarState: 0, // Privacy.All
  ViewBirthdayState: 0, // Privacy.All
  SearchState: true,
  OnlineType: 0, // OnlineDisplayType.Default
  // Optional properties
  Email: 'test@example.com'
};

// Mock author data
export const mockAuthor: Author = {
  ID: mockUser.ID,
  Name: mockUser.Name,
  Surname: mockUser.Surname,
  Link: mockUser.Link,
  Avatar: mockUser.Avatar,
  Sub: 0, // Subscription.None
  Creative: 0,
  Verify: 'None' as any, // Using 'None' from Verification enum
  Ban: 0,
  Deleted: 0,
  Reports: 0,
  Emoji: '',
  CosmeticAvatar: 0,
  Online: {
    Online: true,
    LastBeen: Math.floor(Date.now() / 1000),
    Degree: '',
    Status: Status.Online
  },
  CommentsState: 0,
  ViewAvatarState: 0,
  RelationshipState: RelationshipState.None
};

// Mock dialog data
export const mockDialog: DialogInfo = {
  ID: 1,
  Name: 'Test Dialog',
  Type: DialogType.Private,
  Avatar: 123
};

// Mock message data
export const createMockMessage = (text: string = 'Test message', isCommand: boolean = false): Message => ({
  ID: Math.floor(Math.random() * 1000),
  Text: isCommand ? `/test ${text}` : text,
  Author: mockAuthor,
  Dialog: mockDialog,
  Type: 'message',
  Photos: [],
  ReplyTo: null,
  Attachments: [],
  Views: 0,
  Timestamp: Math.floor(Date.now() / 1000),
  EditTimestamp: Math.floor(Date.now() / 1000),
  Read: false
});

// Mock REST client
export class MockREST extends EventEmitter {
  users = {
    getMe: jest.fn().mockResolvedValue(mockUser),
    getByTag: jest.fn().mockImplementation((tag: string) => {
      if (tag === mockUser.Link) {
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    })
  };
  
  messages = {
    send: jest.fn().mockImplementation((dialogId, text) => {
      return Promise.resolve(createMockMessage(text));
    }),
    delete: jest.fn().mockResolvedValue(true),
    getMessages: jest.fn().mockResolvedValue([createMockMessage()])
  };
  
  media = {
    getPhoto: jest.fn().mockResolvedValue({ ID: 'photo1', URL: 'https://example.com/photo.jpg' })
  };
  
  dialogs = {
    getDialogs: jest.fn().mockResolvedValue([mockDialog])
  };
}

// Mock WebSocket
export class MockWebSocket extends EventEmitter {
  connect = jest.fn().mockImplementation(() => {
    setTimeout(() => {
      this.emit('ready');
    }, 10);
    return Promise.resolve();
  });
  
  isConnected = jest.fn().mockReturnValue(true);
  
  close = jest.fn();
  
  send = jest.fn();
  
  subscribeToEvents = jest.fn();
  
  unsubscribeFromEvents = jest.fn();
}

// Wait helper
export const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Memory leak detection helper
export const detectMemoryLeak = (emitter: EventEmitter, eventName: string): boolean => {
  const maxListeners = emitter.getMaxListeners();
  const currentListeners = emitter.listenerCount(eventName);
  return currentListeners >= maxListeners;
};

// Mock console methods for testing
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    console.debug = jest.fn();
  });
  
  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  });
};