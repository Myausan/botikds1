const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../config.json');
const Canvas = require('canvas')
const { Image, loadImage } = require('canvas')
const axios = require('axios')
const sharp = require('sharp')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Удалить несколько сообщений')
		.addIntegerOption(option => 
			option.setName('messages')
			.setDescription('количество сообщений')
			.setRequired(true)),
	async execute(interaction, connection) {
		const author = interaction.member
		const messages = interaction.options.getInteger('messages');
		if (interaction.channel.parentId === '859031841129758740' && author.id !== config.owner_id) {
			const embed = new EmbedBuilder()
				.setTitle('Удалить несколько сообщений')
                .setDescription(`${author}, вы не можете удалять сообщения в этой категории`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
			const owner = await interaction.guild.members.fetch(config.owner_id)
			await owner.user.send(`${author} пытется удалить ${messages} сообщений в канале ${interaction.channel}`)
		}
		if (messages < 1) {
			const embed = new EmbedBuilder()
				.setTitle('Удалить несколько сообщений')
                .setDescription(`${author}, количество сообщений должно быть больше 0`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
			return
		}
		let group = () => {
			if (author.id == config.owner_id) {
				return 'Console'
			}
			if (author.roles.cache.has('630818922387472394')) {
				return 'imp'
			}
			if (author.roles.cache.has('1097900565276667995')) {
				return 'owner'
			}
			if (author.roles.cache.has('1074320229276074054')) {
				return 'so-owner'
			}
			if (author.roles.cache.has(config.roleLegendary)) {
				return '𝐋𝐞𝐠𝐞𝐧𝐝𝐚𝐫𝐲'
			}
			if (author.roles.cache.has(config.roleGods)) {
				return '𝐆𝐨𝐝𝐬'
			}
			if (author.roles.cache.has(config.roleSerafim)) {
				return '𝐒𝐞𝐫𝐚𝐩𝐡𝐢𝐦'
			}
			if (author.roles.cache.has(config.roleCurator)) {
				return '𝐀𝐫𝐡𝐚𝐧𝐠𝐞𝐥𝐮𝐬'
			}
			if (author.roles.cache.has(config.roleMod)) {
				return '𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫'
			}
			return 'none'
		}
		let clear = (group) => {
			if ((group === '𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫' || group === '𝐀𝐫𝐡𝐚𝐧𝐠𝐞𝐥𝐮𝐬') && messages > 50) {
				return 50
			}
			if (group === '𝐒𝐞𝐫𝐚𝐩𝐡𝐢𝐦' && messages > 100) {
				return 100
			}
			if ((group === '𝐆𝐨𝐝𝐬' || group === '𝐋𝐞𝐠𝐞𝐧𝐝𝐚𝐫𝐲') && messages > 200) {
				return 200
			}
			return 'delete'
		}
		if (group() == 'none') {
			const embed = new EmbedBuilder()
				.setTitle('Удалить несколько сообщений')
                .setDescription(`${author}, вы не можете этого делать`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
			return
		}
		if (clear(group()) != 'delete') {
			const embed = new EmbedBuilder()
				.setTitle('Удалить несколько сообщений')
                .setDescription(`${author}, вы не можете удалить больше ${clear(group())} сообщений`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
			return
		}
		try {
			await interaction.channel.bulkDelete(messages)
		} catch(err) {
			const embed = new EmbedBuilder()
				.setTitle('Удалить несколько сообщений')
                .setDescription(`${author}, бот может удалять сообщения, написанные не позже 14 дней`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            })
		}
		const embed = new EmbedBuilder()
			.setTitle('Удалить несколько сообщений')
            .setDescription(`${author}, удалено ${messages} сообщений`)
            .setColor(config.color);
        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
	},
};