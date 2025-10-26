---
layout: home

hero:
  name: "Yurba.js"
  text: "Bot Development Library"
  tagline: "The powerful library for creating bots and integrating with the Yurba API"
  image:
    src: /banner.svg
    alt: Banner Yurba.js 

  actions:
    - theme: brand
      text: Get Started
      link: /docs/
    - theme: alt
      text: Guide
      link: https://yurba.js.org/
    - theme: alt
      icon: github
      text: GitHub
      link: https://github.com/yurbajs/yurba.js

HeroActions:
  - text: Посібник
    link: /uk/introduction
    theme: brand
  - text: Документація
    link: https://yurbajs.pages.dev/
    theme: alt
    external: true
  - text: NPM
    link: https://www.npmjs.com/package/yurba.js
    icon: /icons/npm.svg
  - text: GitHub
    link: https://github.com/yurbajs/yurba.js
    icon: /icons/github-mark.svg
  - text: Yurba
    link: https://me.yurba.one/yurbajs
    icon: /icons/yurba-blue.svg
    darkIcon: /icons/yurba.svg

features:
  - icon: 
      src: /icons/yurba-developers.png
    title: 100% Yurba API coverage
    details: Provides access to all Yurba.one methods and endpoints.
  - icon: 
      src: /icons/light-bulb.png
    title: Intuitive
    details: Simple, easy to start, minimal setup — straightforward, fast, logical.
  - icon: 
      src: /icons/col-resize.png
    title: Full typing
    details: Complete and accurate typing for all API structures and requests.
  - icon: 
      src: /icons/blocks.png
    title: Modular architecture
    details: Independent packages combined into a single logical library.
  - icon:
      src: /icons/sparkle.png
    title: Continuous development
    details: We take it and make it happen.
  - icon:
      src: /icons/star.png
    title: The first and only one
    details: The very first and only full-featured library for integration with Yurba.one.

---

## Quick Start

::: code-group

```bash [npm]
npm install yurba.js
```

```bash [yarn]
yarn add yurba.js
```

```bash [pnpm]
pnpm add yurba.js
```

```bash [bun]
bun add yurba.js
```

:::

```typescript
import { Client } from 'yurba.js';

const client = new Client('token');

client.on('message', (message) => {
  if (message.Text === '!ping') {
    message.reply('pong!');
  }
});

client.init();
```

## Packages

| Package | Description | Version |
|---------|-------------|----------|
| [`yurba.js`](https://www.npmjs.com/package/yurba.js) | Main library for bot development | [![npm](https://img.shields.io/npm/v/yurba.js)](https://www.npmjs.com/package/yurba.js) |
| [`@yurbajs/rest`](https://www.npmjs.com/package/@yurbajs/rest) | REST client for Yurba API | [![npm](https://img.shields.io/npm/v/@yurbajs/rest)](https://www.npmjs.com/package/@yurbajs/rest) |
| [`@yurbajs/ws`](https://www.npmjs.com/package/@yurbajs/ws) | WebSocket client for real-time events | [![npm](https://img.shields.io/npm/v/@yurbajs/ws)](https://www.npmjs.com/package/@yurbajs/ws) |
| [`@yurbajs/types`](https://www.npmjs.com/package/@yurbajs/types) | TypeScript definitions | [![npm](https://img.shields.io/npm/v/@yurbajs/types)](https://www.npmjs.com/package/@yurbajs/types) |
