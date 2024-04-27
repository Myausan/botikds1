const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits} = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');
const { get } = require('mongoose');
const fs = require('fs')
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { default: test } = require('test');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('playold')
		.setDescription('в разработке')
		.addStringOption(option =>
			option.setName('text')
			.setDescription('текст')
			.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const voiceState = author.voice
		const voice = voiceState.channel
		const query = interaction.options.getString('text');
		if (author.id !== '432199748699684864') {
			interaction.reply({
				content: `${author}, у вас нет доступа к этой команде`
			})
		}
        try {
			/*const url = `https://www.googleapis.com/youtube/v3/search?key=${config.YTtoken}&type=video&part=snippet&q=${query}`;
			const response = await fetch(url);
			const data = await response.json();
			console.log(data);*/
			await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor')
			console.log(queue)
			const player = createAudioPlayer()
			const voiceConnection = joinVoiceChannel({
				channelId: voice.id,
				guildId: voice.guild.id,
				adapterCreator: voice.guild.voiceAdapterCreator,
				selfDeaf: false,
			});
			voiceConnection.subscribe(player)
			voiceConnection.on(VoiceConnectionStatus.Ready, () => {
				voiceConnection.subscribe(player)
			});
			voiceConnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
				try {
					await Promise.race([
						entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
						entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
					]);
					// Seems to be reconnecting to a new channel - ignore disconnect
				} catch (error) {
					// Seems to be a real disconnect which SHOULDN'T be recovered from
					connection.destroy();
				}
			});
			player.on("subscribe", async playerSub => {
				const result = await interaction.client.player.search(query, {
					requestedBy: interaction.user
				})
				await queue.play(voice, query)
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