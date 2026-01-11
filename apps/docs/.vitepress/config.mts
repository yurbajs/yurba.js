import { defineConfig } from 'vitepress';
import { apiLinksPlugin } from './md/apiLinks';

let typedocSidebar = [];
try {
  typedocSidebar = require('../dist/typedoc-sidebar.json');
} catch (e) {
  console.warn('typedoc-sidebar.json not found. Run "pnpm run predocs" first.');
}

export default defineConfig({
  title: 'Yurba.js',
  description: 'The powerful library for creating bots and integrating with the Yurba API',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#1814ffff' }],
    ['meta', { name: 'author', content: 'RastGame' }],
    ['meta', { name: 'keywords', content: 'yurba.js, yurba, bot, api, javascript, typescript, library' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Yurba.js' }],
    ['meta', { property: 'og:title', content: 'Yurba.js - Powerful Bot Library' }],
    ['meta', { property: 'og:description', content: 'The powerful library for creating bots and integrating with the Yurba API' }],
    ['meta', { property: 'og:image', content: 'https://yurba.js.org/banner.svg' }],
    ['meta', { property: 'og:url', content: 'https://yurba.js.org' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Yurba.js - Powerful Bot Library' }],
    ['meta', { name: 'twitter:description', content: 'The powerful library for creating bots and integrating with the Yurba API' }],
    ['meta', { name: 'twitter:image', content: 'https://yurba.js.org/banner.svg' }],
    ['link', { rel: 'canonical', href: 'https://yurba.js.org' }]
  ],

  srcDir: './dist/',
  rewrites: {
    'dist/:path*': './:path*',
  },
  vite: {
    publicDir: '../public',
  },
 
  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Yurba.js Logo' },

    nav: [
      { text: 'Documentation', link: '/' },
      { text: 'Guide', link: 'https://yurba.js.org' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Documentation',
          items: typedocSidebar,
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yurbajs/yurba.js' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/yurba.js' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3]
    }
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
  }
});