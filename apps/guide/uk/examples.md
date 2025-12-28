---
title: Приклади
editLink: true
sidebar: true
---

# Приклади

Колекція практичних прикладів використання yurba.js для створення ботів та інтеграцій з Yurba API.

## Базові приклади

### Простий бот

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '/' });

client.commands.register('ping', {}, (message) => {
    message.reply('Pong!');
});

client.once('ready', () => {
    console.log('Бот готовий!');
});

client.init(process.env.YURBA_TOKEN);
```

### Бот з командами

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '!' });

// Команда з аргументами
client.commands.register('say', {
    text: { type: 'string', required: true }
}, (message, args) => {
    message.reply(`Ви сказали: ${args.text}`);
});

// Команда інформації про користувача
client.commands.register('userinfo', {
    user: { type: 'user', required: false }
}, (message, args) => {
    const user = args.user || message.Author;
    message.reply(`Користувач: ${user.Name}\nID: ${user.Id}`);
});

client.init(process.env.YURBA_TOKEN);
```

### Обробка подій

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '/' });

// Подія нового повідомлення
client.on('message', (message) => {
    if (message.Content.includes('привіт')) {
        message.reply('Привіт! 👋');
    }
});

// Подія готовності
client.once('ready', () => {
    console.log(`Увійшов як ${client.user.Name}`);
});

client.init(process.env.YURBA_TOKEN);
```

## Використання

Всі приклади доступні в [репозиторії](https://github.com/yurbajs/yurba.js/tree/main/examples).

```bash
git clone https://github.com/yurbajs/yurba.js.git
cd yurba.js/examples/guide-bot
npm install
npm start
```

## Структура

Кожен приклад містить:
- Вихідний код з коментарями
- Файл конфігурації
- Інструкції по запуску
- Документацію по використанню