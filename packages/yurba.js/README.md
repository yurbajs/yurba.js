<div align="center">
  <br />
  <p>
    <a href="https://yurba.js.org"><img src="https://yurba.js.org/logo.svg" width="300" alt="yurba.js logo" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/yurba.js"><img src="https://img.shields.io/npm/v/yurba.js.svg?maxAge=3600" alt="npm version" /></a>  ˖
    <a href="https://www.npmjs.com/package/yurba.js"><img src="https://img.shields.io/npm/dt/yurba.js.svg?maxAge=3600" alt="npm downloads"></a>  ˖
    <a href="https://github.com/yurbajs/yurba.js/commits/main"><img src="https://img.shields.io/github/last-commit/yurbajs/yurba.js.svg?logo=github&logoColor=ffffff" alt="Last commit" /></a>  ˖
    <a href="https://github.com/yurbajs/yurba.js/graphs/contributors"><img src="https://img.shields.io/github/contributors/yurbajs/yurba.js.svg?maxAge=3600&logo=github&logoColor=fff&color=00c7be" alt="contributors" /></a>  ˖
    <a href="https://www.npmjs.com/package/yurba.js"><img src="https://img.shields.io/npm/last-update/yurba.js" alt="npm last update"></a>
  </p>
</div>

## About
The powerful and flexible library for creating bots and automating work with the Yurba API.  

## Install
Node.js 20 or newer is required.

```sh
npm install yurba.js
yarn add yurba.js
pnpm add yurba.js
bun add yurba.js
````

## Example usage

<details>
<summary>── <a href="https://nodejs.org/api/esm.html#enabling">ES modules</a> example:</summary>

```js
import { Client } from "yurba.js";

const client = new Client({ prefix: '!' });

client.commands.register('hi', { name: 'string' }, (msg, args) => {
    msg.reply(`Hello, ${args.name}!`);
});

client.on('ready', () => {
    console.log('Ready!');
});

client.init('TOKEN');
```

</details>

<details> 
<summary>── <a href="https://nodejs.org/api/modules.html">CommonJS</a> example:</summary>

```js
const { Client } = require("yurba.js");

const client = new Client({ prefix: '!' });

client.comands.register('hi', { name: 'string' }, (message, args) => {
    message.reply(`Hello, ${args.name}!`);
});

client.on('ready', () => {
    console.log('Ready!');
});

client.init('TOKEN');
```

</details>

## Links

* [Website][website] ([source][website-source])
* [Documentation][documentation]
* [Yurba Account][yurba]
* [Yurba Channel][yurba-channel]
* [Yurba Chat][yurba-chat]
* [GitHub][source]
* [npm][npm]

## Contributing

Want to help make yurba.js better?

* Found a bug? [Open an issue](https://github.com/yurbajs/yurba.js/issues/new).
* Have an idea? [Start a discussion](https://github.com/yurbajs/yurba.js/discussions).
* Want to contribute code? Fork the repository and submit a pull request.

Please make sure to follow our coding style and test your changes before submitting.

## Getting Help

Need assistance?

* Check the [documentation][documentation] first.
* Ask questions in our [Chat][yurba-chat].
* Browse existing [issues](https://github.com/yurbajs/yurba.js/issues) and [discussions](https://github.com/yurbajs/yurba.js/discussions).

[source]: https://github.com/yurbajs/yurba.js/tree/main/packages/yurba.js
[website]: https://yurba.js.org
[website-source]: https://github.com/yurbajs/yurba.js
[documentation]: https://yurba.js.org/docs
[yurba]: https://me.yurba.one/yurbajs
[yurba-channel]: https://me.yurba.one/yjs
[yurba-chat]: https://me.yurba.one/yurba.js
[npm]: https://www.npmjs.com/package/yurba.js

