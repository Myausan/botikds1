const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, Emoji} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { start } = require('node:repl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boxes')
		.setDescription('сыграть в коробочки'),
	async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
        const author = interaction.member;
		const emoji = config.emoji;
		let balance = 0;
		let jailtime = 0;
		let ghost = 0;
		let boxes = 0;
		let sqlResult;
		let baneconomy = 0;
		let prize = 0;
		let status = 'start';
		let tokens = 0;
		let message;
		let pictures = [
			['https://media.discordapp.net/attachments/1108816103309840424/1108816351457443941/left_nothing.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108816352111763478/center_nothing.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108816351788810280/right_nothing.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108816437709131888/left_250.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108816438287933472/center_250.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108816438023696526/right_250.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108818210465255584/left_500.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818210125529198/center_500.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818209789968454/right_500.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108818296658198641/left_1000.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818296352022568/center_1000.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818296066818140/right_1000.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108818343051411507/left_2500.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818343726690354/center_2500.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818343399526452/right_2500.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108818398302973962/left_5000.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818399473180702/center_5000.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108818398953078824/right_5000.png'],
			['https://media.discordapp.net/attachments/1108816103309840424/1108822352810221578/left_promo.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108822352139137094/center_promo.png', 'https://media.discordapp.net/attachments/1108816103309840424/1108822352483074098/right_promo.png'],
		]
		let now = Date.now()
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
				.setTitle(`Коробочки`)
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
				.query(`SELECT money, jailtime, boxes, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
					console.log(`SQL: Error ${err}`)
					const lockEmbed = new EmbedBuilder()
						.setTitle(`Коробочки`)
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
				boxes = sqlResult[0].boxes;
				balance = sqlResult[0].money;
				jailtime = sqlResult[0].jailtime
				baneconomy = sqlResult[0].baneconomy
				ghost = sqlResult[0].ghost
			}

			if (baneconomy == 1) {
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
                console.log(chalk.hex('#ff0000')(`[${time}] Command ${interaction.commandName}: User ${author.displayName} blacklisted`))
				const banEmbed = new EmbedBuilder()
					.setTitle(`Коробочки`)
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
                    .setTitle("Коробочки")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
			let lock = (boxes) => {
				if (boxes > 0) {
					return false
				} else {
					return true
				}
			}
			let image = (prize, box) => {
				if (prize == 0) {
					return pictures[0][box-1]
				}
				if (prize == 250) {
					return pictures[1][box-1]
				}
				if (prize == 500) {
					return pictures[2][box-1]
				}
				if (prize == 1000) {
					return pictures[3][box-1]
				}
				if (prize == 2500) {
					return pictures[4][box-1]
				}
				if (prize == 5000) {
					return pictures[5][box-1]
				}
				if (prize == 'role') {
					return pictures[6][box-1]
				}
			}
			const rowStart = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesOpen')
						.setLabel('Открыть')
						.setStyle(2)
						.setEmoji(config.emojis.openBox)
						.setDisabled(lock(boxes)),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBuyToken')
						.setLabel('Купить жетоны')
						.setEmoji(config.emojis.buyTokenBoxes)
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesInfo')
						.setLabel('Информация')
						.setEmoji(config.emojis.info)
						.setStyle(2),
				)
			const rowInfo = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesOpen')
						.setLabel('Открыть')
						.setStyle(2)
						.setEmoji(config.emojis.openBox)
						.setDisabled(lock(boxes)),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBuyToken')
						.setLabel('Купить жетоны')
						.setEmoji(config.emojis.buyTokenBoxes)
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesReturn')
						.setLabel('Назад')
						.setEmoji(config.emojis.return)
						.setStyle(1),
				)
			const rowOpen = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBox1')
						.setLabel('1')
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBox2')
						.setLabel('2')
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBox3')
						.setLabel('3')
						.setStyle(2),
				)
			const rowBuy = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonBuyToken1')
                        .setLabel('1')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonBuyToken5')
                        .setLabel('5')
                        .setStyle(2),
                )
				.addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonBuyToken10')
                        .setLabel('10')
                        .setStyle(2),
                )
				.addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonBuyToken15')
                        .setLabel('15')
                        .setStyle(2),
                )
				.addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonBuyToken25')
                        .setLabel('25')
                        .setStyle(2),
                )
			const rowBuy1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesReturn')
						.setLabel('Назад')
						.setEmoji(config.emojis.return)
						.setStyle(1),
					)
			const embed = new EmbedBuilder()
				.setTitle(`Коробочки`)
				.setThumbnail(author.user.displayAvatarURL())
				.setDescription(`Потратьте один билет и получите шанс сыграть в волшебные коробочки, никто не знает что внутри, так как их содержимое магическим образом меняется каждый раз.\n\n${author}, у вас ${boxes} ${config.emojis.ticketBoxes}`)
				.setColor(config.color);
			await interaction.reply({
				embeds: [embed],
				components: [rowStart],
				fetchReply: true
			})
			.then ((send) => {
				message = send
			})
			const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonBoxesOpen' || ButtonInteraction.customId === 'buttonBoxesInfo' || ButtonInteraction.customId === 'buttonBoxesReturn' || ButtonInteraction.customId === 'buttonBoxesBuyToken';

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
				await ButtonInteraction.deferUpdate()
				if (ButtonInteraction.customId === 'buttonBoxesOpen') {
					await connection
						.query(`SELECT money, boxes FROM money WHERE id = ${author.id}`, {
							type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
						.then((result) => {
							money = result[0].money
							boxes = result[0].boxes
						})
					if (boxes < 1) {
						boxes = 0;
						rowStart.components[0].setDisabled(lock(boxes))
						const embed = new EmbedBuilder()
							.setTitle(`Коробочки`)
							.setThumbnail(author.user.displayAvatarURL())
							.setDescription(`${author}, у вас ${boxes} коробочек`)
							.setColor(config.color);
						await interaction.editReply({
							embeds: [embed],
							components: [rowStart],
						})
						return
					}
					await connection
						.query(`UPDATE money SET boxes=boxes-1 WHERE id = ${author.id};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
					status = 'open';
					collector.stop()
					const embed = new EmbedBuilder()
						.setTitle(`Коробочки`)
						.setDescription(`Перемешиваем коробочки`)
						.setImage('https://media.discordapp.net/attachments/1108816103309840424/1108825465906536588/mix.gif')
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed],
						components: [],
					})
					const prizes = [`Ничего`, `250${emoji}`, `500${emoji}`, `1000${emoji}`, `2500${emoji}`, `5000${emoji}`, `Кастомная роль(14 дней)`]
					await wait(10000);
					const embed1 = new EmbedBuilder()
						.setTitle(`Коробочки`)
						.setDescription(`выберите одну из 3 коробок`)
						.setImage('https://media.discordapp.net/attachments/1108816103309840424/1108825724191768687/chumadan_s_nomerami.png')
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed1],
						components: [rowOpen],
					})
					const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonBoxesBox1' || ButtonInteraction.customId === 'buttonBoxesBox2' || ButtonInteraction.customId === 'buttonBoxesBox3';

					const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

					collector1.on('collect', async ButtonInteraction => {
						status = 'choicen'
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
						let number = Math.floor(Math.random() * 1000)+1; //0.9395425
						if (number > 999) {
							const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
							let promo = ''
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							promo += characters.charAt(Math.floor(Math.random() * characters.length))
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли кастомную роль на 14 дней`)
								.setImage(image('role', parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							const embedPromo = new EmbedBuilder()
								.setDescription(`Промокод на создание роли: ${promo}`)
								.setFooter({text: 'При утере промокода, средства не возваращаются'})
								.setColor(config.color);
							await ButtonInteraction.reply({
								embeds: [embedPromo],
								ephemeral: true
							})
							await connection
								.query(`UPDATE money SET boxes=boxes-1 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
							await connection
								.query(`INSERT INTO promocodes (promocode, type, value) VALUES ('${promo}', 'customrole', 14);`, {
									type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 994 && number <= 999) {
							prize = 5000
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли 5000 ${emoji}`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							await connection
								.query(`UPDATE money SET money = money+5000 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 950 && number <= 994) {
							prize = 2500
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли 2500 ${emoji}`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							await connection
								.query(`UPDATE money SET money = money+2500 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 750 && number <= 950) {
							prize = 1000
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли 1000 ${emoji}`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							await connection
								.query(`UPDATE money SET money = money+1000 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 600 && number <= 750) {
							prize = 500
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли 500 ${emoji}`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							await connection
								.query(`UPDATE money SET money = money+500 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 400 && number <= 600) {
							prize = 250
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, вы выиграли 250 ${emoji}`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
							await connection
								.query(`UPDATE money SET money = money+250 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
						if (number > 0 && number <= 400) {
							prize = 0
							const embedWin = new EmbedBuilder()
								.setTitle(`Коробочки`)
								.setDescription(`${author}, ничего не выиграли`)
								.setImage(image(prize, parseInt(ButtonInteraction.customId.replace('buttonBoxesBox', ''))))
								.setColor(config.color);
							await interaction.editReply({
								embeds: [embedWin],
								components: [],
							})
						}
						if (number > 999) {
							if (ghost) {
								return
							}
							const logEmbed = new EmbedBuilder()
								.setTitle("Boxes")
								.setDescription(`[1] ${author}(${author.id})\n[2] Custom role\n[3] 14 дней\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance}${emoji}`)
								.setColor('#0000ff')
								.setFooter({text: `${author.id} • ${author.guild.name}`})
								.setTimestamp()
							await logChannel.send({
								embeds: [logEmbed]
							})
						} else {
							if (ghost) {
								return
							}
							const logEmbed = new EmbedBuilder()
								.setTitle("Boxes")
								.setDescription(`[1] ${author}(${author.id})\n[2] money\n[3] ${prize}${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance+prize}${emoji}`)
								.setColor('#00ff00')
								.setFooter({text: `${author.id} • ${author.guild.name}`})
								.setTimestamp()
							await logChannel.send({
								embeds: [logEmbed]
							})
						}
						await connection
							.query(`SELECT boxes FROM money WHERE id = ${author.id}`, {
								type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
							.then((result) => sqlResult = result)
							.catch((err) => {
								console.log(`SQL: Error ${err}`)
								const lockEmbed = new EmbedBuilder()
									.setTitle(`Коробочки`)
									.setDescription(`${author}, Команда временно заблокирована`)
									.setColor(config.colorError);
								interaction.editReply({
									embeds: [lockEmbed],
									ephemeral: true
								}) 
								return
							})
						if (sqlResult[0].boxes < 0 && sqlResult[0].boxes) {
							await connection
								.query(`UPDATE money SET baneconomy = 1 WHERE id = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
						}
					})
					collector1.on('end', async () => {
						if (status == 'open') {
							for (let i = 0; i<rowOpen.components.length;i++) {
								rowOpen.components[i].setDisabled(true)
							}
							await interaction.editReply({
								components: [rowOpen]
							})
						}
					})

				}
				if (ButtonInteraction.customId === 'buttonBoxesInfo') {
					rowInfo.components[i].setDisabled(lock(boxes))
					status = 'info'
					collector.resetTimer()
					const embed = new EmbedBuilder()
						.setTitle(`Коробочки`)
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`В данный момент у вас ${boxes} ${config.emojis.ticketBoxes}, и вы всегда можете купить еще за 500 ${emoji}.

Ход игры:
${config.emojis.dot} Перетасовываем ваши коробочки. ***Происходит магия***
${config.emojis.dot} Выбирайте ту которая вам больше понравилась.
${config.emojis.dot} Получаете свой приз

Вы можете получить промокод на кастомную роль (будьте внимательны, промокод будет доступен только вам в отдельном сообщении, не забудьте записать его), приумножить свои кристаллы или потерять все`)
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed],
						components: [rowInfo],
						fetchReply: true
					})
				}
				if (ButtonInteraction.customId === 'buttonBoxesBuyToken') {
					status = 'buyToken';
					collector.resetTimer()
					const embed = new EmbedBuilder()
						.setTitle(`Коробочки`)
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`${author}, Выберите количество жетонов

1 ${config.emojis.ticketBoxes} - 500 ${emoji}
5 ${config.emojis.ticketBoxes} - 2500 ${emoji}
10 ${config.emojis.ticketBoxes} - 5000 ${emoji}
15 ${config.emojis.ticketBoxes} - 7500 ${emoji}
25 ${config.emojis.ticketBoxes} - 12500 ${emoji}`)
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed],
						components: [rowBuy, rowBuy1],
					})
					const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonBuyToken1' || ButtonInteraction.customId === 'buttonBuyToken5' || ButtonInteraction.customId === 'buttonBuyToken10' || ButtonInteraction.customId === 'buttonBuyToken15' || ButtonInteraction.customId === 'buttonBuyToken25';

                    const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                    collector1.on('collect', async ButtonInteraction => {
						if (ButtonInteraction.user.id != author.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle('Покупка токенов')
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                .setColor(config.colorError);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
						status = 'boughttokens'
						await connection
							.query(`SELECT money, jailtime, boxes, baneconomy FROM money WHERE id = ${author.id}`, {
								type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
							.then((result) => balance = sqlResult[0].money)
						await ButtonInteraction.deferUpdate()
						if (ButtonInteraction.customId === 'buttonBuyToken1') {
							tokens = 1
						}
						if (ButtonInteraction.customId === 'buttonBuyToken5') {
							tokens = 5
						}
						if (ButtonInteraction.customId === 'buttonBuyToken10') {
							tokens = 10
						}
						if (ButtonInteraction.customId === 'buttonBuyToken15') {
							tokens = 15
						}
						if (ButtonInteraction.customId === 'buttonBuyToken25') {
							tokens = 25
						}
						if (balance < 500*tokens) {
							const errorEmbed = new EmbedBuilder()
								.setTitle('Покупка токенов')
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.colorError)
								.setDescription(`${author}, у вас недостаточно средств!\n\n\\Ваш баланс: ${balance} ${emoji}`);
							await interaction.editReply({
								embeds: [errorEmbed],
								components: []
							})
							return
						}
						await connection
							.query(`UPDATE money SET money = money-${tokens*500}, boxes = boxes+${tokens} WHERE id = ${author.id};`, {
								type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
							})
						const embed = new EmbedBuilder()
							.setTitle(`Коробочки`)
							.setThumbnail(author.user.displayAvatarURL())
							.setDescription(`${author}, вы купили ${tokens} ${config.emojis.ticketBoxes}\n\n\Ваш новый баланс: ${balance-tokens*500} ${emoji}`)
							.setColor(config.color);
						await interaction.editReply({
							embeds: [embed],
							components: []
						})
						if (ghost) {
							return
						}
						const logEmbed = new EmbedBuilder()
							.setTitle(`покупка токенов`)
							.setDescription(`[1] ${author} (${author.id})
[2] buy tokens(boxes)
[3] ${tokens} ${config.emojis.ticketBoxes}
[4] ${balance}${emoji}
[5] ${balance-tokens*500}`)
							.setColor("#ff0000");
						await interaction.editReply({
							embeds: [embed],
							components: []
						})
						await logChannel.send({
							embeds: [logEmbed]
						})
					})
				}
				if (ButtonInteraction.customId === 'buttonBoxesReturn') {
					rowStart.components[0].setDisabled(lock(boxes))
					status = 'start'
					collector.resetTimer()
					const embed = new EmbedBuilder()
						.setTitle(`Коробочки`)
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`Потратьте один билет и получите шанс сыграть в волшебные коробочки, никто не знает что внутри, так как их содержимое магическим образом меняется каждый раз.\n\n${author}, у вас ${boxes} ${config.emojis.ticketBoxes}`)
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed],
						components: [rowStart],
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
				if (status == 'info') {
					for (let i = 0; i<rowInfo.components.length;i++) {
						rowInfo.components[i].setDisabled(true)
					}
					await interaction.editReply({
						components: [rowInfo]
					})
				}
				if (status == 'buyToken') {
					for (let i = 0; i<rowBuy.components.length;i++) {
						rowBuy.components[i].setDisabled(true)
					}
					for (let i = 0; i<rowBuy1.components.length;i++) {
						rowBuy1.components[i].setDisabled(true)
					}
					await interaction.editReply({
						components: [rowBuy, rowBuy1]
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








//старая параша на sql2

//console.log(results); 
		/*console.log("1");
		connection.execute(`SELECT money, bank FROM money WHERE id = ${member.id}`,
        function(err, results, fields) {
			console.log(results);
			console.log(String(results).startsWith("money", 4));
			if (String(results).startsWith("money", 4) == false) {
				console.log("2");
				connection.execute(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`,
            		function(err, results, fields) {
						console.log(err);
					});
					console.log("3", results);
			} else {
				console.log("here")
				money = results[0].money;
				bank = results[0].bank;
			}
		});*/