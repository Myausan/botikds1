const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sex')
		.setDescription('Заняться сексом')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const member = interaction.options.getUser('member');
		let status = 'start'
        let message
        let bypass = 0
        let a_ignoresex = 0;
        let m_ignoresex = 0;
        let m_ignore1 = 0
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Реакции: Секс")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            if (author.id == member.id) {
                interaction.reply({
                    content: '<:Epifantsev:1085683332618137760>',
                    ephemeral
                })
                return
            }
            await connection
                .query(`SELECT bypass, ignoresex FROM admin WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => {
                if (result[0] !== undefined) {
                    bypass = result[0].bypass
                    a_ignoresex = result[0].ignoresex
                }
            })
            .catch((err) => {
                
            })
            await connection
                .query(`SELECT ignore1, ignoresex FROM admin WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => {
                m_ignore1 = result[0].ignore1
                m_ignoresex = result[0].ignoresex
            })
            .catch((err) => {
                
            })
            if (bypass == 0) {
                if (a_ignoresex == 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Реакции: Секс`)
                        .setDescription(`${author}, на вас одет пояс верности`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
                if (m_ignoresex == 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Реакции: Секс`)
                        .setDescription(`${author}, на ${member} одет пояс верности`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
                if (m_ignore1 == 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Реакции: Секс`)
                        .setDescription(`${author}, ${member} не хочет заниматься сексом`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            const rowAgree = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonSexYes')
                        .setEmoji(config.emojis.yes)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonSexNo')
                        .setEmoji(config.emojis.no)
                        .setStyle(2),
                )
            const embed = new EmbedBuilder()
                .setTitle(`Реакции: Секс`)
                .setDescription(`${author} предложил(-a) ${member} заняться сексом!`)
                .setColor(config.color);
            await interaction.reply({
                content: `${member}`,
                embeds: [embed],
                components: [rowAgree],
                fetchReply: true
            })
            .then((msg) => {
                message = msg
            })
            const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonSexYes' || ButtonInteraction.customId === 'buttonSexNo';

            const collector = message.createMessageComponentCollector({filter, time: 60000 });

            collector.on('collect', async ButtonInteraction => {
                if (ButtonInteraction.user.id != member.id && ButtonInteraction.user.id != config.owner_id) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Реакции: Секс')
                        .setThumbnail(ButtonInteraction.user.displayAvatarURL())
                        .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                        .setColor(config.colorError);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                if (status == 'sex') {
                    await ButtonInteraction.deferUpdate()
                    return
                }
                status = 'sex'
                await ButtonInteraction.deferUpdate()
                if (ButtonInteraction.customId === 'buttonSexYes') {
                    let rand = Math.floor(Math.random() * 9) + 1;
                    let image;
                    switch(rand){
                        case 1: image = "https://cdn.discordapp.com/attachments/863851334612811786/863869582531493908/detail.gif"; break;
                        case 2: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868443400732692/Warasono-Fumika-Koe-De-Oshigoto-Hentai-GIF-1.gif"; break;
                        case 3: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868253255237652/11.gif"; break;
                        case 4: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868249086099506/tumblr_nf56mzl9Zb1smtpyco1_1280.gif"; break;
                        case 5: image = "https://cdn.discordapp.com/attachments/863851334612811786/863862068238745640/1.gif"; break;
                        case 6: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855431217709106/tenor_3.gif"; break;
                        case 7: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855338850615368/tenor_5.gif"; break;
                        case 8: image = "https://media.discordapp.net/attachments/863851334612811786/966380983530188840/18494486-0.gif"; break;
                        case 9: image = "https://media.discordapp.net/attachments/863851334612811786/966380987044995102/cb1ae03f8d8f.gif"; break;
                        default: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855338850615368/tenor_5.gif"; break;
                    }
                    embed
                        .setDescription(`${author} и ${member} занялись сексом!`)
                        .setImage(image)
                        .setColor(config.color);
                    await interaction.editReply({
                        embeds: [embed],
                        content: `${member}`,
                        components: []
                    })
                } else {
                    embed
                        .setDescription(`${author}, ${member} отказался(-ас) от секса с вами.`)
                        .setColor(config.color);
                    await interaction.editReply({
                        embeds: [embed],
                        content: `${member}`,
                        components: []
                    })
                }
            })
            collector.on('end', async () => {
                if (status == 'start') {
                    embed
                        .setDescription(`${author}, ${member} проигнорировал(-а) ваше предложение.`)
                        .setColor(config.color);
                    await interaction.editReply({
                        embeds: [embed],
                    })
                }
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