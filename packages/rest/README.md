<div align="center">
  <br />
  <p>
    <a href="https://yurba.js.org"><img src="https://yurba.js.org/banner.svg" width="500" alt="yurba.js logo" /></a>
  </p>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/@yurbajs/rest"><img src="https://img.shields.io/npm/v/@yurbajs/rest.svg?maxAge=3600" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@yurbajs/rest"><img src="https://img.shields.io/npm/dt/@yurbajs/rest.svg?maxAge=3600" alt="npm downloads" /></a>
    <a href="https://github.com/yurbajs/yurba.js/commits/main"><img src="https://img.shields.io/github/last-commit/yurbajs/yurba.js.svg?logo=github&logoColor=ffffff" alt="Last commit" /></a>
    <a href="https://www.npmjs.com/package/@yurbajs/rest"><img src="https://img.shields.io/npm/last-update/@yurbajs/rest" alt="npm last update"></a>
  </p>
</div>

## About
REST client for Yurba API with full TypeScript support.

> WARNING: it's alpha version 

## Install  
Node.js 20 or newer is required.

```sh
npm install @yurbajs/rest
yarn add @yurbajs/rest
pnpm add @yurbajs/rest
bun add @yurbajs/rest
```

## Example usage

```js
import { REST } from '@yurbajs/rest';

const rest = new REST().setToken('yToken');

try {
  // Get current user info
  const me = await rest.users.me();
  console.log('Current user:', me);

  // Send message to dialog
  const message = await rest.dialogs.sendMessage(123, {
    text: 'Hello from yurba.js! 👋'
  });
  console.log('Sent message:', message);

  // Get user by username or ID
  const user = await rest.users.get('username');
  const userById = await rest.users.get(12345);
  
  // Get all dialogs
  const dialogs = await rest.dialogs.getAll();
  console.log('My dialogs:', dialogs);

  // Create new dialog
  const newDialog = await rest.dialogs.create({
    name: 'My Channel',
    description: 'Discussion place',
    type: 'channel'
  });

  // Get friends
  const friends = await rest.users.friends();
  console.log('Friends:', friends);

} catch (error) {
  console.error('API Error:', error.message);
}
```

### Batch Requests

Execute multiple API calls in parallel for better performance:

```js
// Instead of sequential calls (slow)
const me = await rest.users.me();        // 300ms
const dialogs = await rest.dialogs.getAll(); // 300ms  
const friends = await rest.users.friends();  // 300ms
// Total: ~900ms

// Use batch requests (fast)
const results = await rest.batch()
  .add('me', rest.users.me())
  .add('dialogs', rest.dialogs.getAll())
  .add('friends', rest.users.friends())
  .execute();
// Total: ~300ms (parallel)

console.log('User:', results.me);
console.log('Dialogs:', results.dialogs);
console.log('Friends:', results.friends);

// Handle partial failures
const results = await rest.batch()
  .add('me', rest.users.me())
  .add('invalid', rest.users.get('nonexistent')) // will fail
  .executeSettled(); // won't throw on errors

console.log(results.me);      // User object
console.log(results.invalid); // { error: Error }
```

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

[source]: https://github.com/yurbajs/yurba.js/tree/main/packages/rest
[website]: https://yurba.js.org
[website-source]: https://github.com/yurbajs/yurba.js
[documentation]: https://yurba.js.org/docs
[yurba]: https://me.yurba.one/yurbajs
[yurba-channel]: https://me.yurba.one/yjs
[yurba-chat]: https://me.yurba.one/yurba.js
[npm]: https://www.npmjs.com/package/@yurbajs/rest