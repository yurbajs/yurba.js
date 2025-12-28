---
title: Встановлення Node.js та yurba.js
editLink: true
sidebar: true
---

# Встановлення Node.js та yurba.js

Налаштування середовища розробки — це перший крок до створення потужних ботів за допомогою yurba.js. Цей посібник проведе вас через встановлення Node.js та бібліотеки yurba.js на вашій системі.

## Системні вимоги

Перш ніж почати, переконайтеся, що ваша система відповідає цим вимогам:

- **Node.js 20.0.0 або вище** (рекомендується LTS версія)
- **npm, yarn, pnpm або bun** (менеджер пакетів)
- **Операційна система**: Windows 10+, macOS 10.15+ або Linux (Ubuntu 18.04+, CentOS 7+)

## Встановлення Node.js

Node.js — це JavaScript runtime, який живить yurba.js. Вам потрібно встановити його перш ніж продовжити встановлення бібліотеки.

::: tip Перевірка існуючої інсталяції
Щоб перевірити, чи вже встановлено Node.js на вашій системі, відкрийте термінал і виконайте:
```bash
node --version
```
Якщо ви бачите номер версії (наприклад, `v20.10.0`), Node.js встановлено. Переконайтеся, що це версія 20.0.0 або вище.
:::

### Встановлення на Windows

1. **Завантажте інсталятор**
   - Відвідайте [офіційний сайт Node.js](https://nodejs.org/en/download)
   - Завантажте Windows Installer (.msi) для LTS версії
   - Оберіть відповідну архітектуру (x64 для більшості сучасних систем)

2. **Запустіть інсталяцію**
   - Двічі клацніть на завантажений `.msi` файл
   - Дотримуйтеся кроків майстра інсталяції
   - Прийміть ліцензійну угоду
   - Оберіть директорію інсталяції (рекомендується за замовчуванням)
   - Переконайтеся, що позначено "Додати до PATH"

3. **Перевірте інсталяцію**
   ```bash
   node --version
   npm --version
   ```

#### Проблеми з PATH у Windows
Якщо команди Node.js не розпізнаються у Windows:

1. Відкрийте Властивості системи → Додатково → Змінні середовища
2. Переконайтеся, що `C:\Program Files\nodejs\` є у вашому PATH
3. Перезапустіть командний рядок/PowerShell

### Встановлення на macOS

Оберіть один із цих способів:

#### Варіант 1: Офіційний інсталятор
1. Завантажте macOS інсталятор з [nodejs.org](https://nodejs.org/en/download)
2. Відкрийте `.pkg` файл і дотримуйтеся кроків інсталяції
3. Перевірте інсталяцію в Terminal

#### Варіант 2: Homebrew (рекомендовано)
```bash
# Встановіть Homebrew, якщо ще не встановлено
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Встановити Node.js
brew install node

# Перевірити інсталяцію
node --version
npm --version
```

#### Варіант 3: Node Version Manager (nvm)
```bash
# Встановити nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезапустити термінал або виконати:
source ~/.bashrc

# Встановити останню LTS версію Node.js
nvm install --lts
nvm use --lts
```

### Встановлення на Linux

#### Ubuntu/Debian
```bash
# Оновити індекс пакетів
sudo apt update

# Встановити Node.js з репозиторію NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Перевірити інсталяцію
node --version
npm --version
```

#### CentOS/RHEL/Fedora
```bash
# Встановити Node.js з репозиторію NodeSource
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo dnf install -y nodejs npm

# Для старіших систем використовуйте yum замість dnf
# sudo yum install -y nodejs npm
```

#### Arch Linux
```bash
# Встановити Node.js та npm
sudo pacman -S nodejs npm

# Перевірити інсталяцію
node --version
npm --version
```

## Встановлення yurba.js

Коли Node.js правильно встановлено, ви можете встановити yurba.js, використовуючи ваш улюблений менеджер пакетів. Бібліотека доступна на npm і підтримує всі основні менеджери пакетів.

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

::: tip Рекомендація
Для нових проєктів ми рекомендуємо **[pnpm](https://pnpm.io/)** за його швидкість і ефективність, або **npm** за універсальну сумісність. Проєкт [yurba.js](https://github.com/yurbajs/yurba.js) сам використовує pnpm.
:::

## Встановлення dotenv

Для безпечного управління змінними середовища ми рекомендуємо встановити [dotenv](https://www.npmjs.com/package/dotenv). Цей пакет дозволяє завантажувати змінні середовища з файлу `.env` в `process.env`.

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
# Примітка: Bun має вбудовану підтримку .env, але ви все одно можете використовувати dotenv за потреби
bun add dotenv
```

:::



### Перевірка інсталяції

Після інсталяції перевірте, що yurba.js правильно встановлено:

**Перевірка інсталяції пакета**
    
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
yurba.js 1.0.0-next.15
```

## Наступні кроки

Вітаємо! Тепер у вас встановлено Node.js та yurba.js на вашій системі. Ви готові перейти до наступного кроку: [налаштування акаунта вашого бота](/setup/setting-up-bot-account).

## Додаткові ресурси

- **[Документація Node.js](https://nodejs.org/docs/latest/api/)** - Офіційна документація Node.js
- **[Документація npm](https://docs.npmjs.com/)** - Документація менеджера пакетів
- **[Посібник TypeScript](https://www.typescriptlang.org/docs/)** - Якщо ви плануєте використовувати TypeScript
- **[Vscodium](https://vscodium.com/)** - Рекомендований редактор коду (`Безкоштовне/Вільне Програмне Забезпечення з відкритим кодом бінарні файли VS Code`)
