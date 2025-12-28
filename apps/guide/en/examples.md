---
title: Examples
editLink: true
sidebar: true
---

# Examples

Collection of practical examples using yurba.js for creating bots and integrations with Yurba API.

## Basic Examples

### Simple Bot

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '/' });

client.commands.register('ping', {}, (message) => {
    message.reply('Pong!');
});

client.once('ready', () => {
    console.log('Bot is ready!');
});

client.init(process.env.YURBA_TOKEN);
```

### Bot with Commands

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '!' });

// Command with arguments
client.commands.register('say', {
    text: { type: 'string', required: true }
}, (message, args) => {
    message.reply(`You said: ${args.text}`);
});

// User info command
client.commands.register('userinfo', {
    user: { type: 'user', required: false }
}, (message, args) => {
    const user = args.user || message.Author;
    message.reply(`User: ${user.Name}\nID: ${user.Id}`);
});

client.init(process.env.YURBA_TOKEN);
```

### Event Handling

```javascript
const { Client } = require('yurba.js');

const client = new Client({ prefix: '/' });

// New message event
client.on('message', (message) => {
    if (message.Content.includes('hello')) {
        message.reply('Hello! 👋');
    }
});

// Ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.Name}`);
});

client.init(process.env.YURBA_TOKEN);
```

## Usage

All examples are available in the [repository](https://github.com/yurbajs/yurba.js/tree/main/examples).

```bash
git clone https://github.com/yurbajs/yurba.js.git
cd yurba.js/examples/guide-bot
npm install
npm start
```

## Structure

Each example contains:
- Source code with comments
- Configuration file
- Setup instructions
- Usage documentation