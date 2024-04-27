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
		console.log(!!'false' == !!'true')
		console.log(!!'false' === !!'true')
		console.log(true == 'true')
		console.log(false == 'false')
	},
};