export const sidebar = [
  {
    text: 'Welcome',
    collapsed: false,
    items: [
      { text: 'Introduction', link: '/introduction' },
      { text: 'What\'s new', link: '/welcome/whats-new' },
    ],
  },
  {
    text: 'Setup',
    collapsed: false,
    items: [
      { text: 'Installation', link: '/setup/installation' },
      { text: 'Bot account', link: '/setup/setting-up-bot-account' },
      { text: 'Chat', link: '/setup/chat-with-bot' },
    ],
  },
  {
    text: 'Development',
    collapsed: false,
    items: [
      { text: 'Project', link: '/development/create-project' },
      { text: 'Files', link: '/development/create-files' },
      { text: 'Structure', link: '/development/structure' },
    ],
  },
  {
    text: 'Examples',
    collapsed: true,
    items: [
      { text: 'Overview', link: '/examples' },
    ],
  },
];
