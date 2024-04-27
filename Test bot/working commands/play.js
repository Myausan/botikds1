const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("play a song from YouTube.")
        /*.addSubcommand(subcommand =>
            subcommand
                .setName("search")
                .setDescription("Searches for a song and plays it")
                .addStringOption(option =>
                    option.setName("searchterms").setDescription("search keywords").setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("playlist")
                .setDescription("Plays a playlist from YT")
                .addStringOption(option => option.setName("url").setDescription("the playlist's url").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("song")
                .setDescription("Plays a single song from YT")
                .addStringOption(option => option.setName("url").setDescription("the song's url").setRequired(true))
        )*/
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction, connection, lockedCommands) {
            let bot = await message.guild.members.fetch(config.bot_id)
            let voice = await message.guild.channels.fetch('664208940476661762')
            const voiceconnection = joinVoiceChannel({
                channelId: voice.id,
                guildId: voice.guild.id,
                adapterCreator: voice.guild.voiceAdapterCreator,
                selfDeaf: false,
            });
            voiceconnection.
            voiceconnection.on(VoiceConnectionStatus.Ready, () => {
                console.log(voiceconnection);
            });
            voiceconnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
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
	}
};