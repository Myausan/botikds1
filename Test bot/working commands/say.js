const { SlashCommandBuilder , EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('say')
		.addStringOption(option => 
			option.setName('id')
			.setDescription('id')
			.setRequired(false))
		.addStringOption(option =>
			option.setName('text')
			.setDescription('текст')
			.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, connection) {
		if (interaction.user.id !== '432199748699684864') {
			return
		}
		let text = interaction.options.getString('text');
		let id = interaction.options.getString('id');
		if (id) {
			msg = await interaction.channel.messages.fetch(id)
			await msg.reply({
				content: `${text}`
			})
		} else {
			await interaction.channel.send({
				content: `${text}`
			})
		}
		await interaction.reply({
			content: '👌',
			ephemeral: true
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