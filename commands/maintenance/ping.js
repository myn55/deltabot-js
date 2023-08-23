const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns the message and shard latency of Delta.'),
    async execute(interaction) {
        await interaction.reply({ content: `Latency: ${Date.now() - interaction.createdTimestamp}ms\nAPI latency: ${interaction.client.ws.ping}ms` });
    }
}