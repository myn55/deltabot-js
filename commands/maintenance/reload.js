const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    cooldown: 3,
    guildPermission: 'dev',
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the targeted command to the REST API')
        .setDMPermission(true)
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to reload')
                .setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({content: `No command found with name \`${commandName}\`.`, ephemeral: true});
        }

        // Delete the cached command file when it was required in index.js in order
        // to get the latest version with changes
        const commandsPath = path.join(__dirname, '../');
        let commandPath;
        
        const files = fs.readdirSync(commandsPath);
        for (const file of files) {
            const filePath = path.join(commandsPath, file);

            if (fs.lstatSync(filePath).isDirectory()) {
                const commandFiles = fs.readdirSync(filePath).filter(file => file.endsWith('.js'));
                if (commandFiles.includes(`${commandName}.js`)) {
                    commandPath = path.join(filePath, `${commandName}.js`);
                    break;
                }
            } else if (file == `${commandName}.js`) {
                commandPath = path.join(filePath, `${commandName}.js`);
                break;
            }
        }
        
        if (commandPath == undefined) {
            return interaction.reply({content: `Could not find \`${commandName}\` in file system.`, ephemeral: true});
        }

        delete require.cache[require.resolve(commandPath)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(commandPath);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply(`\`${newCommand.data.name}\` has been successfully reloaded`);
        } catch (err) {
            console.error(err);
            await interaction.reply(`There was an error reloading \`${command.data.name}\`\n\`\`\`${err.message}\`\`\``);
        }
    }
}