# Yurba.js Documentation

This directory contains the API documentation for Yurba.js, built with [VitePress](https://vitepress.dev/) and [TypeDoc](https://typedoc.org/).

## Development

```bash
# Install dependencies
pnpm install

# Generate API documentation
pnpm run predocs

# Start development server
pnpm run docs:dev

# Build for production
pnpm run docs:build

# Preview production build
pnpm run docs:preview
```

## Structure

- `.vitepress/` - VitePress configuration and theme
- `api/` - Generated API documentation (auto-generated)
- `index.md` - Homepage
- `typedoc.json` - TypeDoc configuration

## Features

- 🎨 Beautiful UI with custom styling
- 🔍 Built-in search functionality
- 📱 Mobile-responsive design
- 🌙 Dark/light theme support
- 🔗 Cross-references and navigation
- 📊 Interactive API documentation