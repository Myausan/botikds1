const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputStyle, TextInputBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
    async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logWorkTimely}`)
        let money = 0;
		let balance = 0;
        let jailtime = 0;
        let baneconomy = 0;
        let workCooldown = 0;
        let ghost = 0;
        let answer = 0;
        let bypass
        let sqlResult;
        let now = Date.now()
        if (author.id !== config.owner_id) {
            await interaction.reply({
                content: `${author}, ты щас пизды получишь! Не тройгай эту команду`,
                ephemeral: true
            }) 
            return
        }
        try {
            const modal = new ModalBuilder()
                .setCustomId('modalEmbedTitle')
                .setTitle('Афиша');
            const titleInput = new TextInputBuilder()
                .setCustomId('modalEmbedTitleInput')
                .setLabel('Введите описание')
                .setPlaceholder('Фильм плохой, не советую')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            const firstActionRow = new ActionRowBuilder().addComponents(titleInput)
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal);
            const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedTitle';
            interaction.awaitModalSubmit({ filter, time: 300000 })
            .then(async ModalInteraction => {
                let descriptionInput = ModalInteraction.components[0].components[0].value
                const embed = new EmbedBuilder()
                    .setTitle('ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤКинопоказ')
                    .setDescription(`<:Kino:1153008940477591564> Фильм: 
<:Moon:1153007824226492427> 
<:__:1153028999665176716>
<:Zvezda:1153007746619281418> 

**ОПИСАНИЕ**
\`\`\`${descriptionInput}\`\`\``)
                    .setImage(descriptionInput)
                    .setColor(config.color);
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('title')
                    .setDescription(`${author}, вы не можете этого делать`)
                    .setColor(config.color);
                await ModalInteraction.reply({
                    embeds: [embed],
                    ephemeral: true
                })
            })
            .catch((err) => {
                console.log(err)
            })
        } catch(err) {
            if (err.code != 10062) {
				lockedCommands.push(interaction.commandName)
			}
            let two = n => (n > 9 ? "" : "0") + n;
            let format = now =>
                two(now.getDate()) + "." +
                two(now.getMonth() + 1) + "." +
                now.getFullYear() + " " +
                two(now.getHours()) + ":" +
                two(now.getMinutes()) + ":" +
                two(now.getSeconds());
            let now = new Date();
            let time = format(now)
            console.log(chalk.hex('#ff0000')(`[${time}] Command ${interaction.commandName}: Error ${err}`))
            try {
                await interaction.reply({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
            } catch(err) {
                await interaction.editReply({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
            }
        }
	}
};