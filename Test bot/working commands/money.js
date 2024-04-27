const { SlashCommandBuilder , EmbedBuilder, Emoji} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('money')
		.setDescription('узнать баланс')
		.addUserOption(option => 
			option.setName('member')
			.setDescription('пользователь')
			.setRequired(false)),
	async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member
		const user = interaction.options.getUser('member') ?? interaction.member;
		const member = await interaction.guild.members.fetch(user.id)
		const emoji = config.emoji;
		let balance = 0;
		let bank = 0;
		let sqlResult;
		let baneconomy = 0;
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
				.setTitle(`Баланс:   ${member.displayName}`)
                .setDescription(`${member}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
		}
		try {
			await connection
				.query(`SELECT money, bank, baneconomy FROM money WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
					console.log(`SQL: Error ${err}`)
					const lockEmbed = new EmbedBuilder()
						.setTitle(`Баланс   ${author.displayName}`)
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
				baneconomy = sqlResult[0].baneconomy
			}
			await connection
				.query(`SELECT money, bank, baneconomy FROM money WHERE id = ${member.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
					console.log(`SQL: Error ${err}`)
					const lockEmbed = new EmbedBuilder()
						.setTitle(`Баланс   ${author.user.username}`)
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
				bank = sqlResult[0].bank
				balance = sqlResult[0].money;
			}

			balance = "```" + String(balance) + "```";
			bank = "```" + String(bank) + "```";
			const embed = new EmbedBuilder()
				.setTitle(`Баланс   ${member.user.username}`)
				.setThumbnail(member.user.displayAvatarURL())
				.addFields(
					{name: `${emoji} Кристаллов:ᅠᅠ`, value: `${balance}`, inline: true},
					{name: `${config.emojianim} Электрокристаллы:`, value: `${bank}`, inline: true}
				)
				.setColor(config.color);
			await interaction.reply({
				embeds: [embed]
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