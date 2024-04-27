const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const fs = require('fs')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('voiceover')
		.setDescription('Создать анонс')
        .addStringOption(option => 
			option.setName('name')
			.setDescription('Название произведения')
			.setRequired(true))
        .addStringOption(option => 
            option.setName('year')
            .setDescription('Год выпуска произведения')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('genre')
            .setDescription('Жанр произведения')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('time')
            .setDescription('Время начала (XX:XX)')
            .setRequired(true)),
    async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member
        const name = interaction.options.getString('name')
        const year = interaction.options.getString('year')
        const genre = interaction.options.getString('genre')
        const time = interaction.options.getString('time')
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const afishaChannel = await interaction.guild.channels.fetch(config.afishaChannel)
        let image
        let message
        const title = 'Создание афиши'
        /*if (author.id !== config.owner_id && author.id !== '415439061914877962' && author.id !== '636680188213592085' && author.id !== '713489731240853574') {
            await interaction.reply({
                content: `${author}, ты щас пизды получишь! Не тройгай эту команду`,
                ephemeral: true
            }) 
            return
        }*/
        try {
            const modal = new ModalBuilder()
                .setCustomId('modalEmbedAfishaTitle')
                .setTitle('Озвучка');
            const titleInput = new TextInputBuilder()
                .setCustomId('modalEmbedTitleInput')
                .setLabel('Введите описание')
                .setPlaceholder('Произведение плохое, не советую')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            const firstActionRow = new ActionRowBuilder().addComponents(titleInput)
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal);
            const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedAfishaTitle';
            interaction.awaitModalSubmit({ filter, time: 300000 })
            .then(async ModalInteraction => {
                let descriptionInput = ModalInteraction.components[0].components[0].value
                const rowAfisha = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonAfishaSend')
                            .setLabel('Отправить')
                            .setStyle(3),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonAfishaCancel')
                            .setLabel('Отмена')
                            .setStyle(4),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonAfishaImage')
                            .setLabel('Добавить картинку')
                            .setStyle(2),
                    )
                const embed = new EmbedBuilder()
                    .setTitle('ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤОзвучка')
                    .setDescription(`<:Kino:1153008940477591564> Произведение: **${name}**
<:Moon:1153007824226492427> Год: **${year}**
<:__:1153028999665176716> Жанр: **${genre}**
<:Zvezda:1153007746619281418> Начало озвучки: **${time}** по **МСК**

**ОПИСАНИЕ**
\`\`\`${descriptionInput}\`\`\``)
                    .setColor(config.color);
                const confirmEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(`${author}, вот как будет выглядеть Embed`)
                    .setColor(config.color);
                await ModalInteraction.reply({
                    embeds: [embed, confirmEmbed],
                    components: [rowAfisha],
                    ephemeral: true,
                    fetchReply: true
                })
                .then((msg) => message = msg)
                .catch((err) => console.error(err))
                const collector = message.createMessageComponentCollector({ time: 600000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    if (ButtonInteraction.customId === 'buttonAfishaSend') {
                        await ButtonInteraction.deferUpdate()
                        await afishaChannel.send({
                            content: `<@&1111402486570418217>`,
                            embeds: [embed]
                        }) 
                        confirmEmbed.setDescription(`${author}, афиша отправлена`).setColor('#00ff00')
                        await ModalInteraction.editReply({
                            embeds: [embed, confirmEmbed],
                            components: []
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonAfishaCancel') {
                        await ButtonInteraction.deferUpdate()
                        confirmEmbed.setDescription(`${author}, отправка афиши отменена`).setColor('#ff0000')
                        await ModalInteraction.editReply({
                            embeds: [confirmEmbed],
                            row: [],
                        })
                        collector.stop()
                    }
                    if (ButtonInteraction.customId === 'buttonAfishaImage') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalEmbedAfishaImage')
                            .setTitle('Вставить картинку');
                        const imageInput = new TextInputBuilder()
                            .setCustomId('modalEmbedTitleInput')
                            .setLabel('Введите URL картинки')
                            .setPlaceholder('https://kartinki.com')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(imageInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedAfishaImage';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction1 => {
                            let urlInput = ModalInteraction1.components[0].components[0].value
                            embed.setImage(urlInput)
                            ModalInteraction1.deferUpdate()
                            await ModalInteraction.editReply({
                                embeds: [embed, confirmEmbed],
                                row: [rowAfisha],
                            })
                        })
                        .catch((err))
                    }
                })
            })
            .catch((err) => {
                console.log(err)
            })
        } catch(err) {
            if (err.code != 'InteractionNotReplied') {
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