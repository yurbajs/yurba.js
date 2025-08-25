---
layout: home

hero:
  name: "Yurba.js"
  text: "Bot Development Library"
  tagline: "The powerful library for creating bots and integrating with the Yurba API"
  image:
    src: https://yurba.js.org/banner-white.svg
    alt: Yurba.js
  actions:
    - theme: brand
      text: Get Started
      link: https://yurba.js.org/introduction
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/yurbajs/yurba.js

features:
  - icon: 🚀
    title: Easy to Use
    details: Simple and intuitive API for creating powerful bots with minimal code
  - icon: 🔌
    title: WebSocket & REST
    details: Full support for both real-time WebSocket connections and REST API calls
  - icon: 📝
    title: TypeScript Ready
    details: Built with TypeScript for better development experience and type safety
  - icon: 📦
    title: Modular Design
    details: Separate packages for different functionalities - use only what you need
  - icon: 🔒
    title: Secure
    details: Built-in security features and best practices for bot development
  - icon: 📚
    title: Well Documented
    details: Comprehensive documentation with examples and guides
---

## Quick Start

```bash
npm install yurba.js
# or
pnpm add yurba.js
# or
yarn add yurba.js
```

```typescript
import { Client } from 'yurba.js';

const client = new Client({
  token: 'your-bot-token'
});

client.on('messageCreate', (message) => {
  if (message.Text === 'ping') {
    message.reply('pong!');
  }
});

client.login();
```

## Packages

| Package | Description | Version |
|---------|-------------|----------|
| [`yurba.js`](https://www.npmjs.com/package/yurba.js) | Main library for bot development | [![npm](https://img.shields.io/npm/v/yurba.js)](https://www.npmjs.com/package/yurba.js) |
| [`@yurbajs/rest`](https://www.npmjs.com/package/@yurbajs/rest) | REST client for Yurba API | [![npm](https://img.shields.io/npm/v/@yurbajs/rest)](https://www.npmjs.com/package/@yurbajs/rest) |
| [`@yurbajs/ws`](https://www.npmjs.com/package/@yurbajs/ws) | WebSocket client for real-time events | [![npm](https://img.shields.io/npm/v/@yurbajs/ws)](https://www.npmjs.com/package/@yurbajs/ws) |
| [`@yurbajs/types`](https://www.npmjs.com/package/@yurbajs/types) | TypeScript definitions | [![npm](https://img.shields.io/npm/v/@yurbajs/types)](https://www.npmjs.com/package/@yurbajs/types) |

## Resources

- **[Guide](https://yurba.js.org)** - Complete guide with tutorials and examples
- **[API Reference](/api/)** - Detailed API documentation
- **[Examples](https://github.com/yurbajs/yurba.js/tree/main/examples)** - Example bots and use cases
- **[GitHub](https://github.com/yurbajs/yurba.js)** - Source code and issues
- **[npm](https://www.npmjs.com/package/yurba.js)** - Package on npm registry