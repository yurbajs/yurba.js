---
title: Creating main Bot Files
editLink: true
sidebar: true
---

# Creating Your Bot Files

Welcome! We're now starting to create code for your bot. We already have [config.json](/development/create-project#configuration-file-s) and [.env](/development/create-project#configuration-file-s), and we've set up [version control with git](/development/create-project#configuration-file-s).

## Creating `index.js`

::: code-group

```javascript:line-numbers [index.js]
// Import Client from yurba.js
const { Client } = require("yurba.js");

// Load config
const config = require('./config.json');

// Load `.env`
require('dotenv').config()

// Create client (bot) with your token and prefix
const client = new Client(process.env.YURBA_TOKEN, {prefix: config.prefix});

// Register first command - ping
client.registerCommand('ping', {}, (message, args) => {
    message.reply(`pong!, ${message.Author.Name}`);
});

// First event - ready
// When the bot starts, it will log 'Ready!' to the console
client.once('ready', () => {
    console.log('Ready!');
});

// Initialize the bot (start it)
client.init();

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
    "yurba.js": "^0.1.9"
  }
}
```
:::


## Add start script

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
    "yurba.js": "^0.1.9"
  }
}
```

## Start the bot

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

After starting, you should see something like this:


```console
λ ~/Projects/yurbajs/examples/guide-bot main* ❯❯ pnpm start

> my-bot@0.0.1 start /Projects/yurbajs/examples/guide-bot
> node index.js

[dotenv@17.2.0] injecting env (1) from .env (tip: ⚙️  enable debug logging with { debug: true })
Ready!
```

Let's execute our first command [`/ping`](/development/create-files#creating-index-js)

<img src="/images/ping.png" width="800" alt="Ping!" />

> [!NOTE] First achievement!
> Creating your bot's first command