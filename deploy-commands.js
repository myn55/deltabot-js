/* 
    This file is mainly used for pushing out new commands using the REST API
    node deploy-commands.js
*/

const fs = require('fs');
const path = require('path');
const { REST, Routes, Collection } = require('discord.js');
const { token, clientId } = require('./config.json');

// Get all commands
const commands = []

const commandsPath = path.join(__dirname, 'commands');

(function handleCommands(_path) {
    const files = fs.readdirSync(_path);
    for (const file of files) {
        const filePath = path.join(_path, file);
        const lstats = fs.lstatSync(filePath);

        // Recursively search through folders inside commands/
        if (lstats.isDirectory()) {
            handleCommands(filePath);
        } else if (lstats.isFile()) {
            const command = require(filePath);
            const commandPath = filePath.slice(filePath.indexOf('commands'));

            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON())
                console.log(`\x1b[32m[SUCCESS] Added ${commandPath} to "commands" collection\x1b[0m`);
            } else {
                console.log(`\x1b[93m[WARNING] Command at ${commandPath} does not have any "data" or "execute" fields\x1b[0m`);
            }
        }
    }
})(commandsPath)

// Register all commands to the REST pipeline
const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`\nRefreshing ${commands.length} application commands...`);

        // Refreshes all commands within every guild the client is in
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`\x1b[92mSuccessfully reloaded ${data.length} application commands!\x1b[0m`);
    } catch (err) {
        console.error(err);
    }
})()
