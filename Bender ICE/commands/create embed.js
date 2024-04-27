const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const fs = require('fs')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createembed')
		.setDescription('Создать вебхук')
        .addChannelOption( option => 
            option.setName('channel')
            .setDescription('канал')
            .setRequired(true))
        .addBooleanOption( option => 
            option.setName('everyone')
            .setDescription('пинг everyone')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member
        const channel = interaction.options.getChannel('channel')
        const everyone = interaction.options.getBoolean('everyone')
        const emoji = config.emoji
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`)
        let sqlResult
        let fields = 0
        let cancel = false
        let image
        let message
        const title = 'Создание запланированного сообщения'
        let now = Date.now()
        if (author.id !== config.owner_id && author.id !== '415439061914877962' && author.id !== '636680188213592085' && author.id !== '713489731240853574') {
            await interaction.reply({
                content: `${author}, ты щас пизды получишь! Не тройгай эту команду`,
                ephemeral: true
            }) 
            console.log(`ROOT: ${author.username} tried to use commands remblock`)
            return
        }
        try {
            let functionEveryone = () => {
                if (everyone) {
                    return '@everyone'
                } else {
                    return ''
                }
            }
            const row1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedTitle')
						.setLabel('Set title')
						.setStyle(2)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedDescription')
						.setLabel('Set description')
						.setStyle(2)
				)
                .addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedColor')
						.setLabel('Set color')
						.setStyle(2)
				)
                .addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedFooter')
						.setLabel('Set footer')
						.setStyle(2)
				)
                .addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedImage')
						.setLabel('Set image')
						.setStyle(2)
				)
            const row2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedAddField')
						.setLabel('Add field')
						.setStyle(2)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedRemoveField')
						.setLabel('Delete all fields')
						.setStyle(4)
				)
            const row3 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedSend')
						.setLabel('Send message')
						.setStyle(3)
				)
                .addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedSendInTime')
						.setLabel('Send message in time')
						.setStyle(1)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonEmbedDelete')
						.setLabel('Delete message')
						.setStyle(4)
				)
            const embed = new EmbedBuilder()
                .setDescription('EMBED')
            const headEmbed = new EmbedBuilder()
                .setTitle(title)
                .setColor(config.color)
                .setDescription(`${author}, вот как будет выглядеть сообщение`)
            await interaction.reply({
                embeds: [headEmbed, embed],
                components: [row1, row2, row3],
                fetchReply: true,
            })
            .then ((send) => {
				message = send
			})
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonEmbedTitle' || ButtonInteraction.customId === 'buttonEmbedDescription' || ButtonInteraction.customId === 'buttonEmbedColor' || ButtonInteraction.customId === 'buttonEmbedFooter' || ButtonInteraction.customId === 'buttonEmbedImage' || ButtonInteraction.customId === 'buttonEmbedAddField' || ButtonInteraction.customId === 'buttonEmbedRemoveField' || ButtonInteraction.customId === 'buttonEmbedSend' || ButtonInteraction.customId === 'buttonEmbedSendInTime' || ButtonInteraction.customId === 'buttonEmbedDelete' || ButtonInteraction.customId === 'buttonEmbedCancel';

            const collector = message.createMessageComponentCollector({ filter, time: 600000 });

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
                collector.resetTimer()
                if (ButtonInteraction.customId === 'buttonEmbedTitle') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedTitle')
                        .setTitle('Embed Title');
                    const titleInput = new TextInputBuilder()
                        .setCustomId('modalEmbedTitleInput')
                        .setLabel('Введите Title')
                        .setPlaceholder('Крутой Embed')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(256)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(titleInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedTitle';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let titleEmbedInput = ModalInteraction.components[0].components[0].value
                        await ModalInteraction.deferUpdate()
                        embed.setTitle(titleEmbedInput)
                        await interaction.editReply({
                            embeds: [headEmbed, embed]
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedDescription') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedDescription')
                        .setTitle('Embed Description');
                    const descriptionInput = new TextInputBuilder()
                        .setCustomId('modalEmbedDescriptionInput')
                        .setLabel('Введите Description')
                        .setPlaceholder('Крутой Embed')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(4000)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(descriptionInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedDescription';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let descriptionEmbedInput = ModalInteraction.components[0].components[0].value
                        await ModalInteraction.deferUpdate()
                        embed.setDescription(descriptionEmbedInput)
                        await interaction.editReply({
                            embeds: [headEmbed, embed]
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedColor') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedColor')
                        .setTitle('Embed Color');
                    const colorInput = new TextInputBuilder()
                        .setCustomId('modalEmbedColorInput')
                        .setLabel('Введите цвет')
                        .setPlaceholder('#ff0000')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(7)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(colorInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedColor';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let colorEmbedInput = ModalInteraction.components[0].components[0].value
                        let roleCheck = colorEmbedInput.replace('#','')
                        while (roleCheck[0] == '0') {
                            roleCheck = roleCheck.substr(1);
                        }
                        if (colorEmbedInput.indexOf('#')!=0 || !(colorEmbedInput.length == 7) || parseInt(colorEmbedInput.replace('#',''), 16).toString(16) !== roleCheck.toLowerCase()) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода цвета, пример ввода цвета: #ff0000`)
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            }) 
                            return 
                        }
                        await ModalInteraction.deferUpdate()
                        embed.setColor(colorEmbedInput)
                        await interaction.editReply({
                            embeds: [headEmbed, embed]
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedFooter') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedFooter')
                        .setTitle('Embed Footer');
                    const footerInput = new TextInputBuilder()
                        .setCustomId('modalEmbedFooterInput')
                        .setLabel('Введите Footer')
                        .setPlaceholder('Крутой Embed')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(2048)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(footerInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedFooter';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let footerEmbedInput = ModalInteraction.components[0].components[0].value
                        await ModalInteraction.deferUpdate()
                        embed.setFooter({text: footerEmbedInput})
                        await interaction.editReply({
                            embeds: [headEmbed, embed]
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedImage') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedImage')
                        .setTitle('Вставить картинку');
                    const imageInput = new TextInputBuilder()
                        .setCustomId('modalEmbedImageInput')
                        .setLabel('Введите URL картинки')
                        .setPlaceholder('https://kartinki.com')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(imageInput)
                    modal.addComponents(firstActionRow)
                    await interaction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedImage';
                    interaction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let urlInput = ModalInteraction.components[0].components[0].value
                        embed.setImage(urlInput)
                        ModalInteraction.deferUpdate()
                        await interaction.editReply({
                            embeds: [headEmbed, embed],
                        })
                    })
                    .catch((err))
                }
                if (ButtonInteraction.customId === 'buttonEmbedAddField') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedField')
                        .setTitle('Embed Field');
                    const nameFieldInput = new TextInputBuilder()
                        .setCustomId('modalEmbedNameFieldInput')
                        .setLabel('Введите Field Name')
                        .setPlaceholder('Field Name')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(256)
                        .setRequired(true)
                    const valueFieldInput = new TextInputBuilder()
                        .setCustomId('modalEmbedValueFooterInput')
                        .setLabel('Введите Field Value')
                        .setPlaceholder('Field Value')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(1024)
                        .setRequired(true)
                    const inlineFieldInput = new TextInputBuilder()
                        .setCustomId('modalEmbedInlineFooterInput')
                        .setLabel('Введите Field inline')
                        .setPlaceholder('+/-')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(1)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(nameFieldInput)
                    const secondActionRow = new ActionRowBuilder().addComponents(valueFieldInput)
                    const thirdActionRow = new ActionRowBuilder().addComponents(inlineFieldInput)
                    modal.addComponents(firstActionRow).addComponents(secondActionRow).addComponents(thirdActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedField';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let nameEmbedInput = ModalInteraction.components[0].components[0].value
                        let valueEmbedInput = ModalInteraction.components[1].components[0].value
                        let inlineEmbedInput = ModalInteraction.components[2].components[0].value
                        if (inlineEmbedInput !== '+' && inlineEmbedInput !== '-') {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода Field inline, пример ввода Field inline: +`)
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            }) 
                            return 
                        }
                        if (inlineEmbedInput === '+') {
                            inlineEmbedInput = true
                        } else {
                            inlineEmbedInput = false
                        }
                        await ModalInteraction.deferUpdate()
                        embed.addFields({name: nameEmbedInput, value: valueEmbedInput, inline: inlineEmbedInput},)
                        fields++
                        await interaction.editReply({
                            embeds: [headEmbed, embed]
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedRemoveField') {
                    await ButtonInteraction.deferUpdate()
                    embed.setFields()
                    await interaction.editReply({
                        embeds: [headEmbed, embed]
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedSend') {
                    headEmbed.setDescription(`${author}, сообщение отправлено`).setColor('#00ff00')
                    await interaction.editReply({
                        embeds: [headEmbed, embed],
                        components: []
                    })
                    await ButtonInteraction.deferUpdate()
                    if (image) {
                        await channel.send({
                            content: functionEveryone(),
                            embeds: [embed],
                            files: [
                                {
                                    attachment: image, name: 'test.gif', description: 'desc'
                                }
                            ]
                        })
                        return
                    } else {
                        await channel.send({
                            content: functionEveryone(),
                            embeds: [embed],
                        })
                        return
                    }
                }
                if (ButtonInteraction.customId === 'buttonEmbedSendInTime') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalEmbedTime')
                        .setTitle('Embed Time');
                    const timeInput = new TextInputBuilder()
                        .setCustomId('modalEmbedTimeInput')
                        .setLabel('Введите Time')
                        .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(30)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(timeInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalEmbedTime';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        const rowCancel = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonEmbedCancel')
                                    .setLabel('Отмена')
                                    .setStyle(4)
                            )
                        let timeEmbedInput = parseInt(ModalInteraction.components[0].components[0].value)*1000-7200000
                        let two = n => (n > 9 ? "" : "0") + n;
                        let format = now =>
                            two(now.getDate()) + "." +
                            two(now.getMonth() + 1) + "." +
                            now.getFullYear() + " " +
                            two(now.getHours()) + ":" +
                            two(now.getMinutes()) + ":" +
                            two(now.getSeconds());
                        let now = new Date(timeEmbedInput)
                        await ModalInteraction.deferUpdate()
                        headEmbed.setDescription(`${author}, Отправка сообщения запланирована в **${format(now)}**`)
                        await interaction.editReply({
                            embeds: [headEmbed, embed],
                            components: [rowCancel]
                        })
                        while (!cancel) {
                            console.log(Date.now(), '\n', timeEmbedInput)
                            if (Date.now() > timeEmbedInput) {
                                cancel = true
                                headEmbed.setDescription(`${author}, сообщение отправлено`).setColor('#00ff00')
                                await interaction.editReply({
                                    embeds: [headEmbed, embed],
                                    components: []
                                })
                                if (image) {
                                    await channel.send({
                                        content: functionEveryone(),
                                        embeds: [embed],
                                        files: [
                                            {
                                                attachment: image, name: 'test.png', description: 'desc'
                                            }
                                        ]
                                    })
                                    return
                                } else {
                                    await channel.send({
                                        content: functionEveryone(),
                                        embeds: [embed],
                                    })
                                    return
                                }
                            }
                            await wait(60000)
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedDelete') {
                    headEmbed.setDescription(`${author}, отправка сообщения отменена`).setColor('#ff0000')
                    await interaction.editReply({
                        embeds: [headEmbed, embed],
                        components: []
                    })
                    await ButtonInteraction.deferUpdate()
                    await interaction.editReply({
                        embeds: [headEmbed, embed]
                    })
                }
                if (ButtonInteraction.customId === 'buttonEmbedCancel') {
                    await ButtonInteraction.deferUpdate()
                    cancel = true
                    headEmbed.setDescription(`${author}, отправка сообщения отменена`).setColor('#ff0000')
                    await interaction.editReply({
                        embeds: [headEmbed, embed],
                        components: []
                    })
                }
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