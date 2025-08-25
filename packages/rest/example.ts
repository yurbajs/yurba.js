import REST from '@yurbajs/rest';
// або import { REST } from '@yurbajs/rest';

const client = REST.create('ytoken123', {
  timeout: 10000,
  debug: true
});

// Базові операції
const user = await client.users.get(123);
const me = await client.users.getMe();

// Пости
const post = await client.posts.create({ text: 'Hello!', type: 'text' });
const posts = await client.posts.list({ limit: 10 });

// Діалоги
const dialogs = await client.dialogs.list();
await client.dialogs.sendMessage(456, { text: 'Hi!', type: 'text' });

// Фото
const formData = new FormData();
formData.append('file', file);
const photo = await client.photos.upload(formData);

// Кеш та налаштування
client.setRateLimit({ maxRequests: 50, windowMs: 60000 });
const cached = client.getCachedUser('token');
client.clearCache();