---
title: Creating Your Bot Project
editLink: true
sidebar: true
---

# Creating Your Bot Project

Now that you have Node.js installed and your bot account configured, it's time to create your first yurba.js project. This guide will walk you through setting up a professional project structure with proper configuration management and security practices.

## Project Initialization

### Step 1: Create Project Directory

First, create a dedicated directory/folder for your bot project:

```sh
cd my-yurba-bot
```

### Step 2: Initialize Package.json

Initialize your Node.js project using your preferred package manager:

::: code-group

```bash [npm]
npm init
```

```bash [yarn]
yarn init
```

```bash [pnpm]
pnpm init
```

```bash [bun]
bun init
```

:::

You'll be prompted to fill out project information. Here's an example configuration:

<img src="/images/npm-init.png" width="700" alt="npm init process" />


### Step 3: Verify Package.json

After initialization, your `package.json` should look similar to this:

```json:line-numbers [package.json]
{
  "name": "my-yurba-bot",
  "version": "1.0.0",
  "description": "A powerful bot built with yurba.js",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["yurba", "bot", "yurba.js", "automation"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Configuration Files

Create a `.env` file and the `config.json` file

::: code-group

```sh:line-numbers [.env]
YURBA_TOKEN=your-token-here
```

```json [config.json]
{
  "prefix": "/"
}
```

:::


::: danger Security Warning
Never commit sensitive files like [`.env`](/development/create-project#create-gitignore) or [`config.json`](/development/create-project#create-gitignore) containing tokens to version control. These files contain private credentials that should be kept secure.

Make sure to add these files to your [`.gitignore`](/development/create-project#create-gitignore) to prevent accidental commits.
:::

## Git Setup

> [!NOTE] What is Git?
> [Git](https://git-scm.com/about/1) is a distributed version control system that helps you track changes in your code, collaborate with others, and manage different versions of your project.

### Initialize Git

```bash
git init
```
::: tip
If you use [GitHub](https://github.com) or [GitLab](https://gitlab.com), you can initialize your repository with these commands:

::: code-group

```sh [GitHub]
git remote add origin https://github.com/username/repository-name.git
git branch -M main
git push -u origin main
```

```sh [GitLab]
git remote add origin https://gitlab.com/username/repository-name.git
git branch -M main
git push -u origin main
```

:::

### Create .gitignore

Create a comprehensive [`.gitignore`](https://git-scm.com/docs/gitignore) file to exclude sensitive and unnecessary files:

> [!NOTE] What is `.gitignore`?
> The `.gitignore` file specifies which files and directories Git should ignore and not track in version control. Any files or folders listed in `.gitignore` will not be included in git commits.

::: code-group

```bash [.gitignore ]
# Dependencies
node_modules/

# Environment variables and configuration
.env
```

```bash [with config.json]
# Dependencies
node_modules/
config.json # if it contains tokens or other sensitive information

# Environment variables and configuration
.env
```
