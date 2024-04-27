const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField} = require('discord.js');
const { get, models } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('Посмотреть историю нарушений')
		.addUserOption(option => 
			option.setName('member')
			.setDescription('пользователь')
			.setRequired(false)),
	async execute(interaction, connection) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member
		const memberUser = interaction.options.getUser('member') ?? interaction.member.user;
		const reportChannel = await interaction.guild.channels.fetch('828580274643533834')
		let sqlResult;
		let moderator
		let Case = [];
		let executor = [];
		let target = [];
		let type = [];
		let duration = [];
		let reason = [];
		let time = [];
		let page = 0;
		let pageMax = 1;
		let title;
		let message
		try {
			let member
			await interaction.guild.members.fetch(memberUser.id)
			.then((fetchedMember) => {
				member = fetchedMember
				title = `История нарушений - ${member.displayName}`
			})
			.catch((err) => {
				member = memberUser
				title = `История нарушений - ${member.username}`
			})
			if (!member) {
				return
			}
			let owner = () => {
				if (author.id === config.owner_id) return true
				return false
			}
			let answer = () => {
				if (author.id === member.id) {
					return true
				} else {
					if (((author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || author.roles.cache.has(config.roleGods) || author.permissions.has(PermissionsBitField.Flags.Administrator)) || owner()) && member.id !== config.owner_id) {
						return true
					} else {
						false
					}
				}
			}
			if (!answer()) {
				const errorEmbed = new EmbedBuilder()
					.setTitle(title)
					.setThumbnail(author.user.displayAvatarURL())
					.setDescription(`${author}, вы не можете смотреть чужую историю нарушений`)
					.setColor(config.colorError);
				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true
				}) 
				return
			}
			await connection
				.query(`SELECT * FROM punishment WHERE target = ${member.id} AND deleted = 0`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
			if (sqlResult[0] === undefined) {
				const embed = new EmbedBuilder()
					.setTitle(title)
					.setThumbnail(author.user.displayAvatarURL())
					.setDescription(`Нарушений нет!`)
					.setColor(config.color);
				await interaction.reply({
					embeds: [embed],
				}) 
				return
			}
			for (let i = 0; i<sqlResult.length; i++) {
				Case.push(String(sqlResult[i].case))
				executor.push(String(sqlResult[i].executor))
				target.push(String(sqlResult[i].target))
				type.push(String(sqlResult[i].type))
				duration.push(String(sqlResult[i].duration))
				reason.push(String(sqlResult[i].reason))
				time.push(String(Math.floor(sqlResult[i].time/1000)))
			}
			let number = (num) => {
				if (num > 10) {
					return 10
				} else {
					return num
				}
			}
			let typeEmoji = (type) => {
				if (type === 'ban') {
					return config.emojis.ban
				}
				if (type === 'kick') {
					return config.emojis.kick
				}
				if (type === 'warn') {
					return config.emojis.warn
				}
				if (type === 'timeout') {
					return config.emojis.timeout
				}
				if (type === 'remove timeout') {
					return config.emojis.untimeout
				}
				if (type === 'voice mute') {
					return config.emojis.voiceMute
				}
				if (type === 'voice unmute') {
					return config.emojis.voiceUnmute
				}
				if (type === 'text mute') {
					return config.emojis.txtMute
				}
				if (type === 'text unmute') {
					return config.emojis.txtUnmute
				}
				if (type === 'eventban') {
					return config.emojis.evtBan
				}
				if (type === 'eventunban') {
					return config.emojis.evtUnban
				}
			}
			let firstFieldEmbed = () => {
				let column = ``
				for (let i = 0; i < Case.length; i++) {//for (let i = 0; i < number(Case.length-page*10);i++) {
					console.log(i)
					let temp = `#${Case[page*10+i]} ${typeEmoji(type[page*10+i])} <t:${time[page*10+i]}:d>\n`
					column = column+temp
				}
				return column
			}
			let secondFieldEmbed = () => {
				let column = ``
				for (let i = 0; i < Case.length; i++) {
					let temp = `<@${executor[page*10+i]}>\n`
					column = column+temp
				}
				return column
			}
			let thirdFieldEmbed = () => {
				let column = ``
				for (let i = 0; i < Case.length; i++) {
					let temp = `${reason[page*10+i]}\n`
					column = column+temp
				}
				return column
			}
			pageMax = Math.ceil(sqlResult.length/10)
			const embed = new EmbedBuilder()
				.setTitle(title)
				.setThumbnail(author.user.displayAvatarURL())
				.addFields(
                    {name: `\`    Тип / Дата    \``, value: `${firstFieldEmbed()}`, inline: true},
                    {name: `\`   Администратор   \``, value: `${secondFieldEmbed()}`, inline: true},
                    {name: `\`  Причина  \``, value: `${thirdFieldEmbed()}`, inline: true},
                )
				.setColor(config.color);
			await interaction.reply({
				embeds: [embed],
			}) 
			return
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonReportOpen')
						.setLabel('принять')
						.setStyle(2),
					)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonReportCancel')
						.setLabel('отклонить')
						.setStyle(4),
					)
			const embedReply = new EmbedBuilder()
				.setTitle('Жалоба')
				.setThumbnail(author.user.displayAvatarURL())
				.addFields(
					{name: 'Подал жалобу:', value: `${author}`, inline: false},
					{name: 'Жалоба подана на:', value: `${member}`, inline: false},
					{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
					{name: 'Статус:', value: `Не принята`, inline: false},
					{name: 'Причина:', value: `${reason}`, inline: false}
				)
				.setColor(config.color);
			await reportChannel.send({
				embeds: [embedReply],
				components: [row],
				fetchReply: true,
			})
			.then ((send) => {
				message = send
			})
			const filter = (ButtonInteraction => ButtonInteraction.customId === 'buttonReportOpen' || ButtonInteraction.customId === 'buttonReportCancel');

			const collector = message.createMessageComponentCollector({filter});

			collector.on('collect', async ButtonInteraction => {
				collector.stop()
				if (ButtonInteraction.customId === 'buttonReportOpen') {
					moderator = ButtonInteraction.user
					const embed = new EmbedBuilder()
						.setTitle('Жалоба')
						.setThumbnail(author.user.displayAvatarURL())
						.addFields(
							{name: 'Подал жалобу:', value: `${author}`, inline: false},
							{name: 'Жалоба подана на:', value: `${member}`, inline: false},
							{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
							{name: 'Статус:', value: `Разбор полётов`, inline: false},
							{name: 'Разбирает жалобу:', value: `${ButtonInteraction.user}`, inline: false},
							{name: 'Причина:', value: `${reason}`, inline: false}
						)
						.setColor(config.color);
					await message.edit({
						embeds: [embed],
						components: [],
					})
					const row = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonReportAddMember')
								.setLabel('Добавить пользователя')
								.setStyle(2),
							)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonReportClose')
								.setLabel('Завершить')
								.setStyle(2),
							)
					const thread = await reportChannel.threads.create({
						name: `report_${member.user.username}`,
						autoArchiveDuration: 60,
					})
					await reportChannel.lastMessage.delete()
					const embedThread = new EmbedBuilder()
						.setTitle('Жалобa')
						.setThumbnail(author.user.displayAvatarURL())
						.addFields(
							{name: 'Разбирает жалобу:', value: `${moderator}`, inline: false},
							{name: 'Жалоба подана на:', value: `${member}`, inline: false},
							{name: 'Причина:', value: `${reason}`, inline: false}
						)
						.setColor(config.color);
					await thread.send({
						embeds: [embedThread],
						components: [row],
					})
					.then ((send) => {
						threadMessage = send
					})
					await thread.members.add(`${ButtonInteraction.user.id}`)
					try {
						await thread.members.add(`${author.id}`)
					} catch(err) {

					}
					const filter = (ButtonInteraction => ButtonInteraction.customId === 'buttonReportClose' || ButtonInteraction.customId === 'buttonReportAddMember');

					const collector1 = threadMessage.createMessageComponentCollector({filter});

					collector1.on('collect', async ButtonInteraction => {
						if (ButtonInteraction.user.id != moderator.id) {
							const banEmbed = new EmbedBuilder()
								.setThumbnail(author.user.displayAvatarURL())
								.setDescription(`${member}, вы не можете этого делать`)
								.setColor(config.colorError);
							await ButtonInteraction.reply({
								embeds: [banEmbed],
								ephemeral: true
							}) 
							return
						}
						if (ButtonInteraction.customId === 'buttonReportAddMember') {
							const modal = new ModalBuilder()
								.setCustomId('modalReport')
								.setTitle('Добавить пользователя');
							const IdInput = new TextInputBuilder()
								.setCustomId('modalReportMemberId')
								.setLabel('Введите ID пользователя')
								.setPlaceholder('012345678910121314')
								.setStyle(TextInputStyle.Short)
								.setRequired(true)
							const firstActionRow = new ActionRowBuilder().addComponents(IdInput)
							modal.addComponents(firstActionRow)
							await ButtonInteraction.showModal(modal);
                            const filter = (ModalInteraction) => ModalInteraction.customId === 'modalReport';
                            ButtonInteraction.awaitModalSubmit({ filter, time: 60000 })
                            .then(async ModalInteraction => {
								const IdInput = ModalInteraction.components[0].components[0].value
								await interaction.guild.members.fetch(IdInput)
								.then((fetchedMember) => memberAdd = fetchedMember)
								.catch( async (err) => {
									const errorEmbed = new EmbedBuilder()
										.setTitle("Добавление пользователя")
										.setDescription(`${moderator}, пользователь не найден`)
										.setColor(config.colorError);
									await ModalInteraction.reply({
										embeds: [errorEmbed],
										ephemeral: true
									}) 
									return
								})
								await thread.members.add(`${memberAdd.id}`)
								const Embed = new EmbedBuilder()
									.setTitle("Добавление пользователя")
									.setDescription(`${moderator}, вы добавили пользователя ${memberAdd}`)
									.setColor(config.color);
								await ModalInteraction.reply({
									embeds: [Embed],
									ephemeral: true
								}) 
							})
							.catch((err) => {

							})
						}
						if (ButtonInteraction.customId === 'buttonReportClose') {
							collector1.stop()
							await thread.delete();
							const embed = new EmbedBuilder()
								.setTitle('Жалоба')
								.setThumbnail(author.user.displayAvatarURL())
								.addFields(
									{name: 'Подал жалобу:', value: `${author}`, inline: false},
									{name: 'Жалоба подана на:', value: `${member}`, inline: false},
									{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
									{name: 'Разбирает жалобу:', value: `${ButtonInteraction.user}`, inline: false},
									{name: 'Статус:', value: `Разбрана`, inline: false},
									{name: 'Причина:', value: `${reason}`, inline: false}
								)
								.setColor(config.color);
							await message.edit({
								embeds: [embed],
								components: [],
							})
						}
					})
				}
				await ButtonInteraction.deferUpdate()
				if (ButtonInteraction.customId === 'buttonReportCancel') {
					const embed = new EmbedBuilder()
						.setTitle('Жалоба')
						.setThumbnail(author.user.displayAvatarURL())
						.addFields(
							{name: 'Подал жалобу:', value: `${author}`, inline: false},
							{name: 'Жалоба подана на:', value: `${member}`, inline: false},
							{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
							{name: 'Статус:', value: `Отклонена`, inline: false},
							{name: 'ОТклонил жалобу:', value: `${ButtonInteraction.user}`, inline: false},
							{name: 'Причина:', value: `${reason}`, inline: false}
						)
						.setColor(config.color);
					await message.edit({
						embeds: [embed],
						components: [],
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