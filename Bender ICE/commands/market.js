const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('market')
		.setDescription('Посмотреть магазин личных ролей'),
	async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`);
		const emoji = config.emoji;
		let baneconomy = 0;
		let balance = 0;
		let ghost = 0;
        let sqlResult;
		let roleNumber = 0; //номер текущих ролей в магазине
		let pageCurrent = 0; // текущая страница
        let pageMax = 0; // текущая страница
		let roles = [];
		let message;
		let status = 'start'
		if (DB.lockedCommands.includes(interaction.commandName)) {
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
				.query(`SELECT money, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
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
			pageMax = Math.floor(rolesCount/5)
			await connection
				.query(`SELECT * FROM tmroles WHERE cost > 0;`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			.then((result) => sqlResult = result);
			for (let i = 0;i<=rolesCount;i++) {
				const roleObject = {
					roleid: String(sqlResult[i].roleid),
					authorid: sqlResult[i].authorid,
					cost: sqlResult[i].cost,
					bought: sqlResult[i].bought
				}
				roles.push(roleObject); //массив с id ролей
			}
			let lock = (rolesTempNumber) => {
				if (rolesTempNumber <= rolesCount) {
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
				if (pageCurrent == 0) {
					return true
				} else {
					return false
				}
			}
			
			const row = new ActionRowBuilder()
			for (let i = 0; i < 5; i++) {
				row.addComponents(
					new ButtonBuilder()
						.setCustomId(`buttonTmBuy${i+1}`)
						.setLabel(`${i+1}`)
						.setEmoji(`${config.emojis.buy}`)
						.setStyle(2)
						.setDisabled(lock(i)),
				)
			}
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
					return `<@&${roles[number].roleid}>`
				} else {
					return 'Пусто'
				}
			}
			let member = (number) => {
				if (number <= rolesCount) {
					return `<@${roles[number].authorid}>`
				} else {
					return 'Пусто'
				}
			}
			let cost = (number) => {
				if (number <= rolesCount) {
					return `${roles[number].cost} ${emoji}`
				} else {
					return 'Пусто'
				}
			}
			let bought = (number) => {
				if (number <= rolesCount) {
					return `${roles[number].bought}`
				} else {
					return 'Пусто'
				}
			}
			let getDescription = () => {
				let description = ``
				for (let i = 0; i < 5; i++) {
					description+=`[${num(pageCurrent*5+i)}] ${role(pageCurrent*5+i)}
Продавец: ${member(pageCurrent*5+i)}
Цена: ${cost(pageCurrent*5+i)}
Куплена раз: ${bought(pageCurrent*5+i)}\n\n`
				}
				return description
			}
			const Embed = new EmbedBuilder()
				.setTitle("Магазин личных ролей")
				.setThumbnail(author.user.displayAvatarURL())
				.setDescription(getDescription())
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
				}
				await ButtonInteraction.deferUpdate()
				await connection
					.query(`SELECT money FROM money WHERE id = ${author.id}`, {
						type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
				.then((result) => sqlResult = result)
				money = sqlResult[0].money
				if (ButtonInteraction.customId === 'buttonTmBuy1' || ButtonInteraction.customId === 'buttonTmBuy2' || ButtonInteraction.customId === 'buttonTmBuy3' || ButtonInteraction.customId === 'buttonTmBuy4' || ButtonInteraction.customId === 'buttonTmBuy5') {
					status = 'buy'
					switch(buttonId) {
						case 'buttonTmBuy1':
							roleNumber = pageCurrent * 5
							break;
						case 'buttonTmBuy2':
							roleNumber = pageCurrent * 5 + 1
							break;
						case 'buttonTmBuy3':
							roleNumber = pageCurrent * 5 + 2
							break;
						case 'buttonTmBuy4':
							roleNumber = pageCurrent * 5 + 3
							break;
						case 'buttonTmBuy5':
							roleNumber = pageCurrent * 5 + 4
					}
					if (balance < roles[roleNumber].cost){
						Embed
							.setColor(config.colorError)
							.setDescription(`${author}, у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`);
						await interaction.editReply({
							embeds: [errorEmbed],
							components: []
						})
						return
					}
					for (let i = 0; i<author.roles.length; i++){
						if (author.roles[i].id == roles[roleNumber].roleid) {
							Embed
								.setColor(config.colorError)
								.setDescription(`${author}, у вас уже есть эта роль`);
							await interaction.editReply({
								embeds: [errorEmbed],
								components: [],
							})
							return
						}
					}
					await connection
						.query(`SELECT money FROM money WHERE id = ${roles[roleNumber].memberid}`, {
							type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
					.then((result) => sqlResult = result)
					let money10 = Math.floor(roles[roleNumber].cost*0.96)
					await connection
						.query(`UPDATE money SET money = money-${roles[roleNumber].cost} WHERE id = ${author.id};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					await connection
						.query(`UPDATE money SET money = money+${money10}, exp=exp+${money10} WHERE id = ${roles[roleNumber].memberid};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					await connection
						.query(`UPDATE tmroles SET bought = bought+1 WHERE roleid = ${roles[roleNumber].roleid};`, {
							type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					await connection
						.query(`INSERT INTO tmmembers(id, roleid, timestamp) VALUES (${author.id},${roles[roleNumber].roleid},${Date.now()+7*24*60*60*1000}) `, {
							type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					const role = await author.guild.roles.fetch(roles[roleNumber].roleid);
					author.roles.add(role, 'buy role')
					Embed.setDescription(`${author}, вы успешно купили роль ${role}\n\n\\Ваш новый баланс: ${balance-roles[roleNumber].cost} ${emoji}`)
					await interaction.editReply({
						embeds: [Embed],
						components: [],
					})
					if (ghost) {
						return
					}
					const logEmbed = new EmbedBuilder()
						.setTitle("Buy")
						.setDescription(`[1] <@${config.client_id}>(${config.client_id})\n[2] Tm buy\n [3]${author}(${author.id}) \n[4] ${role}(${role.id})\n[5] Цена: ${roles[roleNumber].cost}${emoji}\n[6] До ${Date.now()+7*24*60*60*1000}\n[7] Старый баланс: ${balance}${emoji} \n[8] Новый баланс: ${roles[roleNumber].cost}${emoji}\n[9] Старый баланс <@${roles[roleNumber].memberid}>: ${balance}${emoji} \n[10] Новый баланс <@${roles[roleNumber].memberid}>: ${roles[roleNumber].cost}${emoji}`)
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
					for (let i = 0; i < 5; i++) {
						row.components[i]
							.setLabel(`${pageCurrent*5+i+1}`)
							.setDisabled(lock(pageCurrent*5+i))
					}
					row1.components[0].setDisabled(lockLeft())
					row1.components[1].setDisabled(lockRight())
					Embed.setDescription(getDescription())
					await interaction.editReply({
						embeds: [Embed],
						components: [row, row1],
					})
				}
				if (buttonId == 'buttonTmLeft') {
					if (pageCurrent === 0) {
						await ButtonInteraction.followUp({
							content: 'При выполнении запроса произошла ошибка!',
							ephemeral: true 
						});
					}
					pageCurrent--;
					for (let i = 0; i < 5; i++) {
						row.components[i]
							.setLabel(`${pageCurrent*5+i+1}`)
							.setDisabled(lock(pageCurrent*5+i))
					}
					row1.components[0].setDisabled(lockLeft())
					row1.components[1].setDisabled(lockRight())
					Embed.setDescription(getDescription())
					await interaction.editReply({
						embeds: [Embed],
						components: [row, row1],
					})
				}
			})
			collector.on('end', async () => {
				if (status == 'buy') {
					return
				}
				for (let i = 0; i < 5; i++) {
					row.components[i].setDisabled(true)
				}
				row1.components[0].setDisabled(true)
				row1.components[1].setDisabled(true)
				await interaction.editReply({
					components: [row, row1],
				})
			})
		} catch(err) {
			if (err.code != 10062) {
				DB.lockedCommands.push(interaction.commandName)
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