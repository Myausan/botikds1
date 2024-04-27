const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Создать эмбэд'),
    async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        let sqlResult;
        let answer = 0;
        let bypass = 0;
        let embed = 0;
        let message;
        const channels = ['1020793411487416390']
		if (lockedCommands.includes(interaction.commandName)) {
            const embed = new EmbedBuilder()
                .setTitle("Создание вебхука")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            }) 
            return
		}
        try {
            await connection
                .query(`SELECT embed, bypass FROM protection WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("EMBED")
                        .setDescription(`${author}, Команда временно заблокирована`)
                        .setColor(config.colorError);
                    interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                })
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO protection (id, embed) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                bypass = sqlResult[0].bypass;
                embed = sqlResult[0].embed
            }
            if (embed > Date.now()) {
                let time = embed - Date.now()
                let sec = Math.floor(time/1000%60);
                let min = Math.floor(time/1000/60%60);
                let hours = Math.floor(time/1000/60/60%24);
                let result = `${hours}h ${min}m ${sec}s`;
                const cooldownEmbed = new EmbedBuilder()
                    .setTitle("Ежедневная награда")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, использовать embed можно раз в 30 минут\n\n\\Вы cможете использовать ещё раз через ${result}`)
                    .setColor(config.colorError)
                interaction.reply({
                    embeds: [cooldownEmbed]
                })
                return
            }
			const modal = new ModalBuilder()
                .setCustomId('modalManageRoleEditCost')
                .setTitle('Создание вебхука');
            const TitleInput = new TextInputBuilder()
                .setCustomId('modalEmbedTitleInput')
                .setLabel('Введите Title')
                .setPlaceholder('Title')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            const ColorInput = new TextInputBuilder()
                .setCustomId('modalEmbedColorInput')
                .setLabel('Введите HEX')
                .setPlaceholder('HEX')
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            const DescriptionInput = new TextInputBuilder()
                .setCustomId('modalEmbedDescriptionInput')
                .setLabel('Введите Description')
                .setPlaceholder('Description')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
            const firstActionRow = new ActionRowBuilder().addComponents(TitleInput)
            const secondActionRow = new ActionRowBuilder().addComponents(ColorInput)
            const thirdActionRow = new ActionRowBuilder().addComponents(DescriptionInput)
            modal.addComponents(firstActionRow).addComponents(secondActionRow).addComponents(thirdActionRow)
            await interaction.showModal(modal)
            interaction.awaitModalSubmit({time: 360000 })
            .then(async ModalInteraction => {
                let title = ModalInteraction.components[0].components[0].value;
                let color = ModalInteraction.components[1].components[0].value;
                let description = ModalInteraction.components[2].components[0].value;
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonEmbedAddField')
                            .setLabel('Add field')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonEmbedAddImage')
                            .setLabel('Add Image')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonRouletteCreate')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                const Embed = new EmbedBuilder()
                    .setTitle(title)
                    .setColor(color)
                    .setDescription(description)
                await ModalInteraction.reply({
                    embeds: [Embed],
                    components: [row],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonEmbedAddField' || ButtonInteraction.customId === 'buttonEmbedAddImage' || ButtonInteraction.customId === 'buttonRouletteCreate';
    
                const collector = message.createMessageComponentCollector({ filter, time: 60000 });
    
                collector.on('collect', async ButtonInteraction => {
                
                })
                /*
                const filter = messageImage => messageImage.author.id === author.id;

                const collector = interaction.channel.createMessageCollector({filter, time: 60000 });

                collector.on('collect', async messageImage => {
                    answer++
                    collector.stop()
                    if (messageImage.attachments.size != 1) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(`EMBED`)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, вам нужно прикрепить 1 файл`)
                        await messageImage.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        }) 
                        return 
                    }
                    let image;
                    for (let [key, value] of messageImage.attachments) {
                        image = value.attachment
                    }
                    messageImage.delete()
                    await connection
                        .query(`UPDATE protection SET embed = ${Date.now()} WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    const Embed = new EmbedBuilder()
                        .setTitle(title)
                        .setColor('#1f1f1f')
                        .setDescription(description)
                        .setImage('attachment://test.png')
                    await interaction.editReply({
                        content: `${author}, всё верно?`,
                        embeds: [Embed],
                        files: [
                            {
                                attachment: attachment, name: 'test.png', description: 'desc'
                            }
                        ]
                    })
                })
            */
            })
            .catch(async err => {

            })
		} catch(err) {
			console.log(err)
		}
	}
};