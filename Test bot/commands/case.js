const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('case')
		.setDescription('в разработке'),
    async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`);
		const emoji = config.emoji;
		let baneconomy = 0;
		let balance = 0;
		let casesProfile = 0;
		let jailtime = 0;
        let sqlResult;
		let title = "Кейсы"
        let status
        let message
        let rare
		let now = Date.now()
		/*if (author.id !== '432199748699684864') {
			interaction.reply({
				content: `${author}, у вас нет доступа к этой команде`
			})
		}*/
        let disabledOpen = () => {
            if (!baneconomy && casesProfile) {
                return false
            }
            return true
        }
        let disabledBuy = () => {
            if (baneconomy) {
                return true
            }
            return false
        }
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
				.query(`SELECT money, jailtime, baneconomy, cases FROM money WHERE id = ${author.id}`, {
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
				balance = sqlResult[0].money;
				baneconomy = sqlResult[0].baneconomy
				jailtime = sqlResult[0].jailtime
				casesProfile = sqlResult[0].cases
			}

			if (baneconomy == 1) {
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
			if (jailtime > now) {
                let formatTime = (time) => {
                    let m = Math.floor(time/1000/60%60);
                    let h = Math.floor(time/1000/60/60%24);
                    let d = Math.floor(time/1000/60/60/24);
                    let result = '';
                    if ((d % 10 == 1) && d != 11) {
                        result += `${d} день `
                    } else {
                        if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
                            result += `${d} дня `
                        } else {
                            result += `${d} дней `
                        }
                    }
                    if ((h % 10 == 1) && h != 11) {
                        result += `${h} час `
                    } else {
                        if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
                            result += `${h} часа `
                        } else {
                            result += `${h} часов `
                        }
                    }
                    if ((m % 10 == 1) && m != 11) {
                        result += `${m} минута`
                    } else {
                        if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
                            result += `${m} минуты`
                        } else {
                            result += `${m} минут`
                        }
                    }
                    return result
                }
                const errorEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            status = 'start'
            const rowStart = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonCaseProfileOpen')
						.setLabel('Открыть кейс с профилями')
						.setEmoji(config.emojis.buymoney)
						.setDisabled(disabledOpen())
						.setStyle(2)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonCaseBuy')
						.setLabel('Купить кейсы')
						.setEmoji(config.emojis.inventory)
						.setDisabled(disabledBuy())
						.setStyle(2)
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
                    .setDescription(`${author}, у вас есть:
Кейс с профилями: ${casesProfile}`)
                await interaction.reply({
                    embeds: [Embed],
                    components: [rowStart],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCaseProfileOpen' || ButtonInteraction.customId === 'buttonCaseBuy' || ButtonInteraction.customId === 'buttonCaseReturn';

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
				if (ButtonInteraction.customId === 'buttonCaseProfileOpen') {
                    await ButtonInteraction.deferUpdate()
                    await connection
                        .query(`SELECT cases FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => cases = result[0].cases)
                    if (!cases) {
                        rowStart.components[1].setDisabled(disabledOpen(cases))
                        await interaction.editReply({
                            components: [rowStart]
                        })
                    }
                    await connection
                        .query(`UPDATE money SET cases = cases - 1 WHERE id = ${author.id}`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    status = 'open'
                    let number = Math.floor(Math.random() * 100)+1;
                    if (number > 0 && number <= 41) {
                        rare = "common";
                    }
                    if (number > 41 && number <= 71) {
                        rare = "rare";
                    }
                    if (number > 71 && number <= 91) {
                        rare = "epic";
                    }
                    if (number > 91 && number <= 98) {
                        rare = "legendary";
                    }
                    if (number > 98 && number <=100) {
                        rare = "mythical";
                    }
                    let profile = config.profiles[rare][Math.floor(Math.random() * config.profiles[rare].length)]
                    Embed.data.thumbnail = undefined
                    Embed.data.title = undefined
                    Embed
                        .setDescription('Открываем кейс...')
                        .setImage(profile.caseURL)
                    await interaction.editReply({
                        embeds: [Embed],
                        components: []
                    })
                    await wait(5000)
                    Embed
                        .setDescription(`Вам выпал профиль: **${profile.name}**`)
                        .setImage(profile.afterURL)
                    await interaction.editReply({
                        embeds: [Embed]
                    })
                    await connection
                        .query(`INSERT INTO profiles (id, profile, count) VALUES (${author.id}, '${profile.name}', 1) ON DUPLICATE KEY UPDATE count=count+1;`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    
                }
                if (ButtonInteraction.customId === 'buttonCaseBuy') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalCaseProfileBuy')
                        .setTitle('Купить кейсы');
                    const input = new TextInputBuilder()
                        .setCustomId('modalCaseProfileBuyInput')
                        .setLabel('Введите количество')
                        .setPlaceholder('1')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(input)
                    modal.addComponents(firstActionRow)
                    await interaction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'buttonCaseBuy';
                    interaction.awaitModalSubmit({ filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let countInput = parseInt(ModalInteraction.components[0].components[0].value)
                        if (!countInput || countInput < 1) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, введите корректное значение`);
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await connection
                            .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => money = result[0].money)
                        if (countInput*500 > money) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, у вас недостаточно средств, нужно ${countInput*500}`);
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await ModalInteraction.deferUpdate()
                        collector.resetTimer()
                        await connection
                            .query(`UPDATE money SET cases = cases + ${countInput}, money = money - ${countInput*500} WHERE id = ${author.id}`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        money-=countInput*500
                        cases+=countInput
                        Embed
                            .setDescription(`${author}, вы успешно купили ${cases} кейсов с профилями`)
                            .setColor(config.color);
                        await interaction.editReply({
                            embeds: [Embed],
                            components: [rowReturn]
                        })
                        return
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (ButtonInteraction.customId === 'buttonCaseReturn') {
                    await ButtonInteraction.deferUpdate()
                    rowStart.components[1].setDisabled(disabledOpen(cases))
                    collector.resetTimer()
                    Embed.setDescription(`${author}, у вас есть:
                    Кейс с профилями: ${casesProfile}`)
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [rowStart]
                    })
                    return
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