const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder} = require('discord.js');
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
        let a_baneconomy = 0;
        let m_baneconomy = 0;
        let profiles = []
        let profile
        let ghost = 0
        let page = 0;
        let maxPage = 0;
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
                        text+=`[${i+1}] ${profiles[i].name} (${rareText(profiles[i].rare)})\n`;
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
            let max = (number) => {
                if (number > profiles.length) {
                    return profiles.length
                }
                return number
            }
			await connection
				.query(`SELECT baneconomy, profile, ghost FROM money WHERE id = ${author.id}`, {
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
                profile = sqlResult[0].profile
				a_baneconomy = sqlResult[0].baneconomy
                ghost = sqlResult[0].ghost
			}
            await connection
				.query(`SELECT baneconomy FROM money WHERE id = ${member.id}`, {
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
				.query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
					type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			} else {
				m_baneconomy = sqlResult[0].baneconomy
			}
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
            await connection
				.query(`SELECT * FROM profiles WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			.then((result) => sqlResult = result)
			for (let i = 0; i < sqlResult.length;i++) {
                const profileObject = {
                    name: sqlResult[i].profile,
                    rare: rare(sqlResult[i].profile),
                    count: sqlResult[i].count
                }
				profiles.push(profileObject);
			}
            maxPage = Math.floor((profiles.length-1)/10)
			profiles.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            status = 'start'
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('selectMenuTradeItems')
                .setPlaceholder('Выберите предмет')
                .setMaxValues(1)
            for (let i = page*10; i < max(page*10+10); i++) {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(profiles[i].name)
                        .setDescription(`Количество: ${profiles[i].count}`)
                        .setValue(String(i))
                )
            } 
            const selectMenu1 = new StringSelectMenuBuilder()
                .setCustomId('selectMenuTradeSort')
                .setPlaceholder('Сортировать по')
                .setMaxValues(1)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Сортировать по названию')
                        .setValue('alphabetical order')
                        .setEmoji(config.emojis.sort1)
                        .setDefault(true)
                )
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Сортировать по названию')
                        .setValue('alphabetical order r')
                        .setEmoji(config.emojis.sort2)
                )
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Сортировать по редкости')
                        .setValue('rare order')
                        .setEmoji(config.emojis.sort1)
                )
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Сортировать по редкости')
                        .setValue('rare order r')
                        .setEmoji(config.emojis.sort2)
                )
            const rowArrows = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeLeftAll')
                        .setLabel('<<')
                        .setStyle(2)
                        .setDisabled(lockLeft()),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeLeft')
                        .setLabel('<=')
                        .setStyle(2)
                        .setDisabled(lockLeft()),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeBin')
                        .setEmoji(config.emojis.bin)
                        .setStyle(4),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeRight')
                        .setLabel('=>')
                        .setStyle(2)
                        .setDisabled(lockRight()),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonTradeRightAll')
                        .setLabel('>>')
                        .setStyle(2)
                        .setDisabled(lockRight()),
                )
            const rowProfiles = new ActionRowBuilder().addComponents(selectMenu)
            const rowSort = new ActionRowBuilder().addComponents(selectMenu1)
			const Embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(author.user.displayAvatarURL())
                .setColor(config.color)
                .setDescription(`${author}, выберите вещь, которую хотите передать:\n\n${profilesText(page)}`)
                .setFooter({ text:`Страница ${page+1} из ${maxPage+1}` })
            await interaction.reply({
                embeds: [Embed],
                components: [rowProfiles, rowSort, rowArrows],
                fetchReply: true
            })
            .then ((send) => {
                message = send
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'selectMenuTradeItems' || ButtonInteraction.customId === 'selectMenuTradeSort' || ButtonInteraction.customId === 'buttonTradeLeftAll' || ButtonInteraction.customId === 'buttonTradeLeft' || ButtonInteraction.customId === 'buttonTradeBin' || ButtonInteraction.customId === 'buttonTradeRight' || ButtonInteraction.customId === 'buttonTradeRightAll';

			const collector = message.createMessageComponentCollector({ filter, time: 60000 });

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
				if (ButtonInteraction.customId === 'selectMenuTradeItems') {
                    collector.stop()
                    const numberProfile = ButtonInteraction.values[0];
                    const modal = new ModalBuilder()
                        .setCustomId('modalTradeCount')
                        .setTitle('Предложение обмена');
                    const countInput = new TextInputBuilder()
                        .setCustomId('modalTradeContInput')
                        .setLabel('Введите количество')
                        .setPlaceholder('1')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(countInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalTradeCount';
                    ButtonInteraction.awaitModalSubmit({ filter, time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'end'
                        let count = parseInt(ModalInteraction.components[0].components[0].value);
                        if (isNaN(count) || count < 0) {
                            Embed
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода количества передаваемых предметов`)
                                .setFooter({ text:`` })
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            return
                        }
                        if (count > profiles[numberProfile].count) {
                            Embed
                                .setColor(config.colorError)
                                .setDescription(`${author}, у вас недостаточно предметов для передачи`)
                                .setFooter({ text:`` })
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            return
                        }
                        Embed.setDescription(`${author}, вы успешно передали ${count} ${profiles[numberProfile].name} пользователю ${member}`)
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                        if (profile == profiles[numberProfile].name && count == profiles[numberProfile].count) {
                            await connection
                                .query(`UPDATE money SET profile = '' WHERE id = ${author.id}}';`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        }
                        await connection
                            .query(`INSERT INTO profiles (id, profile, count) VALUES (${member.id}, '${profiles[numberProfile].name}', 1) ON DUPLICATE KEY UPDATE count=count+${count};`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        await connection
                            .query(`UPDATE profiles SET count = count - ${count} WHERE id = ${author.id} AND profile = '${profiles[numberProfile].name}';`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        await connection
                            .query(`DELETE FROM profiles WHERE count = 0;`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        if (!ghost) {
                            const logEmbed = new EmbedBuilder()
                                .setTitle(`Trade`)
                                .setColor('#00ff00')
                                .setDescription(`[1] ${author}(${author.id})
[2] ${member} (${member.id})
[3] Профиль: ${profiles[numberProfile]}
[3] Количество: ${count}`)
                            await logChannel.send({
                                embeds: [logEmbed],
                            })
                        }
                    })
                    .catch()
                } else if (ButtonInteraction.customId === 'selectMenuTradeSort') {
                    await ButtonInteraction.deferUpdate()
                    collector.resetTimer()
                    const sort = ButtonInteraction.values[0];
                    if (sort === 'alphabetical order') {
                        rowSort.components[0].options[0].setDefault(true)
                        rowSort.components[0].options[1].setDefault(false)
                        rowSort.components[0].options[2].setDefault(false)
                        rowSort.components[0].options[3].setDefault(false)
                        profiles.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
                    }
                    if (sort === 'alphabetical order r') {
                        rowSort.components[0].options[0].setDefault(false)
                        rowSort.components[0].options[1].setDefault(true)
                        rowSort.components[0].options[2].setDefault(false)
                        rowSort.components[0].options[3].setDefault(false)
                        profiles.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
                    }
                    if (sort === 'rare order') {
                        rowSort.components[0].options[0].setDefault(false)
                        rowSort.components[0].options[1].setDefault(false)
                        rowSort.components[0].options[2].setDefault(true)
                        rowSort.components[0].options[3].setDefault(false)
                        profiles.sort((a, b) => a.rare - b.rare);
                    }
                    if (sort === 'rare order r') {
                        rowSort.components[0].options[0].setDefault(false)
                        rowSort.components[0].options[1].setDefault(false)
                        rowSort.components[0].options[2].setDefault(false)
                        rowSort.components[0].options[3].setDefault(true)
                        profiles.sort((a, b) => b.rare - a.rare);
                    }
                    page = 0;
                    rowArrows.components[0].setDisabled(true)
                    rowArrows.components[1].setDisabled(true)
                    rowArrows.components[3].setDisabled(lockRight())
                    rowArrows.components[4].setDisabled(lockRight())
                    rowProfiles.components[0].setOptions([])
                    for (let i = page*10; i < max(page*10+10); i++) {
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(profiles[i].name)
                                .setDescription(`Количество: ${profiles[i].count}`)
                                .setValue(String(i))
                        )
                    } 
                    rowProfiles.setComponents(selectMenu)
                    Embed
                        .setDescription(`${author}, выберите вещь, которую хотите передать:\n\n${profilesText(page)}`)
                        .setFooter({ text:`Страница ${page+1} из ${maxPage+1}` })
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [rowProfiles, rowSort, rowArrows],
                    })
                    return
                } else if (ButtonInteraction.customId === 'buttonTradeBin') {
                    await ButtonInteraction.deferUpdate()
                    collector.stop()
                    await message.delete()
                } else {
                    await ButtonInteraction.deferUpdate()
                    collector.resetTimer()
                    if (ButtonInteraction.customId === 'buttonTradeLeftAll') {
                        page = 0
                    }
                    if (ButtonInteraction.customId === 'buttonTradeLeft') {
                        page--
                    }
                    if (ButtonInteraction.customId === 'buttonTradeRight') {
                        page++
                    }
                    if (ButtonInteraction.customId === 'buttonTradeRightAll') {
                        page = maxPage
                    }
                    rowArrows.components[0].setDisabled(lockLeft())
                    rowArrows.components[1].setDisabled(lockLeft())
                    rowArrows.components[3].setDisabled(lockRight())
                    rowArrows.components[4].setDisabled(lockRight())
                    rowProfiles.components[0].setOptions([])
                    for (let i = page*10; i < max(page*10+10); i++) {
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(profiles[i].name)
                                .setDescription(`Количество: ${profiles[i].count}`)
                                .setValue(String(i))
                        )
                    } 
                    rowProfiles.setComponents(selectMenu)
                    Embed
                        .setDescription(`${author}, выберите вещь, которую хотите передать:\n\n${profilesText(page)}`)
                        .setFooter({ text:`Страница ${page+1} из ${maxPage+1}` })
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [rowProfiles, rowSort, rowArrows],
                    })
                }
            })
            collector.on('end', async () => {
				if (status == 'start') {
                    rowProfiles.components[0].setDisabled(true)
                    rowSort.components[0].setDisabled(true)
					for (let i = 0; i<rowArrows.components.length;i++) {
						rowArrows.components[i].setDisabled(true)
					}
					await interaction.editReply({
						components: [rowProfiles, rowSort, rowArrows],
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