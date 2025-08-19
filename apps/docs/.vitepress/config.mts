import { defineConfig } from 'vitepress';

let typedocSidebar = [];
try {
  typedocSidebar = require('../api/typedoc-sidebar.json');
} catch (e) {
  console.warn('typedoc-sidebar.json not found. Run "pnpm run predocs" first.');
}

export default defineConfig({
  title: 'Yurba.js Documentation',
  description: 'The powerful library for creating bots and integrating with the Yurba API',
  base: '/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' },
      { text: 'Guide', link: 'https://yurba.js.org' }
    ],
    sidebar: {
      '/api/': [
        {
          text: 'API Reference',
          items: typedocSidebar,
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yurbajs/yurba.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/yurba.js' }
    ],
    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2024 RastGame'
    }
  }
});