const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const fs = require('fs')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('literaryevening')
		.setDescription('Создать афишу')
        .addIntegerOption(option => 
			option.setName('timestamp')
			.setDescription('Отметка времени')
			.setRequired(true))
        .addUserOption(option => 
            option.setName('member1')
            .setDescription('Ведущий 1')
            .setRequired(false))
        .addUserOption(option => 
            option.setName('member2')
            .setDescription('Ведущий 2')
            .setRequired(false)),
    async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member
        const timestamp = interaction.options.getInteger('timestamp')
        const member1 = interaction.options.getUser('member1')
        const member2 = interaction.options.getUser('member2')
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
            const rowAfisha = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonLiteraryeveningSend')
                        .setLabel('Отправить')
                        .setStyle(3),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonLiteraryeveningCancel')
                        .setLabel('Отмена')
                        .setStyle(4),
                )
            const date = new Date(timestamp)
            const embed = new EmbedBuilder()
                .setTitle('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Литературные вечера')
                .setDescription(`**Здравствуйте дорогие участники сервера!**\n\n<:Line:1157746076904857660>  **${date.getDay()}.${date.getMonth()}.${date.getFullYear()} в ${date.getHours()}:${date.getMinutes()} по МСК**, на нашем сервере будет проходить мероприятие **«Литературные вечера»**.\n\n<:Line:1157746076904857660> **Формат проведения:**\n\`\`\`Вечер литературный — комплексное мероприятие, основанное на литературных произведениях, с использованием разнообразных приёмов, элементов игры, театрализации, импровизации. В основе вечера лежит литературный сценарий. Его можно посвятить любой теме или знаменательной дате.\`\`\`\n<:Line:1157746076904857660> **Ведущие: <@${member1.id}> & <@${member2.id}>**\n\n**__Ждем вас на нашем мероприятии!__**`)
                .setColor(config.color);
            const confirmEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, вот как будет выглядеть Embed`)
                .setColor(config.color);
            await interaction.reply({
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
                await ButtonInteraction.deferUpdate()
                collector.stop()
                if (ButtonInteraction.customId === 'buttonLiteraryeveningSend') {
                    await afishaChannel.send({
                        //content: `<@&1111402486570418217>`,
                        embeds: [embed]
                    }) 
                    confirmEmbed.setDescription(`${author}, вебхук отправлен`).setColor('#00ff00')
                    await interaction.editReply({
                        embeds: [embed, confirmEmbed],
                        components: []
                    })
                }
                if (ButtonInteraction.customId === 'buttonLiteraryeveningCancel') {
                    confirmEmbed.setDescription(`${author}, отправка вебхука отменена`).setColor('#ff0000')
                    await interaction.editReply({
                        embeds: [confirmEmbed],
                        components: [],
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