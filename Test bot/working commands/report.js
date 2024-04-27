const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, Embed} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('отправить репорт')
		.addUserOption(option => 
			option.setName('member')
			.setDescription('пользователь')
			.setRequired(true))
		.addStringOption(option => 
			option.setName('reason')
			.setDescription('причина репорта')
			.setRequired(true)),
	async execute(interaction, connection) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const member = await interaction.guild.members.fetch(interaction.options.getUser('member'));
		const reason = interaction.options.getString('reason');
		let sqlResult;
		let baneconomy = 0;
		await connection
			.query(`SELECT baneconomy FROM money WHERE id = ${member.id}`, {
				type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
		})
			.then((result) => sqlResult = result)
		if (sqlResult[0] === undefined) {
			await connection
			.query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
				type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
		} else {
            baneconomy = sqlResult[0].baneconomy
		}

		if (baneconomy == 1) {
            const banEmbed = new EmbedBuilder()
				.setDescription(`${member}, вы не можете использовать эту команду`)
				.setColor(config.colorError);
			await interaction.reply({
				embeds: [banEmbed],
				ephemeral: true
			}) 
			return
        }
		const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buttonReport')
                    .setLabel('принять')
                    .setStyle(2),
                )

		const embed = new EmbedBuilder()
			.setTitle('Жалоба')
			.setThumbnail(author.user.displayAvatarURL())
			.addFields(
				{name: 'Подал жалобу:', value: `${author}`, inline: false},
				{name: 'Жалоба подана на:', value: `${member}`, inline: false},
				{name: 'Статус:', value: `Не принята`, inline: false},
				{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
				{name: 'Причина:', value: `${reason}`, inline: false}
			)
			.setColor(config.color);
		await interaction.reply({
			embeds: [embed],
			components: [row],
			fetchReply: true,
		})
		.then ((send) => {
			message = send
		})
		const filter = (ButtonInteraction => ButtonInteraction.customId === 'buttonReport');

        const collector = message.createMessageComponentCollector({filter});

        collector.on('collect', async ButtonInteraction => {
			const embed = new EmbedBuilder()
				.setTitle('Жалоба')
				.setThumbnail(author.user.displayAvatarURL())
				.addFields(
					{name: 'Подал жалобу:', value: `${author}`, inline: false},
					{name: 'Жалоба подана на:', value: `${member}`, inline: false},
					{name: 'Разбирает жалобу:', value: `${ButtonInteraction.user}`, inline: false},
					{name: 'Статус:', value: `Разбор полётов`, inline: false},
					{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
					{name: 'Причина:', value: `${reason}`, inline: false}
				)
				.setColor(config.color);
			await interaction.editReply({
				embeds: [embed],
				components: [],
			})
			const row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonReportClose')
						.setLabel('завершить')
						.setStyle(2),
					)
			const thread = await interaction.channel.threads.create({
				name: `report_${member.user.username}`,
				autoArchiveDuration: 60,
			})
			await thread.members.add(`${ButtonInteraction.user.id}`)
			await thread.members.add(`${author.id}`)
			const embedThread = new EmbedBuilder()
				.setTitle('Жалобa')
				.setThumbnail(author.user.displayAvatarURL())
				.addFields(
					{name: 'Разбирает жалобу:', value: `${ButtonInteraction.user}`, inline: false},
					{name: 'Жалоба подана на:', value: `${member}`, inline: false},
					{name: 'Причина:', value: `${reason}`, inline: false}
				)
				.setColor(config.color);
			await thread.send({
				embeds: [embedThread],
				components: [row],
				fetchReply: true
			})
			.then ((send) => {
				message = send
			})
			const filter = (ButtonInteraction => ButtonInteraction.customId === 'buttonReportClose');

			const collector1 = message.createMessageComponentCollector({filter});

			collector1.on('collect', async ButtonInteraction => {
				ButtonMemeber = await interaction.guild.members.fetch(ButtonInteraction.user.id)
				if (ButtonMemeber.user.id !== author.id) {
					await thread.delete();
					const embed = new EmbedBuilder()
						.setTitle('Жалоба')
						.setThumbnail(author.user.displayAvatarURL())
						.addFields(
							{name: 'Подал жалобу:', value: `${author}`, inline: false},
							{name: 'Жалоба подана на:', value: `${member}`, inline: false},
							{name: 'Разбирает жалобу:', value: `${ButtonInteraction.user}`, inline: false},
							{name: 'Статус:', value: `Разбрана`, inline: false},
							{name: 'Высшая роль:', value: `${member.roles.highest}`, inline: false},
							{name: 'Причина:', value: `${reason}`, inline: false}
						)
						.setColor(config.color);
					await interaction.editReply({
						embeds: [embed],
						components: [],
					})
				}
			})
		})
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