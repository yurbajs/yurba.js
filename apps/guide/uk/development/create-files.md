---
title: Створення основних файлів бота
editLink: true
sidebar: true
---

# Створення файлів вашого бота

Вітаємо! Тепер ми починаємо створювати код для вашого бота. У нас вже є [config.json](/development/create-project#configuration-file-s) та [.env](/development/create-project#configuration-file-s), і ми налаштували [контроль версій з git](/development/create-project#configuration-file-s).

## Створення `index.js`

::: code-group

```javascript:line-numbers [index.js]
// Import Client from yurba.js
const { Client } = require("yurba.js");

// Load config
const config = require('./config.json');

// Load `.env`
require('dotenv').config()

// Create client (bot) with your token and prefix
const client = new Client({prefix: config.prefix});

// Register first command - ping
client.commands.register('ping', {}, (message, args) => {
    message.reply(`pong!, ${message.Author.Name}`);
});

// First event - ready
// When the bot starts, it will log 'Ready!' to the console
client.once('ready', () => {
    console.log('Ready!');
});

// Initialize the bot (start it)
client.init(process.env.YURBA_TOKEN);

```

```json [config.js]
{
    "prefix": "/"
}
```

```.env [.env]
YURBA_TOKEN=YOUR-TOKEN-HERE
```

```json:line-numbers [package.json]
{
  "name": "my-bot",
  "version": "0.0.1",
  "description": "bot for guide",
  "keywords": [
    "bot",
    "yurbajs",
    "guide-bot"
  ],
  "license": "ISC",
  "author": "RastGame",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "dotenv": "^17.2.0",
    "yurba.js": "^1.0.0-next.15"
  }
}
```
:::


## Додавання start скрипта

```json:line-numbers [package.json]
{
  "name": "my-bot",
  "version": "0.0.1",
  "description": "bot for guide",
  "keywords": [
    "bot",
    "yurbajs",
    "guide-bot"
  ],
  "license": "ISC",
  "author": "RastGame",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js", // [!code ++]
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "dotenv": "^17.2.0",
    "yurba.js": "^1.0.0-next.15"
  }
}
```

## Запуск бота

::: code-group

```bash [npm]
npm start
```

```bash [yarn]
yarn start
```

```bash [pnpm]
pnpm start
```

```bash [bun]
bun start
```

:::

Після запуску ви повинні побачити щось подібне:


```console
λ ~/Projects/yurbajs/examples/guide-bot main* ❯❯ pnpm start

> my-bot@0.0.1 start /Projects/yurbajs/examples/guide-bot
> node index.js

[dotenv@17.2.0] injecting env (1) from .env (tip: ⚙️  enable debug logging with { debug: true })
Ready!
```

Давайте виконаємо нашу першу команду [`/ping`](/development/create-files#creating-index-js)

<img src="/images/ping.png" width="800" alt="Ping!" />

> [!NOTE] Перше досягнення!
> Створення першої команди вашого бота