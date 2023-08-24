const { Collection } = require("discord.js");

const DEFAULT_CD = 3;

module.exports = {
    name: 'interactionCreate',
    async dispatch(interaction) {
        if (!interaction.isChatInputCommand()) {
            log("\x1b[43mInteraction is not a command\x1b[0m");
            return;
        }
    
        const client = interaction.client
        const commandName = interaction.commandName;
        const command = client.commands.get(commandName);
    
        if (!command) {
            log(`\x1b[31mNo command found "${commandName}"\x1b[0m`);
            return;
        }

        // Check cooldowns
        const { cooldowns } = client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownTime = (command.cooldown ?? DEFAULT_CD) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownTime;

            if (now < expirationTime) {
                const expirationTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({content: `You are on cooldown for \`${command.data.name}\`\n
                You can use it <t:${expirationTimestamp}:R>`, ephemeral: true});
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownTime);
    
        try {
            await command.execute(interaction);
        } catch (err) {
            if (interaction.replied || interaction.deferred) {
                console.log(err);
                await interaction.followUp(`Something wrong happened, ping the man\n\`\`\`${err.message}\`\`\``);
            } else {
                console.log(err);
                await interaction.reply(`Something wrong happened, ping the man\n\`\`\`${err.message}\`\`\``);
            }
        }
    }
}