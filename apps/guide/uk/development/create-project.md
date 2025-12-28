---
title: Створення проєкту бота
editLink: true
sidebar: true
---

# Створення проєкту вашого бота

Тепер, коли у вас встановлено Node.js і налаштовано акаунт бота, настав час створити ваш перший проєкт yurba.js. Цей посібник проведе вас через налаштування професійної структури проєкту з належним управлінням конфігурацією та практиками безпеки.

## Ініціалізація проєкту

### Крок 1: Створення директорії проєкту

Спочатку створіть окрему директорію/папку для вашого бот-проєкту:

```sh
cd my-yurba-bot
```

### Крок 2: Ініціалізація Package.json

Ініціалізуйте ваш Node.js проєкт, використовуючи ваш улюблений менеджер пакетів:

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

Вас попросять заповнити інформацію про проєкт. Ось приклад конфігурації:

<img src="/images/npm-init.png" width="700" alt="процес npm init" />


### Крок 3: Перевірка Package.json

Після ініціалізації ваш `package.json` повинен виглядати приблизно так:

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

### Файли конфігурації

Створіть файл `.env` та файл `config.json`

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


::: danger Попередження про безпеку
Ніколи не комітьте чутливі файли, такі як [`.env`](/development/create-project#create-gitignore) або [`config.json`](/development/create-project#create-gitignore), що містять токени, до системи контролю версій. Ці файли містять приватні облікові дані, які повинні зберігатися в безпеці.

Переконайтеся, що додали ці файли до вашого [`.gitignore`](/development/create-project#create-gitignore), щоб запобігти випадковим комітам.
:::

## Налаштування Git

> [!NOTE] Що таке Git?
> [Git](https://git-scm.com/about/1) — це розподілена система контролю версій, яка допомагає відстежувати зміни у вашому коді, співпрацювати з іншими та керувати різними версіями вашого проєкту.

### Ініціалізація Git

```bash
git init
```
::: tip
Якщо ви використовуєте [GitHub](https://github.com) або [GitLab](https://gitlab.com), ви можете ініціалізувати ваш репозиторій за допомогою цих команд:

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

### Створення .gitignore

Створіть вичерпний файл [`.gitignore`](https://git-scm.com/docs/gitignore), щоб виключити чутливі та непотрібні файли:

> [!NOTE] Що таке `.gitignore`?
> Файл `.gitignore` вказує, які файли та директорії Git повинен ігнорувати і не відстежувати в системі контролю версій. Будь-які файли або папки, перелічені в `.gitignore`, не будуть включені в git коміти.

::: code-group

```bash [.gitignore ]
# Dependencies
node_modules/

# Environment variables and configuration
.env
```

```bash [з config.json]
# Залежності
node_modules/
config.json # якщо містить токени або іншу чутливу інформацію

# Змінні середовища та конфігурація
.env
```
