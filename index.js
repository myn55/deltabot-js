const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

// Main client
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.MessageContent,
] });

// Handle commands
const commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
client.cooldowns = new Collection();

(function handleCommands(_path) {
    const files = fs.readdirSync(_path);
    for (const file of files) {
        const filePath = path.join(_path, file);
        const lstats = fs.lstatSync(filePath);

        // Recursively search through folders inside commands/
        if (lstats.isDirectory()) {
            handleCommands(filePath);
        } else if (lstats.isFile() && file.endsWith('.js')) {
            const command = require(filePath);
            const commandPath = filePath.slice(filePath.indexOf('commands'));

            if ('data' in command && 'execute' in command) {
                commands.set(command.data.name, command);
                console.log(`\x1b[32m[SUCCESS] Added ${commandPath} to "commands" collection\x1b[0m`);
            } else {
                console.log(`\x1b[93m[WARNING] Command at ${commandPath} does not have any "data" or "execute" fields\x1b[0m`);
            }
        }
    }
})(commandsPath)

client.commands = commands;
console.log(`\x1b[92mRegistered ${commands.size} commands\x1b[0m\n`);

// Handle events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    if (event.once) {
        client.once(event.name, (...args) => event.dispatch(...args));
    } else {
        client.on(event.name, (...args) => event.dispatch(...args));
    }
}

// Run
client.login(token);