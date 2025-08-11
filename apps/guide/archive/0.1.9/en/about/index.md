<script setup>
import { VPTeamMembers } from 'vitepress/theme'
import { onMounted } from 'vue'

const avatars = ['/rastgame.jpg', '/rastgame.jpeg']

const members = [
  {
    avatar: avatars[Math.floor(Math.random() * avatars.length)],
    name: 'RastGame',
    title: 'Founder | developer | tester | others..',
    links: [
      { icon: 'github', link: 'https://github.com/rastgame' },
      { icon: 'https://yurba.js.org/icons/yurba.svg', link: 'https://github.com/rastgame' }
    ]
  }
]

</script>

# About Yurba.js

## Team

<VPTeamMembers size="small" :members />

Currently, the entire project is created, maintained, and developed by the founder - [RastGame](https://github.com/rastgame).

## Goal

Our goal is simple: to provide developers working with api.yurba.one a convenient and simple library with all the necessary functionality. This library is designed not only for bot developers but also for anyone who needs integration with api.yurba.one. That's why all packages are independent: [REST](https://github.com/yurbajs/yurba.js/tree/main/packages/rest) is exclusively for working with the Yurba API, while the main library [Yurba.js](https://github.com/yurbajs/yurba.js/tree/main/packages/yurba.js) is for creating bots. We believe in:

- **Simplicity** - Making bot development accessible to developers of all skill levels
- **Productivity** - Ensuring speed and efficiency of our library
- **Reliability** - Creating stable tools that developers can rely on
- **Community** - Developing a completely open project where [all code is available for review](https://github.com/yurbajs) under the [Apache 2.0](https://github.com/yurbajs/yurba.js/blob/main/LICENSE) license and [anyone can propose solutions to problems](https://github.com/yurbajs/yurba.js/issues) or [code improvements](https://github.com/yurbajs/yurba.js/pulls)

## History

From the beginning, the library was created as a client for Yurba, but over time it evolved into a full-fledged monorepo project [with its own packages](https://github.com/yurbajs/yurba.js?tab=readme-ov-file#packages), [guide](https://yurba.js.org/), and [documentation](https://yurba.js.org/docs)

## Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated. Check out our [Contributing Guide](https://github.com/yurbajs/yurba.js/blob/main/CONTRIBUTING.md) to get started.

## Support

If you need help with Yurba.js, there are several ways to get support:

- Join our [Chat](https://me.yurba.one/yurba.js) for real-time assistance
- Check the [Documentation](https://yurba.js.org/docs) for guides and API references
- Open an [Issue](https://github.com/yurbajs/yurba.js/issues) on GitHub for bug reports or feature requests

## License

Yurba.js is fully licensed under the [Apache 2.0](https://github.com/yurbajs/yurba.js/blob/main/LICENSE) license without exception.