// Import Client from yurba.js
const { Client } = require('yurba.js');

// Load config
const config = require('./config.json');

// Load `.env`
require('dotenv').config();

// Create client (bot) with your token and prefix
const client = new Client(process.env.YURBA_TOKEN, { prefix: config.prefix });

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
          client.commands.register(
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
  loadCommandsFromDir(commandsDir);
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
