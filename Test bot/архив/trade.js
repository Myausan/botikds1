const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('в разработке')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
    async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const memberUser = interaction.options.getUser('member');
        const member = await interaction.guild.members.fetch(memberUser.id)
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`);
		const emoji = config.emoji;
		let a_balance = 0;
        let a_profiles = []
        let a_baneconomy = 0;
        let m_balance = 0;
        let m_profiles = []
        let m_baneconomy = 0;
        let sqlResult;
		let title = "Предожение обмена"
        let status
        let message
        let rare
		let now = Date.now()
		/*if (author.id !== '432199748699684864') {
			interaction.reply({
				content: `${author}, у вас нет доступа к этой команде`
			})
		}*/
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
			await connection
				.query(`SELECT money,  baneconomy, cases FROM money WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle(title)
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
				.query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
					type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			} else {
				a_balance = sqlResult[0].money;
				a_baneconomy = sqlResult[0].baneconomy
				casesProfile = sqlResult[0].cases
			}
            await connection
				.query(`SELECT * FROM profiles WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			.then((result) => sqlResult = result)
			for (let i = 0; i < sqlResult.length;i++) {
				a_profiles.push(sqlResult[i].profile);
			}
			a_profiles.sort();

			if (a_baneconomy == 1) {
				const banEmbed = new EmbedBuilder()
					.setTitle(title)
					.setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
					.setColor(config.colorError);
				await interaction.reply({
					embeds: [banEmbed],
					ephemeral: true
				}) 
				return
			}
            status = 'start'
            const rowAgree = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeYes')
                        .setEmoji(config.emojis.yes)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeNo')
                        .setEmoji(config.emojis.no)
                        .setStyle(2),
                )
            const rowReturn = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonCaseReturn')
						.setLabel('Назад')
						.setEmoji(config.emojis.return)
						.setStyle(4)
				)
			const Embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(author.user.displayAvatarURL())
                .setColor(config.color)
                .setDescription(`${author}, хочет предложить обмен ${member}`)
            await interaction.reply({
                embeds: [Embed],
                components: [rowAgree],
                fetchReply: true
            })
            .then ((send) => {
                message = send
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonTradeYes' || ButtonInteraction.customId === 'buttonTradeNo';

			const collector = message.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async ButtonInteraction => {
				let ButtonMember = ButtonInteraction.user;
				if (ButtonMember.id != member.id) {
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
				if (ButtonInteraction.customId === 'buttonTradeNo') {
                    Embed.setDescription(`${author}, ${member} отказался от обмена`)
                    await interaction.editReply({
                        embeds: [Embed],
                        components: []
                    })
                    return
                }
                if (ButtonInteraction.customId === 'buttonTradeYes') {
                    title = `Обмен между ${author} и ${member}`
                    let authorItems = []
                    let memberItems = []
                    const rowAdd = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonAddItems')
                                .setEmoji(config.emojis.yes)
                                .setStyle(2),
                        )
                    let items = (arr) => {
                        if (arr.length == 0) {
                            return `Пусто`
                        }
                        let text = ``
                        let money = 0;
                        for (let i = 0; i < arr.length; i++) {
                            if (typeof(arr[i]) !== 'number') {
                                text+=`${arr[i]}\n`
                            } else {
                                money = arr[i]
                            }
                        }
                        if (money) {
                            text+=`${money} ${emoji}`
                        }
                        return text
                    }
                    Embed
                        .setDescription(title)
                        .addFields(
                            {name: `Предметы ${author}:`, value: `${items(authorItems)}`, inline: true},
                            {name: `Предметы ${member}`, value: `${items(memberItems)}`, inline: true},
                        )
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [rowAdd]
                    })
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonAddItems';

                    const collector = message.createMessageComponentCollector({ filter, time: 120000 });

                    collector.on('collect', async ButtonInteraction => {
                        let ButtonMember = ButtonInteraction.user;
                        if (ButtonMember.id != member.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        let setDisabledImage = (number) => {
                            if (number >= profiles.length) {
                                return true
                            }
                            return false
                        }
                        let profilesText = (page) => {
                            let text = ``;
                            for (let i = page*10; i < page*10+10; i++) {
                                if (profiles[i]) {
                                    text+=`[${i+1}] ${profiles[i]} (${rareText(profiles[i])})\n`;
                                } else {
                                    return text
                                }
                            }
                            return text
                        }
                        let rareText = (number) => {
                            switch(number) {
                                case 1: return "Обычный"
                                case 2: return "Редкий"
                                case 3: return "Эпический"
                                case 4: return "Легендарный"
                                case 5: return "Мифический"
                            }
                        }
                        let rare = (name) => {
                            let profiles = config.profiles
                            for (let i = 0; i < profiles.common.length; i++) {
                                if (profiles.common[i].name == name) return 1
                            }
                            for (let i = 0; i < profiles.rare.length; i++) {
                                if (profiles.rare[i].name == name) return 2
                            }
                            for (let i = 0; i < profiles.epic.length; i++) {
                                if (profiles.epic[i].name == name) return 3
                            }
                            for (let i = 0; i < profiles.legendary.length; i++) {
                                if (profiles.legendary[i].name == name) return 4
                            }
                            for (let i = 0; i < profiles.mythical.length; i++) {
                                if (profiles.mythical[i].name == name) return 5
                            }
                            return 1
                        }
                        let lockLeft = () => {
                            if (page == 0) {
                                return true
                            } else {
                                return false
                            }
                        }
                        let lockRight = () => {
                            if (page == maxPage) {
                                return true
                            } else {
                                return false
                            }
                        }
                        let profiles = []
                        let page = 0;
                        await connection
                            .query(`SELECT * FROM profiles WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        .then((result) => sqlResult = result)
                        for (let i = 0; i < sqlResult.length;i++) {
                            const profileObject = {
                                name: sqlResult[i].profile,
                                count: sqlResult[i].count,
                                rare: rare()
                            }
                            profiles.push(sqlResult[i].profile);
                        }
                        let maxPage = Math.floor(profiles.length/5)
                        const rowImage = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`buttonProfileSelect0`)
                                    .setLabel('1')
                                    .setDisabled(setDisabledImage(page*5))
                                    .setStyle(3)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`buttonProfileSelect1`)
                                    .setLabel('2')
                                    .setDisabled(setDisabledImage(page*5+1))
                                    .setStyle(3)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`buttonProfileSelect2`)
                                    .setLabel('3')
                                    .setDisabled(setDisabledImage(page*5+2))
                                    .setStyle(3)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`buttonProfileSelect3`)
                                    .setLabel('4')
                                    .setDisabled(setDisabledImage(page*5+3))
                                    .setStyle(3)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`buttonProfileSelect4`)
                                    .setLabel('5')
                                    .setDisabled(setDisabledImage(page*5+4))
                                    .setStyle(3)
                            )
                        const rowArrows = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonProfileLeftAll')
                                    .setEmoji(`${config.emojis.left}`)
                                    .setStyle(2)
                                    .setDisabled(lockLeft())
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonProfileLeft')
                                    .setEmoji(`${config.emojis.left}`)
                                    .setStyle(2)
                                    .setDisabled(lockLeft())
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonProfileMiddle')
                                    .setLabel(` `)
                                    .setStyle(1)
                                    .setDisabled(true)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonProfileRight')
                                    .setEmoji(`${config.emojis.left}`)
                                    .setStyle(2)
                                    .setDisabled(lockRight())
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonProfileRightAll')
                                    .setEmoji(`${config.emojis.right}`)
                                    .setStyle(2)
                                    .setDisabled(lockRight())
                            )
                        const EmbedItems = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(`${author}, выберите предмет, который хотите добавить`)
                            .setColor(config.color);
                        await ButtonInteraction.reply({
                            embeds: [EmbedItems],
                            components: [rowImage, rowArrows],
                            ephemeral: true,
                            fetchReply: true,
                        })
                    })
                }
            })
            collector.on('end', async () => {
				if (status == 'start') {
					for (let i = 0; i<rowStart.components.length;i++) {
						rowStart.components[i].setDisabled(true)
					}
					await interaction.editReply({
						components: [rowStart]
					})
				}
			})
		} catch(err) {
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