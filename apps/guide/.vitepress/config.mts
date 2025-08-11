import { defineConfig } from 'vitepress'
import versions from './versions.json'
import links from './links.json'
import { sidebar } from './sidebar'
import { t, createNavItem } from './utils/i18n'

export default defineConfig({
  title: "Yurba.js",
  titleTemplate: ":title",
  description: "The powerful library for creating bots and integrating with the Yurba API",
  base: '/',
  cleanUrls: false,
  ignoreDeadLinks: [
    './LICENSE',
    './README.md',
    /^https?:\/\/localhost/,
    /\/repl\//,
    (url) => {
      return url.toLowerCase().includes('ignore')
    }
  ],
  metaChunk: false,
  sitemap: {
    hostname: 'https://yurba.js.org',
    xslUrl: "/sitemap.xsl",
    lastmodDateOnly: false,
    xmlns: {
      news: false,
      xhtml: false,
      image: false,
      video: false,
      custom: [
        'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"',
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
      ],
    },
    transformItems: (items) => {
      const urlMap = new Map()

      items.forEach(item => {
        // Normalize URL
        let url = item.url.trim()
        if (!url.startsWith('/')) url = '/' + url
        if (url.toLowerCase() === '/readme') return // Skip
        if (url.toLowerCase() === '/docs') return // Skip redirect
        // else if (!url.endsWith('.html')) url = `${url}.html`
        if (url === '/index' || url === '/') url = '/'

        urlMap.set(url, {
          url: `https://yurba.js.org${url}`,
          changefreq: item.changefreq || 'monthly',
          priority: item.priority || 0.5,
          lastmod: item.lastmod || new Date().toISOString()
        })
      })

      // Set priorities and frequencies
      urlMap.forEach((item, url) => {
        const cleanUrl = url.replace(/^\/(uk|en|fr)?\/?/, '/')

        if (cleanUrl === '/') {
          item.priority = 1.0
          item.changefreq = 'monthly'

        } else if (cleanUrl === '/introduction') {
          item.priority = 0.8
          item.changefreq = 'monthly'
        } else if (cleanUrl === '/getting-started') {
          item.priority = 0.8
          item.changefreq = 'monthly'
        } else if (cleanUrl.startsWith('/setup/')) {
          item.priority = 0.7
          item.changefreq = 'monthly'
        } else if (cleanUrl.startsWith('/development/')) {
          item.priority = 0.6
          item.changefreq = 'monthly'
        } else if (cleanUrl.startsWith('/welcome/')) {
          item.priority = 0.5
          item.changefreq = 'monthly'
        }
      })

      return Array.from(urlMap.values())
    }
  },

  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#00c7be' }],
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
  
  srcDir: '.',
  rewrites: {
    'en/:path*': ':path*',
    'archive/:version/en/:path*': 'archive/:version/:path*'
  },
  
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Yurba.js',
      titleTemplate: ':title',
      description: 'The powerful library for creating bots and integrating with the Yurba API',
      themeConfig: {
        nav: [
          createNavItem('nav.guide', '/introduction'),
          { text: t('nav.documentation'), link: links.docs },
          createNavItem('nav.examples', '/examples'),
          {
            text: `v${versions.current}`,
            items: [
              { text: t('nav.changelog'), link: links.changelog },
              ...versions.versions.map(v => ({
                text: v.archived ? `${v.label} (archived)` : v.label,
                link: v.path
              }))
            ]
          }
        ],
        
        outline: {
          level: [2, 3],
          label: t('ui.onThisPage', 'en')
        },
        
        lastUpdated: {
          text: t('ui.updated', 'en')
        },
        
        docFooter: {
          prev: t('ui.prevPage', 'en'),
          next: t('ui.nextPage', 'en')
        },
        
        darkModeSwitchLabel: t('ui.appearance', 'en'),
        lightModeSwitchTitle: t('ui.lightTheme', 'en'),
        darkModeSwitchTitle: t('ui.darkTheme', 'en'),
        
        editLink: {
          pattern: `${links.github}/edit/main/apps/guide/:path`,
          text: t('ui.editPage', 'en')
        },
        
        notFound: {
          title: t('notFound.title', 'en'),
          quote: t('notFound.quote', 'en'),
          linkText: t('notFound.linkText', 'en'),
          linkLabel: t('notFound.linkText', 'en')
        }
      }
    },
    uk: {
      label: 'Українська',
      lang: 'uk',
      title: 'Yurba.js',
      titleTemplate: ':title',
      description: 'Потужна бібліотека для створення ботів та інтеграції з Yurba API',
      head: [
        ['meta', { property: 'og:title', content: 'Yurba.js - Потужна бібліотека для ботів' }],
        ['meta', { property: 'og:description', content: 'Потужна бібліотека для створення ботів та інтеграції з Yurba API' }],
        ['meta', { name: 'twitter:title', content: 'Yurba.js - Потужна бібліотека для ботів' }],
        ['meta', { name: 'twitter:description', content: 'Потужна бібліотека для створення ботів та інтеграції з Yurba API' }]
      ],
      themeConfig: {
        nav: [
          createNavItem('nav.guide', '/introduction', 'uk'),
          { text: t('nav.documentation', 'uk'), link: links.docs },
          createNavItem('nav.examples', '/examples', 'uk'),
          {
            text: `v${versions.current}`,
            items: [
              { text: t('nav.changelog', 'uk'), link: links.changelog },
              ...versions.versions.map(v => ({
                text: v.archived ? `${v.label.replace('current', 'поточна')} (архів)` : v.label.replace('current', 'поточна'),
                link: v.path === '/' ? '/uk/' : `/uk${v.path}`
              }))
            ]
          }
        ],
        outline: {
          label: t('ui.onThisPage', 'uk')
        },
        lastUpdated: {
          text: t('ui.updated', 'uk')
        },
        docFooter: {
          prev: t('ui.prevPage', 'uk'),
          next: t('ui.nextPage', 'uk')
        },
        darkModeSwitchLabel: t('ui.appearance', 'uk'),
        lightModeSwitchTitle: t('ui.lightTheme', 'uk'),
        darkModeSwitchTitle: t('ui.darkTheme', 'uk'),
        returnToTopLabel: 'Повернутися до початку',
        sidebarMenuLabel: 'Меню',
        editLink: {
          pattern: `${links.github}/edit/main/apps/guide/:path`,
          text: t('ui.editPage', 'uk')
        },
        notFound: {
          title: t('notFound.title', 'uk'),
          quote: t('notFound.quote', 'uk'),
          linkText: t('notFound.linkText', 'uk'),
          linkLabel: t('notFound.linkText', 'uk')
        }
      }
    },
    'help-translate': {
      label: t('nav.help_translate'),
      link: 'https://crowdin.com/project/yurbajs?s=https://yurba.js.org'
    }
  },

  themeConfig: {
    logo: { src: '/logo.png', alt: 'Yurba.js Logo' },
    
    sidebar: {
      '/': createSidebar('en'),
      '/uk/': createSidebar('uk')
    },

    aside: true,

    search: {
      provider: 'local',
      options: {
        miniSearch: {
          searchOptions: {
            combineWith: 'AND',
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 }
          }
        },
        _render(src, env, md) {
          const html = md.render(src, env)
          if (env.frontmatter?.search === false) return ''
          if (env.relativePath.startsWith('uk/')) {
            return html
          }
          return html
        },
        locales: {
          uk: {
            translations: {
              button: {
                buttonText: 'Пошук',
                buttonAriaLabel: 'Пошук документації'
              },
              modal: {
                displayDetails: 'Показати детальний список',
                resetButtonTitle: 'Скинути пошук',
                backButtonTitle: 'Закрити пошук',
                noResultsText: 'Немає результатів для',
                footer: {
                  selectText: 'вибрати',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'навігувати',
                  navigateUpKeyAriaLabel: 'стрілка вгору',
                  navigateDownKeyAriaLabel: 'стрілка вниз',
                  closeText: 'закрити',
                  closeKeyAriaLabel: 'escape'
                }
              }
            }
          },
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search docs'
              },
              modal: {
                displayDetails: 'Display detailed list',
                resetButtonTitle: 'Reset search',
                backButtonTitle: 'Close search',
                noResultsText: 'No results for',
                footer: {
                  selectText: 'to select',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'to navigate',
                  navigateUpKeyAriaLabel: 'up arrow',
                  navigateDownKeyAriaLabel: 'down arrow',
                  closeText: 'to close',
                  closeKeyAriaLabel: 'escape'
                }
              }
            }
          }
        }
      }
    },

    socialLinks: [
      { icon: 'github', link: links.github, ariaLabel: 'GitHub Repository' },
      { icon: 'npm', link: links.npm, ariaLabel: 'NPM Package' }
    ],

    footer: {
      message: 'Released under the Apache-2.0 License.',
      copyright: 'Copyright © 2025 RastGame'
    },

    externalLinkIcon: true,
  }
})

// Helper function to create localized sidebar
function createSidebar(lang: 'en' | 'uk') {
  return [
    {
      text: lang === 'uk' ? t('sidebar.guide', 'uk') : t('sidebar.guide', 'en'),
      collapsed: false,
      items: [
        { 
          text: lang === 'uk' ? t('sidebar.introduction', 'uk') : t('sidebar.introduction', 'en'), 
          link: lang === 'uk' ? '/uk/introduction' : '/introduction' 
        },
        { 
          text: "What's new", 
          link: lang === 'uk' ? '/uk/welcome/whats-new' : '/welcome/whats-new' 
        }
      ]
    },
    {
      text: 'Setup',
      collapsed: false,
      items: [
        { 
          text: lang === 'uk' ? t('sidebar.installation', 'uk') : t('sidebar.installation', 'en'), 
          link: lang === 'uk' ? '/uk/setup/installation' : '/setup/installation' 
        },
        { 
          text: 'Bot account', 
          link: lang === 'uk' ? '/uk/setup/setting-up-bot-account' : '/setup/setting-up-bot-account' 
        },
        { 
          text: 'Chat', 
          link: lang === 'uk' ? '/uk/setup/chat-with-bot' : '/setup/chat-with-bot' 
        }
      ]
    },
    {
      text: 'Development',
      collapsed: false,
      items: [
        { 
          text: 'Project', 
          link: lang === 'uk' ? '/uk/development/create-project' : '/development/create-project' 
        },
        { 
          text: 'Files', 
          link: lang === 'uk' ? '/uk/development/create-files' : '/development/create-files' 
        },
        { 
          text: 'Structure', 
          link: lang === 'uk' ? '/uk/development/structure' : '/development/structure' 
        }
      ]
    },
    {
      text: lang === 'uk' ? t('sidebar.examples', 'uk') : t('sidebar.examples', 'en'),
      collapsed: true,
      items: [
        { 
          text: lang === 'uk' ? t('sidebar.overview', 'uk') : t('sidebar.overview', 'en'), 
          link: lang === 'uk' ? '/uk/examples' : '/examples' 
        }
      ]
    }
  ]
}