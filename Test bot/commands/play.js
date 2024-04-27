const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits} = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');
const { useMainPlayer } = require('discord-player');
const ytdl = require('ytdl-core');
const config = require('../config.json');
const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: config.YTtoken
});
const { default: test } = require('test');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('в разработке')
		.addStringOption(option =>
			option.setName('query')
			.setDescription('запрос')
			.setRequired(false))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const voiceState = author.voice
		const voice = voiceState.channel
		const query = interaction.options.getString('query');
		let url
		if (author.id !== '432199748699684864') {
			interaction.reply({
				content: `${author}, у вас нет доступа к этой команде`
			})
		}
        try {
			await youtube.search.list({
				part: 'id',
				q: query,
				type: 'video'
			}).then(response => {
				const items = response.data.items;
				console.log(items[0].id.videoId)
				url = `https://www.youtube.com/watch?v=${items[0].id.videoId}`
				console.log(url)
			}).catch(err => {
				console.error('Ошибка:', err);
			});
			const voiceChannel = interaction.member.voice.channel;
		
			if (!voiceChannel) {
			return interaction.reply('Вы должны быть в голосовом канале, чтобы запустить видео');
			}
		
			try {
			const voiceConnection = joinVoiceChannel({
				channelId: voice.id,
				guildId: voice.guild.id,
				adapterCreator: voice.guild.voiceAdapterCreator,
				selfDeaf: false,
			});
			const player = createAudioPlayer()
			voiceConnection.subscribe(player)
			player.on("subscribe", async playerSub => {
			})
			await interaction.client.player.play(voice, url, {
				quality: 'highestaudio',
			  })
			//voiceConnection.play(ytdl(url, { filter: 'audioonly' }));
			} catch (error) {
				console.error(error);
				interaction.reply('Ошибка при воспроизведении видео');
			}
			  
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