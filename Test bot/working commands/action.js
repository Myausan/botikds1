const { SlashCommandBuilder , EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputStyle, TextInputBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('action')
		.setDescription('В разработке')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, connection) {
        const author = interaction.member;
        const memberUser = interaction.options.getUser('member');
        let member
        await interaction.guild.members.fetch(memberUser.id)
        .then((fetchedMember) => member = fetchedMember)
        .catch((err) => member = undefined)
        const logChannelWarn = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logWarns}`)
		const logChannelBanKick = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logBanKick}`)
        const logChannelMute = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMutes}`)
        const logChannelRoles = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`)
        const bot = await interaction.guild.members.fetch(config.bot_id)
        const permissions = author.permissions.toArray()
        const aRolePosition = author.roles.highest.position
        const mRolePosition = member.roles.highest.position
        const botRolePosition = bot.roles.highest.position
        const mPermissions = member.permissions.toArray()
        let sqlResult;
        let actions = 0;
        let block = 0;
        let status = 'start';
        let message;
        try {
            let ban = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.BanMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let unban = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.BanMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let kick = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.KickMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let roleManage = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.ManageRoles) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0) {
                    return false
                } else {
                    return true
                }
            }
            let textMute = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.ManageMessages) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let voiceMute = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.MuteMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let timeout = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.ModerateMembers) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let manageNicknames = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.ManageNicknames) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let eventBan = () => {
                if ((author.roles.cache.has('919310348903915551') || permissions.has(PermissionFlagsBits.ManageRoles) || permissions.has(PermissionFlagsBits.Administrator)) && block == 0 && aRolePosition > mRolePosition) {
                    return false
                } else {
                    return true
                }
            }
            let group = () => {
                return 'ADMIN'
            }
            let reason = (reasonInput) => {
                if (reasonInput == '') {
                    return 'Не указана'
                } else {
                    return reasonInput
                }
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
                        .setCustomId('buttonActionUnban')
                        .setLabel('unban')
                        .setDisabled(unban())
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
                        .setCustomId('buttonActionWarn')
                        .setLabel('warn')
                        .setDisabled(textMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageRoles')
                        .setLabel('manage roles')
                        .setDisabled(roleManage())
                        .setStyle(2),
                )
            const rowStart2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageNickname')
                        .setLabel('Manage Nicknames')
                        .setDisabled(manageNicknames())
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
            const rowStart3 = new ActionRowBuilder()
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
            const rowTime = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime10')
                        .setLabel('1')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime30')
                        .setLabel('2')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime60')
                        .setLabel('3')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime90')
                        .setLabel('4')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime120')
                        .setLabel('5')
                        .setStyle(2),
                )
            if (!member) {
                const rowStart1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonActionBan')
                            .setLabel('ban')
                            .setDisabled(true)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonActionUnban')
                            .setLabel('unban')
                            .setDisabled(unban())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonActionKick')
                            .setLabel('kick')
                            .setDisabled(true)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonActionWarn')
                            .setLabel('warn')
                            .setDisabled(true)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonActionManageRoles')
                            .setLabel('manage roles')
                            .setDisabled(true)
                            .setStyle(2),
                    )
                for (let i = 0; i<rowStart2.components.length;i++) {
                    rowStart2.components[i].setDisabled(true)
                }
                for (let i = 0; i<rowStart3.components.length;i++) {
                    rowStart3.components[i].setDisabled(true)
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Админ группа - ${group()}`)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`[1] ban
    [2] unban
    [3] kick
    [4] warn
    [5] manage role
    [6] manage nicknames
    [7] timeout
    [8] untimeout
    [9] voice mute
    [10] voice unmute
    [11] text mute
    [12] text unmute
    [13] event ban
    [14] event unban`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowStart1, rowStart2, rowStart3],
                    fetchReply: true
                })
                .then((msg) => {
                    message = msg
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionUnban';
    
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
                        return
                    }
                    await interaction.guild.bans.fetch(memberUser.id)
                    .then(async () => {
                        const modal = new ModalBuilder()
                            .setCustomId('modalActionUnban')
                            .setTitle('Разбанить пользователя');
                        const reasonInput = new TextInputBuilder()
                            .setCustomId('modalActionUnbanReasonInput')
                            .setLabel('Введите причину')
                            .setPlaceholder('Ошибочка вышла')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(50)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            status = 'unban';
                            const reasonInput = reason(ModalInteraction.components[0].components[0].value);
                            embed
                                .setTitle("Разбан пользователя")
                                .setDescription(`Администратор ${author} разбанил ${memberUser}, причина: ${reasonInput}`)
                            await interaction.editReply({
                                    embeds: [embed],
                                    components: [],
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Unban")
                                .setDescription(`[1] ${author} (${author.id})
[2] Unban
[3] ${memberUser} (${memberUser.id})
[4] ${reasonInput}`)
                                .setColor('#00ff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelBanKick.send({
                                embeds: [logEmbed]
                            })
                        })
                        .catch((err) => {

                        })
                    })
                    .catch(async () => {
                        status = 'unban';
                        embed
                            .setTitle("Разбан пользователя")
                            .setDescription(`${author}, пользователь ${memberUser} не в бане`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                    })
                })
            }
            const embed = new EmbedBuilder()
                .setTitle(`Админ группа - ${group()}`)
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`[1] ban
[2] unban
[3] kick
[4] warn
[5] manage role
[6] manage nicknames
[7] timeout
[8] untimeout
[9] voice mute
[10] voice unmute
[11] text mute
[12] text unmute
[13] event ban
[14] event unban`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [embed],
                components: [rowStart1, rowStart2, rowStart3],
                fetchReply: true
            })
            .then((msg) => {
                message = msg
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionBan' || ButtonInteraction.customId === 'buttonActionUnban' || ButtonInteraction.customId === 'buttonActionWarn' || ButtonInteraction.customId === 'buttonActionKick' || ButtonInteraction.customId === 'buttonActionManageRoles' || ButtonInteraction.customId === 'buttonActionTimeout' || ButtonInteraction.customId === 'buttonActionUntimeout' || ButtonInteraction.customId === 'buttonActionVoiceMute' || ButtonInteraction.customId === 'buttonActionVoiceUnmute' || ButtonInteraction.customId === 'buttonActionTextMute' || ButtonInteraction.customId === 'buttonActionTextUnmute' || ButtonInteraction.customId === 'buttonActionManageNickname' || ButtonInteraction.customId === 'buttonActionBanEvent' || ButtonInteraction.customId === 'buttonActionUnbanEvent';
    
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
                if (buttonId === 'buttonActionBan') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionBan')
                        .setTitle('Забанить пользователя');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionBanReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Нарушаем')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(50)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'ban';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value);
                        embed
                            .setTitle("Бан пользователя")
                            .setDescription(`Администратор ${author} забанил ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                                embeds: [embed],
                                components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Ban")
                            .setDescription(`[1] ${author} (${author.id})
[2] Ban
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#ff0000')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelBanKick.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionUnban') {
                    embed
                        .setTitle("Разбан пользователя")
                        .setDescription(`${author}, пользователь ${member} не в бане`)
                    await interaction.editReply({
                            embeds: [embed],
                            components: [],
                    })
                    await interaction.editReply({
                        embeds: [embed],
                        components: [],
                    })
                }
                if (buttonId === 'buttonActionKick') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionKick')
                        .setTitle('Кикнуть пользователя');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Нарушаем')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'kick';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        embed
                            .setTitle("Кик пользователя")
                            .setDescription(`Администратор ${author} кикнул ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                                embeds: [embed],
                                components: [],
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Kick")
                            .setDescription(`[1] ${author} (${author.id})
[2] Kick
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelBanKick.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionWarn') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionWarn')
                        .setTitle('Выдать предупреждение пользователю');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Нарушаем')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'warn';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        embed
                            .setTitle("Выдать предупреждение пользователю")
                            .setDescription(`Администратор ${author} выдал предупреждение ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                                embeds: [embed],
                                components: [],
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Warn")
                            .setDescription(`[1] ${author} (${author.id})
[2] Warn
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelWarn.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionManageRoles') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionManageRoles')
                        .setTitle('Управление ролями');
                    const idRoleInput = new TextInputBuilder()
                        .setCustomId('modalActionManageRolesIdInput')
                        .setLabel('Введите ID пользователя')
                        .setPlaceholder('1234567891011131415')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Взятие на staff')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(idRoleInput)
                    const secondActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow).addComponents(secondActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'manage role';
                        const idRoleInput = ModalInteraction.components[0].components[0].value;
                        const reasonInput = reason(ModalInteraction.components[1].components[0].value)
                        const role = await interaction.guild.roles.fetch(idRoleInput)
                        embed
                            .setTitle("Управление ролями")
                        if (!role) {
                            embed
                                .setDescription(`${author}, роль **${idRoleInput}** не найдена`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: [],
                            })
                            return
                        }
                        if (aRolePosition <= role.position) {
                            embed
                                .setDescription(`${author}, вы не можете управлять ролью ${role}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: [],
                            })
                            return
                        }
                        if (member.roles.cache.has(idRoleInput)) {
                            await member.roles.remove(role)
                            embed
                                .setDescription(`Администратор ${author} снял роль ${role} с пользователя ${member}, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Member role remove")
                                .setDescription(`[1] ${author} (${author.id})
[2] Member role remove
[3] ${member} (${idInput})
[4] ${role} (${role.id})
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelRoles.send({
                                embeds: [logEmbed]
                            })
                        } else {
                            await member.roles.add(role)
                            embed
                                .setDescription(`Администратор ${author} выдал роль ${role} пользователю ${member}, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Member role add")
                                .setDescription(`[1] ${author} (${author.id})
[2] Member role add
[3] ${member} (${idInput})
[4] ${role} (${role.id})
[5] ${reasonInput}`)
                                .setColor('#00ff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelRoles.send({
                                embeds: [logEmbed]
                            })
                        }
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionTimeout') {
                    await ButtonInteraction.deferUpdate()
                    status = 'time';
                    embed
                        .setTitle("Выдать тайм-аут")
                        .setColor(config.colorError)
                        .setDescription(`\`\`\`ini
Веберите длительность наказания:

[1] 10 минут
[2] 30 минут
[3] 60 минут
[4] 90 минут
[5] 120 минут\`\`\``)
                    await interaction.editReply({
                        embeds: [embed],
                        components: [rowTime],
                    })
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionTime10' || ButtonInteraction.customId === 'buttonActionTime30' || ButtonInteraction.customId === 'buttonActionTime60' || ButtonInteraction.customId === 'buttonActionTime90' || ButtonInteraction.customId === 'buttonActionTime120';
    
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
                            return
                        }
                        let buttonId = ButtonInteraction.customId;
                        let time = 0;
                        let timestamp = Date.now()
                        if (buttonId == 'buttonActionTime10') {
                            time = 10
                        }
                        if (buttonId == 'buttonActionTime30') {
                            time = 30
                        }
                        if (buttonId == 'buttonActionTime60') {
                            time = 60
                        }
                        if (buttonId == 'buttonActionTime90') {
                            time = 90
                        }
                        if (buttonId == 'buttonActionTime120') {
                            time = 120
                        }
                        const modal = new ModalBuilder()
                            .setCustomId('modalActionTimeout')
                            .setTitle('Выдать тайм-аут');
                        const reasonInput = new TextInputBuilder()
                            .setCustomId('modalActionKickReasonInput')
                            .setLabel('Введите причину')
                            .setPlaceholder('Нарушаем')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            status = 'timeout';
                            const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                            await member.timeout(time*60*1000, `${reasonInput}`)
                            embed
                                .setDescription(`Администратор ${author} выдал тайм-аут пользователю ${member} на ${time} минут, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Timeout")
                                .setDescription(`[1] ${author} (${author.id})
    [2] Timeout
    [3] ${member} (${idInput})
    [4] ${time} minutes
    [5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                        })
                        .catch((err) => {

                        })
                    })
                }
                if (buttonId === 'buttonActionUntimeout') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionTimeout')
                        .setTitle('Снять тайм-аут');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'untimeout';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        await member.timeout(0, reasonInput)
                        embed
                            .setTitle("Снять тайм-аут")
                            .setColor(config.colorError)
                            .setDescription(`Администратор ${author} снял тайм-аут с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Remove timeout")
                            .setDescription(`[1] ${author} (${author.id})
[2] Remove timeout
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#00ff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionVoiceMute') {
                    await ButtonInteraction.deferUpdate()
                    status = 'time';
                    embed
                        .setTitle("Выдать мут в голосовых каналах")
                        .setColor(config.colorError)
                        .setDescription(`\`\`\`ini
Веберите длительность наказания:

[1] 10 минут
[2] 30 минут
[3] 60 минут
[4] 90 минут
[5] 120 минут\`\`\``)
                    await interaction.editReply({
                        embeds: [embed],
                        components: [rowTime],
                    })
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionTime10' || ButtonInteraction.customId === 'buttonActionTime30' || ButtonInteraction.customId === 'buttonActionTime60' || ButtonInteraction.customId === 'buttonActionTime90' || ButtonInteraction.customId === 'buttonActionTime120';
    
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
                            return
                        }
                        let buttonId = ButtonInteraction.customId;
                        const modal = new ModalBuilder()
                            .setCustomId('modalActionTimeout')
                            .setTitle('Выдать мут в голосовых каналах');
                        const reasonInput = new TextInputBuilder()
                            .setCustomId('modalActionKickReasonInput')
                            .setLabel('Введите причину')
                            .setPlaceholder('Нарушаем')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                            ModalInteraction.deferUpdate()
                            let time = 0;
                            let timestamp = Date.now()
                            if (buttonId == 'buttonActionTime10') {
                                time = 10
                            }
                            if (buttonId == 'buttonActionTime30') {
                                time = 30
                            }
                            if (buttonId == 'buttonActionTime60') {
                                time = 60
                            }
                            if (buttonId == 'buttonActionTime90') {
                                time = 90
                            }
                            if (buttonId == 'buttonActionTime120') {
                                time = 120
                            }
                            await connection
                                .query(`SELECT timestamp FROM mutes WHERE id = ${member.id} AND type = 'voice'`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                                .then((result) => sqlResult = result)
                                .catch((err) => {
                                    console.log(`SQL: Error ${err}`)
                                    const lockEmbed = new EmbedBuilder()
                                        .setTitle(`Коробочки`)
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
                                    .query(`INSERT INTO mutes (id, type, timestamp) VALUES (${member.id}, 'voice', ${timestamp+time*60*1000});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                            } else {
                                embed
                                    .setDescription(`${author}, уже замьючен`)
                                await interaction.editReply({
                                    embeds: [embed],
                                    components: []
                                })
                                return
                            }
                            if (member.voice.channelId) {
                                member.mute(time*60*1000, `${reasonInput}`)
                            }
                            embed
                                .setDescription(`Администратор ${author} выдал мут в голосовых каналов пользователю ${member} на ${time} минут, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Voice mute")
                                .setDescription(`[1] ${author} (${author.id})
[2] Voice mute
[3] ${member} (${idInput})
[4] ${time} minutes
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                        })
                        .catch((err) => {

                        })
                    })
                }
                if (buttonId === 'buttonActionVoiceUnmute') {
                    await connection
                        .query(`SELECT timestamp FROM mutes WHERE id = ${member.id} AND type = 'voice'`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle(`Коробочки`)
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            interaction.reply({
                                embeds: [lockEmbed],
                                ephemeral: true
                            }) 
                            return
                        })
                    if (sqlResult[0] === undefined) {
                        embed
                            .setTitle("Снять мут в голосовых каналах")
                            .setColor(config.colorError)
                            .setDescription(`${author}, не замьючен`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionTimeout')
                        .setTitle('Снять мут в голосовых каналах');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'unnute';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        await connection
                            .query(`DELETE FROM mutes WHERE id = ${member.id} AND type = 'voice'`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        embed
                            .setTitle("Снять мут в голосовых каналах")
                            .setColor(config.color)
                            .setDescription(`Администратор ${author} снял мут в голосовых каналах с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Voice unmute")
                            .setDescription(`[1] ${author} (${author.id})
[2] Voice unmute
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#00ff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionTextMute') {
                    await ButtonInteraction.deferUpdate()
                    status = 'time';
                    embed
                        .setTitle("Выдать мут в текстовых каналах")
                        .setColor(config.colorError)
                        .setDescription(`\`\`\`ini
Веберите длительность наказания:

[1] 10 минут
[2] 30 минут
[3] 60 минут
[4] 90 минут
[5] 120 минут\`\`\``)
                    await interaction.editReply({
                        embeds: [embed],
                        components: [rowTime],
                    })
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionTime10' || ButtonInteraction.customId === 'buttonActionTime30' || ButtonInteraction.customId === 'buttonActionTime60' || ButtonInteraction.customId === 'buttonActionTime90' || ButtonInteraction.customId === 'buttonActionTime120';
    
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
                            return
                        }
                        let buttonId = ButtonInteraction.customId;
                        const modal = new ModalBuilder()
                            .setCustomId('modalActionTimeout')
                            .setTitle('Выдать мут в текстовых каналах');
                        const reasonInput = new TextInputBuilder()
                            .setCustomId('modalActionKickReasonInput')
                            .setLabel('Введите причину')
                            .setPlaceholder('Нарушаем')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                            ModalInteraction.deferUpdate()
                            let time = 0;
                            let timestamp = Date.now()
                            if (buttonId == 'buttonActionTime10') {
                                time = 10
                            }
                            if (buttonId == 'buttonActionTime30') {
                                time = 30
                            }
                            if (buttonId == 'buttonActionTime60') {
                                time = 60
                            }
                            if (buttonId == 'buttonActionTime90') {
                                time = 90
                            }
                            if (buttonId == 'buttonActionTime120') {
                                time = 120
                            }
                            await connection
                                .query(`SELECT timestamp FROM mutes WHERE id = ${member.id} AND type = 'text'`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                                .then((result) => sqlResult = result)
                                .catch((err) => {
                                    console.log(`SQL: Error ${err}`)
                                    const lockEmbed = new EmbedBuilder()
                                        .setTitle(`Коробочки`)
                                        .setDescription(`${author}, Команда временно заблокирована`)
                                        .setColor(config.colorError);
                                    interaction.reply({
                                        embeds: [lockEmbed],
                                        ephemeral: true
                                    }) 
                                    return
                                })
                            if (sqlResult[0] === undefined || !(member.roles.cache.has(config.roleMute))) {
                                await connection
                                .query(`INSERT INTO mutes (id, type, timestamp) VALUES (${member.id}, 'text', ${timestamp+time*60*1000});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            } else {
                                embed
                                    .setDescription(`${author}, уже замьючен`)
                                await interaction.editReply({
                                    embeds: [embed],
                                    components: []
                                })
                                return
                            }
                            await member.roles.add(config.roleMute, reasonInput)
                            embed
                                .setDescription(`Администратор ${author} выдал мут в текстовых каналов пользователю ${member} на ${time} минут, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Text mute")
                                .setDescription(`[1] ${author} (${author.id})
[2] Text mute
[3] ${member} (${idInput})
[4] ${time} minutes
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                        })
                        .catch((err) => {

                        })
                    })
                }
                if (buttonId === 'buttonActionTextUnmute') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionTimeout')
                        .setTitle('Снять текстовый мута');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'unnute';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        embed
                            .setTitle("Снять текстовый мута")
                            .setColor(config.colorError)
                            .setDescription(`Администратор ${author} снял мут в текстовых каналах с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Text unmute")
                            .setDescription(`[1] ${author} (${author.id})
[2] Text unmute
[3] ${member} (${idInput})
[4] ${reasonInput}`)
                            .setColor('#00ff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionManageNickname') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionTimeout')
                        .setTitle('Изменение Никнейма');
                    const NicknameInput = new TextInputBuilder()
                        .setCustomId('modalActionManageNicknameInput')
                        .setLabel('Введите новый никнейм')
                        .setPlaceholder('Nickname')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionManageNicknameReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(NicknameInput)
                    const secondActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow).addComponents(secondActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'manage nicknames';
                        const nicknameInput = ModalInteraction.components[1].components[0].value
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        await member.setNickname(nicknameInput, reasonInput)
                        embed
                            .setTitle("Управление никнеймами")
                            .setColor(config.color)
                            .setDescription(`Администратор ${author} изменил никнейм пользователю ${member} на ${nicknameInput}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Edit nackname")
                            .setDescription(`[1] ${author} (${author.id})
[2] Edit nickname
[3] ${member} (${idInput})
[4] ${nicknameInput}
[5] ${reasonInput}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionBanEvent') {

                }
                if (buttonId === 'buttonActionUnbanEvent') {

                }
            })
        } catch(err) {
            console.log(err)
        }
	}
};