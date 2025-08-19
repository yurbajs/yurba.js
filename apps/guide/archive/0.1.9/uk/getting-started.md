---
editLink: true
sidebar: false
---



# Встановлення 
```sh
npm install yurba.js
yarn add yurba.js
pnpm add yurba.js
bun add yurba.js
````

## Початок 
```js
import { Client } from "yurba.js"; // імпортуємо Client

const client = new Client('TOKEN'); // Вставляємо токен yurba ( він виглядає так: `y.RT0ZALrC4tUwU7WmEGvq5XdlsRjpMlrL`)

client.registerCommand('hi', { name: 'string' }, (message, args) => {
    message.reply(`Привіт!, ${args.name}!`);
}); 
// Перша команда hi, з аргументом name, тобто:
// Коли користувач пише /hi ля ля1 ля2
// Відповідь буде: Привіт!, ля
// Текст що після першого ля, вважаються як інші аргументи

client.on('ready', () => {
    console.log('Йоуууу!');
});
// Коли бот запустився в консоль прийде лог: "Йоуууу!"

client.init();
// Запуск бота 
```

::: warning
Це просто тестова версія, хехе, але гадаю це буде корисно, хотя тут нічого й немає
:::
::: info
[English version](/introduction)
:::