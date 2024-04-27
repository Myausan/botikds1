const { SlashCommandBuilder , EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('action')
		.setDescription('В разработке')
        .addUserOption(option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, connection) {
        const author = interaction.member;
        const memberUser = interaction.options.getUser('member');
        const member = await interaction.guild.members.fetch(memberUser.id);
        const logChannelRoles = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`)
		const logChannelBanKick = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logBanKick}`)
        const permissions = author.permissions.toArray()
        const aRolePosition = author.roles.highest.position
        const mRolePosition = member.roles.highest.position
        const botRolePosition = interaction.guild.me.roles.highest.position
        let sqlResult;
        let actions = 0;
        let block = 0;
        let status = 'start';
        let message;
        try {
            let ban = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.BanMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let kick = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.KickMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let roleManage = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.ManageRoles) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let textMute = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.ManageMessages) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let voiceMute = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.MuteMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let timeout = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.ModerateMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let manageNicknames = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.ManageNicknames) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let eventBan = () => {
                if ((author.roles.cache.has() || permissions.has(PermissionFlagsBits.ManageRoles) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let group = () => {
                return 'ADMIN'
            }
            const rowStart1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionBan')
                        .setLabel('ban')
                        .setDisabled(ban())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionKick')
                        .setLabel('kick')
                        .setDisabled(kick())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageRoles')
                        .setLabel('manage roles')
                        .setDisabled(roleManage())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTimeout')
                        .setLabel('Timeout')
                        .setDisabled(timeout())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionUntimeout')
                        .setLabel('Untimeout')
                        .setDisabled(timeout())
                        .setStyle(2),
                )
            const rowStart2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionVoiceMute')
                        .setLabel('Voice mute')
                        .setDisabled(voiceMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionVoiceUnmute')
                        .setLabel('Voice unmute')
                        .setDisabled(voiceMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTextMute')
                        .setLabel('Text mute')
                        .setDisabled(textMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTextUnmute')
                        .setLabel('Text unmute')
                        .setDisabled(textMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageNickname')
                        .setLabel('Manage Nicknames')
                        .setDisabled(manageNicknames())
                        .setStyle(2),
                )
            const rowStart3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionBanEvent')
                        .setLabel('Ban event')
                        .setDisabled(eventBan())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionUnbanEvent')
                        .setLabel('Unban event')
                        .setDisabled(eventBan())
                        .setStyle(2),
                )
            const Embed = new EmbedBuilder()
                .setTitle(`Админ группа - ${group()}`)
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`[1] ban
[2] kick
[3] manage role
[4] timeout
[5] untimeout
[6] voice mute
[7] voice unmute
[8] text mute
[9] text unmute
[10] manage nicknames
[11] event ban
[12] event unban`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed],
                components: [rowStart1, rowStart2, rowStart3],
                fetchReply: true
            })
            .then((msg) => {
                message = msg
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionBan' || ButtonInteraction.customId === 'buttonActionKick' || ButtonInteraction.customId === 'buttonActionManageRoles' || ButtonInteraction.customId === 'buttonActionTimeout' || ButtonInteraction.customId === 'buttonActionUntimeout' || ButtonInteraction.customId === 'buttonActionVoiceMute' || ButtonInteraction.customId === 'buttonActionVoiceUnmute' || ButtonInteraction.customId === 'buttonActionTextMute' || ButtonInteraction.customId === 'buttonActionTextUnmute' || ButtonInteraction.customId === 'buttonActionManageNickname' || ButtonInteraction.customId === 'buttonActionBanEvent' || ButtonInteraction.customId === 'buttonActionUnbanEvent';
    
            const collector = message.createMessageComponentCollector({ filter, time: 60000 });
    
            collector.on('collect', async ButtonInteraction => {
                if (ButtonInteraction.user.id != author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setDescription(`${ButtonInteraction.user}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [errorEmbed],
                        components: [],
                    })
                }
                let buttonId = ButtonInteraction.customId;
                if (!buttonId === 'buttonActionManageRoles') {
                    await ButtonInteraction.deferUpdate() 
                }
                if (buttonId === 'buttonActionBan') {
                    const embed = new EmbedBuilder()
                        .setTitle('Бан пользователя')
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${ButtonInteraction.user}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed],
                        components: [],
                    })
                }
                if (buttonId === 'buttonActionKick') {

                }
                if (buttonId === 'buttonActionManageRoles') {

                }
                if (buttonId === 'buttonActionTimeout') {

                }
                if (buttonId === 'buttonActionUntimeout') {

                }
                if (buttonId === 'buttonActionVoiceMute') {

                }
                if (buttonId === 'buttonActionVoiceUnmute') {

                }
                if (buttonId === 'buttonActionTextMute') {

                }
                if (buttonId === 'buttonActionTextUnmute') {

                }
                if (buttonId === 'buttonActionManageNickname') {

                }
                if (buttonId === 'buttonActionBanEvent') {

                }
                if (buttonId === 'buttonActionUnbanEvent') {

                }
            })
        } catch(err) {
            if (!String(err).startsWith('Error [InteractionNotReplied]: The reply to this interaction has not been sent or deferred.')) {
				lockedCommands.push(interaction.commandName)
			}
        }
	}
};