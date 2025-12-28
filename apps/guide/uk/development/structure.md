# Структура проєкту

Вітаємо! Якщо ви виконали всі попередні кроки, ви вже створили свого першого `yurba.js` бота! 
Тепер давайте покращимо структуру коду. Поточна структура цілком нормальна, але в майбутньому вона може ускладнити управління та оновлення бота.

## Створення папки `src`
SRC - або source code, містить основний код бота. Давайте перемістимо `index.js` та `config.json` туди і оновимо `package.json`

### Оновлення `package.json`

Оскільки наш `index.js` тепер знаходиться в папці `src`, нам потрібно оновити start скрипт

```json [package.json]
{
  "name": "my-bot",
  "version": "0.0.1",
  "description": "bot for guide",
  "keywords": [
    "bot",
    "yurbajs",
    "guide-bot"
  ],
  "license": "ISC",
  "author": "RastGame",
  "type": "commonjs",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",  // [!code --] [!code focus]
    "start": "node src/index.js",  // [!code ++] [!code focus]
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "dotenv": "^17.2.0",
    "yurba.js": "^1.0.0-next.15"
  }
}
```

Після наших оновлень структура виглядатиме так:
```console
 .
├──  package.json
├──  .env
└──  src
    ├──  config.json
    └──  index.js
```

## Створення папки `commands` і додавання функції завантаження команд

Тепер давайте створимо папку команд. Якщо ви хочете більш структурований підхід з категоріями команд, ви також можете створити додаткові підпапки всередині папки commands.

### Додавання функції завантаження команд

```javascript:line-numbers [index.js]
// Import Client from yurba.js
const { Client } = require("yurba.js");

// Load config
const config = require('./config.json');

// Load `.env`
require('dotenv').config()

// Create client (bot) with your token and prefix
const client = new Client({prefix: config.prefix});

// -- Функція для завантаження команд -- //

// Імпорт стандартних модулів для роботи з файлами
const fs = require('fs');
const path = require('path');

/**
 * Завантажує всі команди з папки commands та її піддиректорій
 * @param {Object} client - Клієнт бота
 * @param {string} commandsPath - Шлях до папки команд
 */
function loadCommands(client, commandsPath = './commands') {
    const commandsDir = path.resolve(__dirname, commandsPath);
    
    // Перевірити, чи існує папка команд
    if (!fs.existsSync(commandsDir)) {
        console.warn(`Папка команд не знайдена: ${commandsDir}`);
        return;
    }
    
    /**
     * Рекурсивно завантажує команди з директорії та її піддиректорій
     * @param {string} dir - Директорія для завантаження команд
     */
    function loadCommandsFromDir(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const itemPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                // Рекурсивно завантажити команди з піддиректорії
                loadCommandsFromDir(itemPath);
            } else if (item.isFile() && item.name.endsWith('.js')) {
                try {
                    const command = require(itemPath);
                    
                    // Перевірити структуру команди
                    if (!command.name || !command.handler) {
                        console.error(`Помилка в ${itemPath}: команда повинна мати властивості 'name' і 'handler'`);
                        continue;
                    }
                    
                    // Зареєструвати команду
                    client.commands.register(
                        command.name, // Назва команди
                        command.args || {}, // Аргументи в команді
                        command.handler,
                    );
                    
                    console.log(`Завантажено команду: ${command.name} з ${path.relative(commandsDir, itemPath)}`);
                } catch (error) {
                    console.error(`Помилка завантаження команди з ${itemPath}:`, error.message);
                }
            }
        }
    }
    
    // Почати рекурсивне завантаження команд
    loadCommandsFromDir(commandsDir)
}

loadCommands(client);

// -- -- -- -- -- -- -- -- -- -- //

// Перша подія - ready
// Коли бот запускається, він виведе 'Ready!' в консоль
client.once('ready', () => {
    console.log('Ready!');
    console.log(`Зареєстровано команд: ${client.commands.getAll().length}`);
    console.log(`Доступні команди: ${client.commands.getAll().join(', ')}`);
});

// Ініціалізувати бота (запустити його)
client.init(process.env.YURBA_TOKEN);

```
#### Додавання команди ping 
Додайте команду ping або в commands, або в commands/utils
```javascript [ping.js]
module.exports = {
    name: 'ping',
    argsSchema: {},
    handler: (message, args) => {
        message.reply(`pong!, ${message.Author.Name}`);
    }
};
```
Тепер структура нашого проєкту виглядає приблизно так:
```console
 .
├──  package.json
├──  .env
└──  src
    ├──  commands
    │   └──  utils
    │       └──  ping.js
    ├──  config.json
    └──  index.js
```

І після запуску:
```
λ ~/Projects/yurbajs/examples/guide-bot main* ❯❯ pnpm start

> my-bot@0.0.1 start /Projects/yurbajs/examples/guide-bot
> node src/index.js

[dotenv@17.2.0] injecting env (1) from .env (tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit)
Завантажено команду: ping з utils/ping.js
Ready!
Зареєстровано команд: 1
Доступні команди: ping
```
> [!NOTE] Друге досягнення!
> Ви завершили перший етап Посібника і зрозуміли основи створення бота.
> Ви можете перейти до [наступної сторінки](/development/repo), якщо ви створили репозиторій Github/Gitlab і хочете покращити його, створивши README.md і LICENSE
> Також весь код з першого етапу доступний на [Github](https://github.com/yurbajs/yurba.js/tree/main/examples/guide-bot)

> [!NOTE] Дякуємо, що ви з нами
> Щодо посібника і конкретно інформації про продовження основної роботи по створенню бота - на цьому поки все, продовження з'явиться з часом.
> Також я був би дуже радий побачити ідеї і звіти про проблеми з Посібником і не тільки в [issues](https://github.com/yurbajs/yurba.js/issues) і [pull requests](https://github.com/yurbajs/yurba.js/pulls) з мітками `Ideas` і `Guide`.
> Особисто RastGame `;)`