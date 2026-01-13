import { defineConfig } from 'vitepress';
import { apiLinksPlugin } from './md/apiLinks';

let typedocSidebar = [];
try {
  const rawSidebar = require('../dist/typedoc-sidebar.json');
  const packageOrder = ['yurba.js', '@yurbajs/rest', '@yurbajs/ws', '@yurbajs/types'];

  // Create a dictionary for sidebars based on paths
  typedocSidebar = {};

  rawSidebar.forEach(pkg => {
    // Determine the path key. Assuming links start with /<package_name>/
    // We can use the link of the package entry itself if it exists, or derive it.
    // Based on the JSON, the top level items have a link like /@yurbajs/rest/
    if (pkg.link) {
      // Ensure the key ends with / to match directory
      const key = pkg.link.endsWith('/') ? pkg.link : pkg.link + '/';
      // The items for this sidebar are the children of the package entry
      // We also want to include the package entry itself as a header or just its children?
      // Usually, if we are in /@yurbajs/rest/, we want to see the items OF that package.
      // The top level item in rawSidebar IS the package.
      // So we can set the sidebar for that path to be the items of that package.
      typedocSidebar[key] = pkg.items || [];

      // Add default sidebar for root
      if (pkg.text === 'yurba.js') {
        typedocSidebar['/'] = pkg.items || [];
      }
    }
  });
} catch (e) {
  console.warn('typedoc-sidebar.json not found or invalid. Run "pnpm run predocs" first.', e);
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
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'Yurba.js Logo' },

    nav: [
      { text: 'Documentation', link: '/' },
      { text: 'Guide', link: 'https://yurba.js.org' },
    ],
    sidebar: typedocSidebar,
    docFooter: {
      prev: false,
      next: false
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