---
title: Installing Node.js and yurba.js
editLink: true
sidebar: true
---

# Installing Node.js and yurba.js

Setting up your development environment is the first step toward building powerful bots with yurba.js. This guide will walk you through installing Node.js and the yurba.js library on your system.

## System Requirements

Before we begin, ensure your system meets these requirements:

- **Node.js 20.0.0 or higher** (LTS version recommended)
- **npm, yarn, pnpm, or bun** (package manager)
- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+, CentOS 7+)

## Installing Node.js

Node.js is the JavaScript runtime that powers yurba.js. You'll need to install it before proceeding with the library installation.

::: tip Checking Existing Installation
To verify if Node.js is already installed on your system, open a terminal and run:
```bash
node --version
```
If you see a version number (e.g., `v20.10.0`), Node.js is installed. Ensure it's version 20.0.0 or higher.
:::

### Windows Installation

1. **Download the Installer**
   - Visit the [official Node.js website](https://nodejs.org/en/download)
   - Download the Windows Installer (.msi) for the LTS version
   - Choose the appropriate architecture (x64 for most modern systems)

2. **Run the Installation**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard steps
   - Accept the license agreement
   - Choose the installation directory (default is recommended)
   - Ensure "Add to PATH" is checked

3. **Verify Installation**
   ```bash
   node --version
   npm --version
   ```

#### Windows Path Issues
If Node.js commands aren't recognized in Windows:

1. Open System Properties → Advanced → Environment Variables
2. Ensure `C:\Program Files\nodejs\` is in your PATH
3. Restart your command prompt/PowerShell

### macOS Installation

Choose one of these methods:

#### Option 1: Official Installer
1. Download the macOS installer from [nodejs.org](https://nodejs.org/en/download)
2. Open the `.pkg` file and follow the installation steps
3. Verify the installation in Terminal

#### Option 2: Homebrew (Recommended)
```bash
# Install Homebrew if you haven't already
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

#### Option 3: Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
```

### Linux Installation

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Node.js from NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### CentOS/RHEL/Fedora
```bash
# Install Node.js from NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install -y nodejs npm

# For older systems, use yum instead of dnf
# sudo yum install -y nodejs npm
```

#### Arch Linux
```bash
# Install Node.js and npm
sudo pacman -S nodejs npm

# Verify installation
node --version
npm --version
```

## Installing yurba.js

Once Node.js is properly installed, you can install yurba.js using your preferred package manager. The library is available on npm and supports all major package managers.

::: code-group

```bash [npm]
# Install yurba.js
npm install yurba.js
```

```bash [yarn]
# Install yurba.js
yarn add yurba.js
```

```bash [pnpm]
# Install yurba.js
pnpm add yurba.js
```

```bash [bun]
# Install yurba.js
bun add yurba.js

```

:::

::: tip Recommendation
For new projects, we recommend **[pnpm](https://pnpm.io/)** for its speed and efficiency, or **npm** for its universal compatibility. The [yurba.js](https://github.com/yurbajs/yurba.js) project itself uses pnpm.
:::

## Installing dotenv

For secure environment variable management, we recommend installing [dotenv](https://www.npmjs.com/package/dotenv). This package allows you to load environment variables from a `.env` file into `process.env`.

::: code-group

```bash [npm]
npm install dotenv
```

```bash [yarn]
yarn add dotenv
```

```bash [pnpm]
pnpm add dotenv
```

```bash [bun]
# Note: Bun has built-in .env support, but you can still use dotenv if needed
bun add dotenv
```

:::



### Verifying Installation

After installation, verify that yurba.js is properly installed:

**Check Package Installation**
    
::: code-group

   ```sh [npm]
   npm list
   ```

   ```sh [pnpm]
   pnpm list 
   ```

   ```sh [yarn]
   yarn list 
   ```

   ```sh [bun]
   bun list y
   ```
   :::

```console
λ ~/Projects/yurbajs/examples/guide-bot main* ❯❯ pnpm list
Legend: production dependency, optional only, dev only

my-bot@0.0.1 /Projects/yurbajs/examples/guide-bot

dependencies:
dotenv 17.2.0
yurba.js 0.1.9
```

## Next Steps

Congratulations! You now have Node.js and yurba.js installed on your system. You're ready to move on to the next step: [setting up your bot account](/setup/setting-up-bot-account).

## Additional Resources

- **[Node.js Documentation](https://nodejs.org/docs/latest/api/)** - Official Node.js documentation
- **[npm Documentation](https://docs.npmjs.com/)** - Package manager documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - If you plan to use TypeScript
- **[Vscodium](https://vscodium.com/)** - Recommended code editor  (`Free/Libre Open Source Software Binaries of VS Code`)
