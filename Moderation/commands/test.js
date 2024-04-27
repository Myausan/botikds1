const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../config.json');
const Canvas = require('canvas')
const { Image, loadImage } = require('canvas')
const axios = require('axios')
const sharp = require('sharp')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
	async execute(interaction, connection) {
		const author = interaction.member
		const rowStart = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesOpen')
						.setLabel('открыть')
						.setStyle(2)
						.setEmoji('<:open_box:1105481971146170471>')
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesBuyToken')
						.setLabel('Купить жетоны')
						.setEmoji('<:buytokenboxes:1108120859387895808>')
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonBoxesInfo')
						.setLabel('инфа')
						.setEmoji('<:info:1105481084625490040>')
						.setStyle(2),
				)
		const embed = new EmbedBuilder()
			.setTitle(`Коробочки`)
			.setThumbnail(author.user.displayAvatarURL())
			.setDescription(`Потратьте один билет и получите шанс сыграть в волшебные коробочки, никто не знает что внутри, так как их содержимое магическим образом меняется каждый раз.\n\n${author}, у вас ${1} <:tokenboxes:1108120857424957461>`)
			.setColor(config.color);
		await interaction.reply({
			embeds: [embed],
			components: [rowStart],
			fetchReply: true
		})
		.then ((send) => {
			message = send
		})
		//const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonBoxesOpen' || ButtonInteraction.customId === 'buttonBoxesInfo' || ButtonInteraction.customId === 'buttonBoxesReturn' || ButtonInteraction.customId === 'buttonBoxesBuyToken';

		const collector = message.createMessageComponentCollector({time: 10000 });

		collector.on('collect', async ButtonInteraction => {
			console.log("asd")
		})
		await collector.handleCollect()
		console.log("asd1")
	},
};