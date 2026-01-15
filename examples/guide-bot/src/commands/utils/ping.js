module.exports = {
  name: 'ping',
  description: 'Responds with pong!',
  argsSchema: {},
  handler: (message, args) => {
    message.reply(`pong!, ${message.Author.Name}`);
  },
};
