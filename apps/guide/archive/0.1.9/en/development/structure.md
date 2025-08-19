# Project Structure

Welcome! If you've completed all the previous steps, you've already created your first `yurba.js` bot! 
Now let's improve the code structure. The current structure is fine, but in the future, it might make managing and updating the bot more difficult.

## Creating the `src` folder
SRC - or source code, contains the main bot code. Let's move `index.js` and `config.json` there and update `package.json`

### Updating `package.json`

Since our `index.js` is now in the `src` folder, we need to update the start script

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
    "yurba.js": "^0.1.9"
  }
}
```

After our updates, the structure will look like this:
```console
 .
├──  package.json
├──  .env
└──  src
    ├──  config.json
    └──  index.js
```

## Creating the `commands` folder and adding command loading function

Now let's create a commands folder. If you want a more structured approach with command categories, you can also create additional subfolders inside the commands folder.

### Adding the command loading function

```javascript:line-numbers [index.js]
// Import Client from yurba.js
const { Client } = require("yurba.js");

// Load config
const config = require('./config.json');

// Load `.env`
require('dotenv').config()

// Create client (bot) with your token and prefix
const client = new Client(process.env.YURBA_TOKEN, {prefix: config.prefix});

// -- Function for loading commands -- //

// Import standart modules for work with files
const fs = require('fs');
const path = require('path');

/**
 * Loads all commands from the commands folder and its subdirectories
 * @param {Object} client - Bot client
 * @param {string} commandsPath - Path to commands folder
 */
function loadCommands(client, commandsPath = './commands') {
    const commandsDir = path.resolve(__dirname, commandsPath);
    
    // Check if commands folder exists
    if (!fs.existsSync(commandsDir)) {
        console.warn(`Commands folder not found: ${commandsDir}`);
        return;
    }
    
    /**
     * Recursively loads commands from a directory and its subdirectories
     * @param {string} dir - Directory to load commands from
     */
    function loadCommandsFromDir(dir) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const itemPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                // Recursively load commands from subdirectory
                loadCommandsFromDir(itemPath);
            } else if (item.isFile() && item.name.endsWith('.js')) {
                try {
                    const command = require(itemPath);
                    
                    // Check command structure
                    if (!command.name || !command.handler) {
                        console.error(`Error in ${itemPath}: command must have 'name' and 'handler' properties`);
                        continue;
                    }
                    
                    // Register command
                    client.registerCommand(
                        command.name, // Name of command
                        command.args || {}, // Arguments in command
                        command.handler,
                    );
                    
                    console.log(`Loaded command: ${command.name} from ${path.relative(commandsDir, itemPath)}`);
                } catch (error) {
                    console.error(`Error loading command from ${itemPath}:`, error.message);
                }
            }
        }
    }
    
    // Start loading commands recursively
    loadCommandsFromDir(commandsDir)
}

loadCommands(client);

// -- -- -- -- -- -- -- -- -- -- //

// First event - ready
// When the bot starts, it will log 'Ready!' to the console
client.once('ready', () => {
    console.log('Ready!');
    console.log(`Registered commands: ${client.getCommands().length}`);
    console.log(`Available commands: ${client.getCommands().join(', ')}`);
});

// Initialize the bot (start it)
client.init();

```
#### Add ping command 
Add a ping command either in commands or in commands/utils
```javascript [ping.js]
module.exports = {
    name: 'ping',
    description: 'Responds with pong!',
    argsSchema: {},
    handler: (message, args) => {
        message.reply(`pong!, ${message.Author.Name}`);
    }
};
```
Now our project structure looks something like this:
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

And after running it:
```
λ ~/Projects/yurbajs/examples/guide-bot main* ❯❯ pnpm start

> my-bot@0.0.1 start /Projects/yurbajs/examples/guide-bot
> node src/index.js

[dotenv@17.2.0] injecting env (1) from .env (tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit)
Loaded command: ping from utils/ping.js
Ready!
Registered commands: 1
Available commands: ping
```
> [!NOTE] Second achievement!
> You have completed the first stage of the Guide and understood the basics of creating a bot.
> You can proceed to [the next page](/development/repo) if you have created a Github/Gitlab repository and want to improve it by creating README.md and LICENSE
> Also, all the code from the first stage is available on [Github](https://github.com/yurbajs/yurba.js/tree/main/examples/guide-bot)

> [!NOTE] Thank you for being with us
> Regarding the guide and specifically information about continuing the main work on creating the bot - this is the end for now, continuation will appear over time.
> Also, I would be very happy to see ideas and reports about issues with the Guide and not only in [issues](https://github.com/yurbajs/yurba.js/issues) and [pull requests](https://github.com/yurbajs/yurba.js/pulls) with labels `Ideas` and `Guide`.
> Personally RastGame ;)