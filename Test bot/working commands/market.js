const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('market')
		.setDescription('Посмотреть магазин личных ролей'),
	async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`);
		const emoji = config.emoji;
		let baneconomy = 0;
		let balance = 0;
		let jailtime = 0;
		let ghost = 0;
        let sqlResult;
		let roleNumber = 0; //номер текущих ролей в магазине
        let rolesTempNumber = 0; //переменная для перебора блокировок кнопок
		let pageCurrent = 1; // текущая страница
        let pageMax = 1; // текущая страница
		let roles = [];
		let members = [];
		let timestamps = [];
		let costs = [];
		let message;
		let temp = 0;
		let status = 'start'
		let now = Date.now();
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Магазин личных ролей")
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
				.query(`SELECT money, jailtime, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Магазин личных ролей")
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
					.setTitle("Магазин личных ролей")
					.setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
					.setColor(config.colorError);
				await interaction.reply({
					embeds: [banEmbed],
					ephemeral: true
				}) 
				return
			}
			await connection
				.query(`SELECT COUNT(roleid) as count FROM tmroles WHERE cost > 0;`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			.then((result) => sqlResult = result);
			const rolesCount = sqlResult[0].count-1 // количество ролей
			pageMax = Math.ceil((rolesCount+1)/5)
			await connection
				.query(`SELECT * FROM tmroles WHERE cost > 0;`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			.then((result) => sqlResult = result);
			for (let i = 0;i<=rolesCount;i++) {
				roles.push(String(sqlResult[i].roleid)); //массив с id ролей
				members.push(String(sqlResult[i].authorid)); //массив с id юзеров
				timestamps.push(sqlResult[i].timestamp) //массив с timestamp
				costs.push(sqlResult[i].cost) //массив с ценами
			}
			let lock = (rolesTempNumber) => {
				if (rolesTempNumber <= rolesCount && jailtime < now) {
					return false
				} else {
					return true
				}
			}
			let lockRight = () => {
				if (pageCurrent == pageMax) {
					return true
				} else {
					return false
				}
			}
			let lockLeft = () => {
				if (pageCurrent == 1) {
					return true
				} else {
					return false
				}
			}
			
			const row = new ActionRowBuilder()
			for (rolesTempNumber = roleNumber; rolesTempNumber<roleNumber+5; rolesTempNumber++) {
				temp++;
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(`buttonTmBuy${temp}`)
						.setLabel(`${rolesTempNumber+1}`)
						.setEmoji(`${config.emojis.buy}`)
						.setStyle(2)
						.setDisabled(lock(rolesTempNumber)),
				)
			}
			temp = 0;
			const row1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonTmLeft')
						.setEmoji(`${config.emojis.left}`)
						.setStyle(2)
						.setDisabled(true)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonTmRight')
						.setEmoji(`${config.emojis.right}`)
						.setStyle(2)
						.setDisabled(lockRight()),
				);
			let num = number => {
				return number+1
			}
			let role = (number) => {
				if (number <= rolesCount) {
					return `<@&${roles[number]}>`
				} else {
					return 'Пусто'
				}
			}
			let member = (number) => {
				if (number <= rolesCount) {
					return `<@${members[number]}>`
				} else {
					return 'Пусто'
				}
			}
			let cost = (number) => {
				if (number <= rolesCount) {
					return `${costs[number]} ${emoji}`
				} else {
					return 'Пусто'
				}
			}
			let time = (number) => {
				roleNumber++;
				if (number <= rolesCount) {
					let now = timestamps[number] - Date.now()
					let m = Math.floor(now/60000) % 60;
					let h = Math.floor(now/60000/60) % 24;
					let d = Math.floor(now/60000/60/24);
					let result = `${d}д ${h}ч ${m}м`
					return result
				} else {
					return '---'
				}
			}
			const Embed = new EmbedBuilder()
				.setTitle("Магазин личных ролей")
				.setThumbnail(author.user.displayAvatarURL())
				.setDescription(`[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}`)
				.setColor(config.color);
			await interaction.reply({
				embeds: [Embed],
				components: [row, row1],
				fetchReply: true
			})
			.then ((send) => {
				message = send
			})
			const collector = message.createMessageComponentCollector({componentType: ComponentType.Button, time: 120000 });

			collector.on('collect', async ButtonInteraction => {
				let buttonId = ButtonInteraction.customId;
				if (ButtonInteraction.user.id != author.id) {
					const errorEmbed = new EmbedBuilder()
						.setDescription(`${ButtonInteraction.user}, вы не можете этого делать`)
						.setColor(config.colorError);
					await ButtonInteraction.reply({
						embeds: [errorEmbed],
						ephemeral: true
					})
					return
				}//roleNumber = 5
				await connection
					.query(`SELECT money FROM money WHERE id = ${author.id}`, {
						type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
				.then((result) => sqlResult = result)
				money = sqlResult[0].money
				m = number => {
					return number+1
				}
				let role = (number) => {
					if (number <= rolesCount) {
						return `<@&${roles[number]}>`
					} else {
						return 'Пусто'
					}
				}
				let member = (number) => {
					if (number <= rolesCount) {
						return `<@${members[number]}>`
					} else {
						return 'Пусто'
					}
				}
				let cost = (number) => {
					if (number <= rolesCount) {
						return `${costs[number]} ${emoji}`
					} else {
						return 'Пусто'
					}
				}
				let time = (number) => {
					roleNumber++;
					if (number <= rolesCount) {
						let now = timestamps[number] - Date.now()
						let m = Math.floor(now/60000) % 60;
						let h = Math.floor(now/60000/60) % 24;
						let d = Math.floor(now/60000/60/24);
						let result = `${d}д ${h}ч ${m}м`
						return result
					} else {
						return '---'
					}
				}
				if (ButtonInteraction.customId === 'buttonTmBuy1' || ButtonInteraction.customId === 'buttonTmBuy2' || ButtonInteraction.customId === 'buttonTmBuy3' || ButtonInteraction.customId === 'buttonTmBuy4' || ButtonInteraction.customId === 'buttonTmBuy5') {
					status = 'buy'
					switch(buttonId) {
						case 'buttonTmBuy1':
							roleNumber = roleNumber - 5
							break;
						case 'buttonTmBuy2':
							roleNumber = roleNumber - 4
							break;
						case 'buttonTmBuy3':
							roleNumber = roleNumber - 3
							break;
						case 'buttonTmBuy4':
							roleNumber = roleNumber - 2
							break;
						case 'buttonTmBuy5':
							roleNumber = roleNumber - 1
					}
					if (balance < costs[roleNumber]){
						const errorEmbed = new EmbedBuilder()
							.setTitle("Магазин личных ролей")
							.setColor(config.colorError)
							.setThumbnail(author.user.displayAvatarURL())
							.setDescription(`${author},  у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`);
						await ButtonInteraction.update({
							embeds: [errorEmbed],
							components: [],
							fetchReply: true
						})
						.then ((send) => {
							message = send
						})
						return
					}
					for (let i = 0; i<author.roles.length; i++){
						if (author.roles[i].id == roles[roleNumber]) {
							const errorEmbed = new EmbedBuilder()
								.setTitle("Магазин личных ролей")
								.setColor(config.colorError)
								.setThumbnail(author.user.displayAvatarURL())
								.setDescription(`${author}, у вас уже есть эта роль`);
							await ButtonInteraction.update({
								embeds: [errorEmbed],
								components: [],
								fetchReply: true
							})
							.then ((send) => {
								message = send
							})
							return
						}
					}
					await connection
						.query(`SELECT bank FROM money WHERE id = ${members[roleNumber]}`, {
							type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
					.then((result) => sqlResult = result)
					let money10 = Math.floor(costs[roleNumber]/5)
					await connection
						.query(`UPDATE money SET money = money-${costs[roleNumber]} WHERE id = ${author.id};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					await connection
						.query(`UPDATE money SET bank = bank+${money10} WHERE id = ${members[roleNumber]};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					await connection
						.query(`UPDATE tmroles SET bought = bought+1 WHERE roleid = ${roles[roleNumber]};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					const role = await author.guild.roles.fetch(roles[roleNumber]);
					author.roles.add(role, 'buy role')
					const embed = new EmbedBuilder()
						.setTitle("Магазин личных ролей")
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`${author}, вы успешно купили роль ${role}\n\n\\Ваш новый баланс: ${balance-costs[roleNumber]} ${emoji}`)
						.setColor(config.color);
					await ButtonInteraction.update({
						embeds: [embed],
						components: [],
						fetchReply: true
					})
					if (ghost) {
						return
					}
					const logEmbed = new EmbedBuilder()
						.setTitle("Buy")
						.setDescription(`[1] <@${config.client_id}>(${config.client_id})\n[2] tm buy\n [3]${author}(${author.id}) \n[4] ${role}(${role.id})\n[5] Цена: ${costs[roleNumber]}${emoji}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${costs[roleNumber]}${emoji}\n[8] Старый баланс <@${members[roleNumber]}>: ${balance}${emoji} \n[9] Новый баланс <@${members[roleNumber]}>: ${costs[roleNumber]}${emoji}`)
						.setColor('#00ff00')
						.setFooter({text: `${author.id} • ${author.guild.name}`})
						.setTimestamp()
					await logChannel.send({
						embeds: [logEmbed]
					})
					return
				}
				if (buttonId == 'buttonTmRight') {
					if (pageCurrent === pageMax) {
						await ButtonInteraction.followUp({
							content: 'При выполнении запроса произошла ошибка!',
							ephemeral: true 
						});
					}
					pageCurrent++;
					const row = new ActionRowBuilder()
					for (rolesTempNumber = roleNumber; rolesTempNumber<roleNumber+5; rolesTempNumber++) {
						temp++;
						row.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonTmBuy${temp}`)
								.setLabel(`${rolesTempNumber+1}`)
								.setEmoji(`${config.emojis.buy}`)
								.setStyle(2)
								.setDisabled(lock(rolesTempNumber)),
						)
					}
					temp = 0;
					const row1 = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonTmLeft')
								.setEmoji(`${config.emojis.left}`)
								.setStyle(2)
								.setDisabled(lockLeft()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonTmRight')
								.setEmoji(`${config.emojis.right}`)
								.setStyle(2)
								.setDisabled(lockRight()),
						);
					const Embed = new EmbedBuilder()
						.setTitle("Магазин личных ролей")
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}
						
[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}
						
[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}`)
						.setColor(config.color);
					await ButtonInteraction.update({
						embeds: [Embed],
						components: [row, row1],
					})
				}
				if (buttonId == 'buttonTmLeft') {
					if (pageCurrent === 1) {
						await ButtonInteraction.followUp({
							content: 'При выполнении запроса произошла ошибка!',
							ephemeral: true 
						});
					}
					roleNumber = roleNumber - 10
					pageCurrent--;
					const row = new ActionRowBuilder()
					for (rolesTempNumber = roleNumber; rolesTempNumber<roleNumber+5; rolesTempNumber++) {
						temp++;
						row.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonTmBuy${temp}`)
								.setLabel(`${rolesTempNumber+1}`)
								.setEmoji(`${config.emojis.buy}`)
								.setStyle(2)
								.setDisabled(lock(rolesTempNumber)),
						)
					}
					temp = 0;
					const row1 = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonTmLeft')
								.setEmoji(`${config.emojis.left}`)
								.setStyle(2)
								.setDisabled(lockLeft()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonTmRight')
								.setEmoji(`${config.emojis.right}`)
								.setStyle(2)
								.setDisabled(lockRight()),
						);
					const Embed = new EmbedBuilder()
						.setTitle("Магазин личных ролей")
						.setThumbnail(author.user.displayAvatarURL())
						.setDescription(`[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}

[${num(roleNumber)}] ${role(roleNumber)}
Продавец: ${member(roleNumber)}
Цена: ${cost(roleNumber)}
Истекает через: ${time(roleNumber)}`)
						.setColor(config.color);
					await ButtonInteraction.update({
						embeds: [Embed],
						components: [row, row1],
					})
				}
			})
			collector.on('end', async () => {
				if (status == 'buy') {
					return
				}
				roleNumber = roleNumber - 5;
				const row = new ActionRowBuilder()
				temp = 0;
				for (rolesTempNumber = roleNumber; rolesTempNumber<roleNumber+5; rolesTempNumber++) {
					temp++;
					row.addComponents(
						new ButtonBuilder()
							.setCustomId(`buttonTmBuy${temp}`)
							.setLabel(`${rolesTempNumber+1}`)
							.setEmoji(`${config.emojis.buy}`)
							.setStyle(2)
							.setDisabled(true),
					)
				}
				temp = 0;
				const row1 = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('buttonTmLeft')
							.setEmoji(`${config.emojis.left}`)
							.setStyle(2)
							.setDisabled(true),
					)
					.addComponents(
						new ButtonBuilder()
							.setCustomId('buttonTmRight')
							.setEmoji(`${config.emojis.right}`)
							.setStyle(2)
							.setDisabled(true),
					);
				await interaction.editReply({
					components: [row, row1],
				})
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