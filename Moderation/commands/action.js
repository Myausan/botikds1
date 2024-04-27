const { SlashCommandBuilder , EmbedBuilder, PermissionFlagsBits, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputStyle, TextInputBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('action')
		.setDescription('Выдать наказание пользователю')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
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
        //const bot = await interaction.guild.members.fetch(config.bot_id)
        const permissions = author.permissions
        const aRolePosition = author.roles.highest.position
        //const botRolePosition = bot.roles.highest.position
        const mPermissions = member.permissions
        let mRolePosition = 0
        let sqlResult;
        let actions = 0;
        let block = 0;
        let status = 'start';
        let ghost = 0;
        let bypass = 0;
        let message;
        try {
            let owner = () => {
                if (author.id == config.owner_id) {
                    return true
                } else {
                    return false
                }
            }
            let ownerMember = () => {
                if (member.id !== config.owner_id) {
                    return true
                } else {
                    return false
                }
            }
            let ban = () => {
                if ((((author.roles.cache.has(config.roleGods) || permissions.has(PermissionsBitField.Flags.BanMembers) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let unban = () => {
                if ((((author.roles.cache.has(config.roleGods) || permissions.has(PermissionsBitField.Flags.BanMembers) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let kick = () => {
                if ((((author.roles.cache.has(config.roleGods) || permissions.has(PermissionsBitField.Flags.KickMembers) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let warn = () => {
                if ((((author.roles.cache.has(config.roleControl) || author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.ManageMessages) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0  && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let roleManage = () => {
                if ((((author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.ManageRoles) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let textMute = () => {
                if ((((author.roles.cache.has(config.roleControl) || author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.ManageMessages) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && !mPermissions.has(PermissionsBitField.Flags.Administrator) && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let voiceMute = () => {
                if ((((author.roles.cache.has(config.roleControl) || author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.MuteMembers) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && !mPermissions.has(PermissionsBitField.Flags.Administrator) && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let timeout = () => {
                if (((author.roles.cache.has(config.roleGods) || (author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.ModerateMembers) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && !mPermissions.has(PermissionsBitField.Flags.Administrator) && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let manageNicknames = () => {
                if ((((author.roles.cache.has(config.roleControl) || author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleMod) || author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleCurator) || permissions.has(PermissionsBitField.Flags.ManageNicknames) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let eventBan = () => {
                if ((((author.roles.cache.has(config.roleEvent) || author.roles.cache.has(config.roleMafia)|| permissions.has(PermissionsBitField.Flags.ManageRoles) || permissions.has(PermissionsBitField.Flags.Administrator)) && block == 0 && !mPermissions.has(PermissionsBitField.Flags.Administrator) && aRolePosition > mRolePosition) && ownerMember()) || owner()) {
                    return false
                } else {
                    return true
                }
            }
            let eventBanForever = () => {
                if (author.roles.cache.has(config.roleSerafim) || author.roles.cache.has(config.roleGods) || permissions.has(PermissionsBitField.Flags.ManageRoles) || permissions.has(PermissionsBitField.Flags.Administrator) || owner() || ownerMember()) {
                    return false
                } else {
                    return true
                }
            }
            let group = () => {
                if (author.id == config.owner_id) {
                    return 'Console'
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
                if (author.roles.cache.has(config.roleEvent)) {
                    return '𝐄𝐯𝐞𝐧𝐭-𝐌𝐚𝐬𝐭𝐞𝐫'
                }
                if (author.roles.cache.has(config.roleGameMaster)) {
                    return '𝐆𝐚𝐦𝐞-𝐌𝐚𝐬𝐭𝐞𝐫'
                }
                if (author.roles.cache.has(config.roleControl)) {
                    return '𝐂𝐨𝐧𝐭𝐫𝐨𝐥'
                }
                if (author.roles.cache.has(config.roleHelper)) {
                    return '𝐇𝐞𝐥𝐩𝐞𝐫'
                }
                if (permissions.has(PermissionsBitField.Flags.Administrator)) {
                    return 'Не определена'
                }
                return 'none'
            }
            let reason = (reasonInput) => {
                if (reasonInput == '') {
                    return 'Не указана'
                } else {
                    return reasonInput.substr(0,29)
                }
            }
            let ephemeral = (ghost) => {
                if (ghost) {
                    return true
                } else {
                    return false
                }
            }
            let groupText = group()
            if (groupText == 'none') {
                const embed = new EmbedBuilder()
                    .setDescription(`${author}, вы не можете этого делать`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                })
                return
            }
            const roleMute = await interaction.guild.roles.fetch(config.roleMute)
            for (var [key, value] of member.roles.cache) {
                if (value.position > mRolePosition && value.position != roleMute.position) {
                    mRolePosition = value.position
                }
            }
            await connection
                .query(`SELECT ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle(`Админ группа - ${groupText}`)
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
                ghost = sqlResult[0].ghost
            }
            const rowStart1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionBan')
                        .setLabel('ban')
                        .setEmoji(config.emojis.ban)
                        .setDisabled(ban())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionUnban')
                        .setLabel('unban')
                        .setEmoji(config.emojis.unban)
                        .setDisabled(unban())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionKick')
                        .setLabel('kick')
                        .setEmoji(config.emojis.kick)
                        .setDisabled(kick())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionWarn')
                        .setLabel('warn')
                        .setEmoji(config.emojis.warn)
                        .setDisabled(warn())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageRoles')
                        .setLabel('manage roles')
                        .setEmoji(config.emojis.roleManage)
                        .setDisabled(roleManage())
                        .setStyle(2),
                )
            const rowStart2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionManageNickname')
                        .setLabel('Manage Nicknames')
                        .setEmoji(config.emojis.editName)
                        .setDisabled(manageNicknames())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTimeout')
                        .setLabel('Timeout')
                        .setEmoji(config.emojis.timeout)
                        .setDisabled(timeout())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionUntimeout')
                        .setLabel('Remove timeout')
                        .setEmoji(config.emojis.untimeout)
                        .setDisabled(timeout())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionVoiceMute')
                        .setLabel('Voice mute')
                        .setEmoji(config.emojis.voiceMute)
                        .setDisabled(voiceMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionVoiceUnmute')
                        .setLabel('Voice unmute')
                        .setEmoji(config.emojis.voiceUnmute)
                        .setDisabled(voiceMute())
                        .setStyle(2),
                )
            const rowStart3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTextMute')
                        .setLabel('Text mute')
                        .setEmoji(config.emojis.txtMute)
                        .setDisabled(textMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTextUnmute')
                        .setLabel('Text unmute')
                        .setEmoji(config.emojis.txtUnmute)
                        .setDisabled(textMute())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionBanEvent')
                        .setLabel('Ban event')
                        .setEmoji(config.emojis.evtBan)
                        .setDisabled(eventBan())
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionUnbanEvent')
                        .setLabel('Unban event')
                        .setEmoji(config.emojis.evtUnban)
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
                        .setStyle(2)
                )
            const rowTimeEvent = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime12h')
                        .setLabel('1')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime1d')
                        .setLabel('2')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime3d')
                        .setLabel('3')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTime7d')
                        .setLabel('4')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonActionTimeForever')
                        .setLabel('5')
                        .setStyle(2)
                        .setDisabled(eventBanForever()),
                )
            if (!member) {
                for (let i = 0; i<rowStart1.components.length;i++) {
                    if (i == 1) {
                        rowStart1.components[i].setDisabled(unban())
                    } else {
                        rowStart1.components[i].setDisabled(true)
                    }
                }
                for (let i = 0; i<rowStart2.components.length;i++) {
                    rowStart2.components[i].setDisabled(true)
                }
                for (let i = 0; i<rowStart3.components.length;i++) {
                    rowStart3.components[i].setDisabled(true)
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Админ группа - ${groupText}`)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${config.emojis.ban} - ban
${config.emojis.unban} - unban
${config.emojis.kick} - kick
${config.emojis.warn} - warn
${config.emojis.roleManage} - manage role
${config.emojis.editName} - manage nicknames
${config.emojis.timeout} - timeout
${config.emojis.untimeout} - Remove timeout
${config.emojis.voiceMute} - voice mute
${config.emojis.voiceUnmute} - voice unmute
${config.emojis.txtMute} - text mute
${config.emojis.txtUnmute} - text unmute
${config.emojis.evtBan} - event ban
${config.emojis.evtUnban} - event unban`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowStart1, rowStart2, rowStart3],
                    ephemeral: ephemeral(ghost),
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
                            ephemeral: true
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
                            .setMaxLength(11)
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
                                embed
                                    .setTitle("Разбан пользователя")
                                    .setDescription(`Администратор ${author} разбанил ${memberUser}, причина: ${reasonInput}`)
                                await interaction.editReply({
                                        embeds: [embed],
                                        components: [],
                                })
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
                .setDescription(`${config.emojis.ban} - ban
${config.emojis.unban} - unban
${config.emojis.kick} - kick
${config.emojis.warn} - warn
${config.emojis.roleManage} - manage role
${config.emojis.editName} - manage nicknames
${config.emojis.timeout} - timeout
${config.emojis.untimeout} - Remove timeout
${config.emojis.voiceMute} - voice mute
${config.emojis.voiceUnmute} - voice unmute
${config.emojis.txtMute} - text mute
${config.emojis.txtUnmute} - text unmute
${config.emojis.evtBan} - event ban
${config.emojis.evtUnban} - event unban`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [embed],
                components: [rowStart1, rowStart2, rowStart3],
                ephemeral: ephemeral(ghost),
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
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        status = 'ban';
                        await ModalInteraction.deferUpdate()
                        await connection
                            .query(`SELECT bans, bypass FROM protection WHERE id = ${author.id};`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            embed
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            interaction.editReply({
                                embeds: [embed],
                                components: []
                            }) 
                            return
                        })
                        if (sqlResult[0] === undefined) {
                            await connection
                                .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            actions = sqlResult[0].ban;
                            bypass = sqlResult[0].bypass;
                        }
                        actions++
                        if (actions > 5) {
                            warn(author);
                            await connection
                                .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**CRASH ATTEMPT**")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member banned\n[3] ${member} (${member.id})\n [4] Command locked`)
                                .setColor("#ff0000")
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp();
                            await logChannel.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value);
                        embed
                            .setTitle("Бан пользователя")
                            .setDescription(`Администратор ${author} забанил ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                                embeds: [embed],
                                components: [],
                        })
                        if (ghost) {
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'ban', 0, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, вам выдан бан на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            await member.ban()
                            return
                        }
                        await member.send({
                            content: `${member}, вам выдан бан на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {
    
                        })
                        await member.ban()
                        await connection
                            .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'ban', 0, '${reasonInput}', ${Date.now()});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Ban")
                            .setDescription(`[1] ${author} (${author.id})
[2] Ban
[3] ${member} (${member.id})
[4] ${reasonInput}`)
                            .setColor('#ff0000')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelBanKick.send({
                            embeds: [logEmbed]
                        })
                        if (!bypass) {
                            await connection
                                .query(`UPDATE protection SET bans=bans+1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await wait(120000);await connection
                                .query(`UPDATE protection SET bans=bans-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
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
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'kick';
                        await connection
                            .query(`SELECT bans, bypass FROM protection WHERE id = ${author.id};`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            embed
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            interaction.editReply({
                                embeds: [embed],
                                components: []
                            }) 
                            return
                        })
                        if (sqlResult[0] === undefined) {
                            await connection
                                .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            actions = sqlResult[0].ban;
                            bypass = sqlResult[0].bypass;
                        }
                        actions++
                        if (actions > 5) {
                            warn(author);
                            await connection
                                .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**CRASH ATTEMPT**")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member kicked\n[3] ${member} (${member.id})\n [4] Command locked`)
                                .setColor("#ff0000")
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp();
                            await logChannel.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        embed
                            .setTitle("Кик пользователя")
                            .setDescription(`Администратор ${author} кикнул ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                                embeds: [embed],
                                components: [],
                        })
                        if (ghost) {
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'kick', 0, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, вы были исключены с сервера ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            await member.kick(reasonInput)
                            return
                        }
                        await member.send({
                            content: `${member}, вы были исключены с сервера ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {
    
                        })
                        await member.kick(reasonInput)
                        await connection
                            .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'kick', 0, '${reasonInput}', ${Date.now()});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Kick")
                            .setDescription(`[1] ${author} (${author.id})
[2] Kick
[3] ${member} (${member.id})
[4] ${reasonInput}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelBanKick.send({
                            embeds: [logEmbed]
                        })
                        if (!bypass) {
                            await connection
                                .query(`UPDATE protection SET bans=bans+1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await wait(120000);
                            await connection
                                .query(`UPDATE protection SET bans=bans-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
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
                        .setMaxLength(11)
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
                        if (ghost) {
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'warn', 0, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, вам выдан варн на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            return
                        }
                        await member.send({
                            content: `${member}, вам выдан варн на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {
    
                        })
                        await connection
                            .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'warn', 0, '${reasonInput}', ${Date.now()});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Warn")
                            .setDescription(`[1] ${author} (${author.id})
[2] Warn
[3] ${member} (${member.id})
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
                        .setLabel('Введите ID роли')
                        .setPlaceholder('1234567891011131415')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Взятие на staff')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(30)
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
                        await connection
                            .query(`SELECT addremroles, bypass FROM protection WHERE id = ${author.id};`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            embed
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            interaction.editReply({
                                embeds: [embed],
                                components: []
                            }) 
                            return
                        })
                        if (sqlResult[0] === undefined) {
                            await connection
                                .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            actions = sqlResult[0].addremroles;
                            bypass = sqlResult[0].bypass;
                        }
                        actions++
                        if (actions > 10) {
                            warn(author);
                            await connection
                                .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**CRASH ATTEMPT**")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Add/rem roles\n[3] ${role} (${role.id})\n [4] Command locked`)
                                .setColor("#ff0000")
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp();
                            await logChannel.send({
                                embeds: [LogEmbed]
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
[3] ${member} (${member.id})
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
[3] ${member} (${member.id})
[4] ${role} (${role.id})
[5] ${reasonInput}`)
                                .setColor('#00ff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelRoles.send({
                                embeds: [logEmbed]
                            })
                        }
                        if (!bypass) {
                            await connection
                                .query(`UPDATE protection SET addremoroles=addremoroles+1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await wait(120000);
                            await connection
                                .query(`UPDATE protection SET addremoroles=addremoroles-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionTimeout') {
                    await ButtonInteraction.deferUpdate()
                    status = 'time';
                    await connection
                        .query(`SELECT mutes, bypass FROM protection WHERE id = ${author.id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        embed
                            .setDescription(`${author}, Команда временно заблокирована`)
                            .setColor(config.colorError);
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }) 
                        return
                    })
                    if (sqlResult[0] === undefined) {
                        await connection
                            .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    } else {
                        actions = sqlResult[0].mutes;
                        bypass = sqlResult[0].bypass;
                    }
                    actions++
                    if (actions > 7) {
                        warn(author);
                        await connection
                            .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Timeout member\n[3] ${member} (${member.id})\n [4] Command locked`)
                            .setColor("#ff0000")
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
                    }
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
                            .setMaxLength(11)
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
                            if (ghost) {
                                await connection
                                    .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'timeout', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await member.send({
                                    content: `${member}, вам выдан тайм-аут на ${time} минут на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                                })
                                .catch((err) => {
    
                                })
                                return
                            }
                            await member.send({
                                content: `${member}, вам выдан тайм-аут на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'timeout', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Timeout")
                                .setDescription(`[1] ${author} (${author.id})
[2] Timeout
[3] ${member} (${member.id})
[4] ${time} minutes
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                            if (!bypass) {
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes+1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await wait(120000);
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes-1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                return
                            }
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
                        .setMaxLength(11)
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
                            await member.send({
                                content: `${member}, с вас снят тайм-аут на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            return
                        }
                        await member.send({
                            content: `${member}, с вас снят тайм-аут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {
    
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Remove timeout")
                            .setDescription(`[1] ${author} (${author.id})
[2] Remove timeout
[3] ${member} (${member.id})
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
                    await connection
                        .query(`SELECT mutes, bypass FROM protection WHERE id = ${author.id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        embed
                            .setDescription(`${author}, Команда временно заблокирована`)
                            .setColor(config.colorError);
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }) 
                        return
                    })
                    status = 'time';
                    if (sqlResult[0] === undefined) {
                        await connection
                            .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    } else {
                        actions = sqlResult[0].mutes;
                        bypass = sqlResult[0].bypass;
                    }
                    actions++
                    if (actions > 7) {
                        warn(author);
                        await connection
                            .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Voice mute\n[3] ${member} (${member.id})\n [4] Command locked`)
                            .setColor("#ff0000")
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
                    }
                    embed
                        .setTitle("Выдать мут в голосовых каналах")
                        .setColor(config.color)
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
                            .setMaxLength(11)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            status = 'end';
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
                                        .setTitle(`Выдать мут в голосовых каналах`)
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
                                await member.voice.setMute(true, `${reasonInput}`)
                            }
                            embed
                                .setDescription(`Администратор ${author} выдал мут в голосовых каналов пользователю ${member} на ${time} минут, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            if (ghost) {
                                await connection
                                    .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'voice mute', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await member.send({
                                    content: `${member}, вам выдан мут в голосовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                                })
                                .catch((err) => {
                                
                                })
                                return
                            }
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'voice mute', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, вам выдан мут в голосовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                            })
                            .catch((err) => {

                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Voice mute")
                                .setDescription(`[1] ${author} (${author.id})
[2] Voice mute
[3] ${member} (${member.id})
[4] ${time} minutes
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                            if (!bypass) {
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes+1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await wait(120000);
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes-1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                return
                            }
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
                                .setTitle(`Снять мут в голосовых каналах`)
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            ButtonInteraction.reply({
                                embeds: [lockEmbed],
                                ephemeral: true
                            }) 
                            return
                        })
                    if (sqlResult[0] === undefined) {
                        status = 'unmute';
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
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        if (member.voice.channelId) {
                            status = 'unmute';
                            await member.voice.setMute(false)
                                await connection
                                .query(`DELETE FROM mutes WHERE id = ${member.id} AND type = 'voice'`, {
                                    type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        } else {
                            await connection
                                .query(`UPDATE mutes SET type = 'unmute', timestamp = 0 WHERE id = ${member.id} AND type = 'voice';`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        }
                        embed
                            .setTitle("Снять мут в голосовых каналах")
                            .setColor(config.color)
                            .setDescription(`Администратор ${author} снял мут в голосовых каналах с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            await member.send({
                                content: `${member}, с вас снят мут в голосовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
                            
                            })
                            return
                        }
                        await member.send({
                            content: `${member}, с вас снят мут в голосовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {

                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Voice unmute")
                            .setDescription(`[1] ${author} (${author.id})
[2] Voice unmute
[3] ${member} (${member.id})
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
                    await connection
                        .query(`SELECT mutes, bypass FROM protection WHERE id = ${author.id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        embed
                            .setDescription(`${author}, Команда временно заблокирована`)
                            .setColor(config.colorError);
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }) 
                        return
                    })
                    if (sqlResult[0] === undefined) {
                        await connection
                            .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    } else {
                        actions = sqlResult[0].mutes;
                        bypass = sqlResult[0].bypass;
                    }
                    actions++
                    if (actions > 7) {
                        warn(author);
                        await connection
                            .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Text mute\n[3] ${member} (${member.id})\n [4] Command locked`)
                            .setColor("#ff0000")
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
                    }
                    embed
                        .setTitle("Выдать мут в текстовых каналах")
                        .setColor(config.color)
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
                            .setMaxLength(11)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            status = 'end';
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
                                        .setTitle(`Выдать мут в текстовых каналах`)
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
                                await connection
                                    .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'text mute', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await member.send({
                                    content: `${member}, вам выдан мут в текстовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                                })
                                .catch((err) => {
                                
                                })
                                return
                            }
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'text mute', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, вам выдан мут в текстовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Text mute")
                                .setDescription(`[1] ${author} (${author.id})
[2] Text mute
[3] ${member} (${member.id})
[4] ${time} minutes
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                            if (!bypass) {
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes+1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await wait(120000);
                                await connection
                                    .query(`UPDATE protection SET mutes=mutes-1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                return
                            }
                        })
                        .catch((err) => {

                        })
                    })
                }
                if (buttonId === 'buttonActionTextUnmute') {
                    await connection
                        .query(`SELECT timestamp FROM mutes WHERE id = ${member.id} AND type = 'text'`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle(`Снять мут в текстовых каналах`)
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                            interaction.reply({
                                embeds: [lockEmbed],
                                ephemeral: true
                            }) 
                            return
                        })
                    if (sqlResult[0] === undefined) {
                        status = 'unmute';
                        embed
                            .setTitle("Снять мут в текстовых каналах")
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
                        .setTitle('Снять мут в текстовых каналах');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'unmute';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        await member.roles.remove(config.roleMute, reasonInput)
                        await connection
                            .query(`DELETE FROM mutes WHERE id = ${member.id} AND type = 'text'`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        embed
                            .setTitle("Снять мут в текстовых каналах")
                            .setColor(config.color)
                            .setDescription(`Администратор ${author} снял мут в текстовых каналах с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            await member.send({
                                content: `${member}, с вас снят мут в текстовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
                            
                            })
                            return
                        }
                        await member.send({
                            content: `${member}, с вас снят мут в текстовых каналах на ${time} минут на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {

                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Texy unmute")
                            .setDescription(`[1] ${author} (${author.id})
[2] Text unmute
[3] ${member} (${member.id})
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
                    await connection
                        .query(`SELECT mutes, bypass FROM protection WHERE id = ${author.id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        embed
                            .setDescription(`${author}, Команда временно заблокирована`)
                            .setColor(config.colorError);
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }) 
                        return
                    })
                    if (sqlResult[0] === undefined) {
                        await connection
                            .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    } else {
                        actions = sqlResult[0].mutes;
                        bypass = sqlResult[0].bypass;
                    }
                    actions++
                    if (actions > 7) {
                        warn(author);
                        await connection
                            .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Edit Nickname\n[3] ${member} (${member.id})\n [4] Command locked`)
                            .setColor("#ff0000")
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
                    }
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
                        .setPlaceholder('Нарушаем')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(NicknameInput)
                    const secondActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow).addComponents(secondActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        status = 'manage nicknames';
                        const nicknameInput = ModalInteraction.components[0].components[0].value
                        const reasonInput = reason(ModalInteraction.components[1].components[0].value)
                        await member.setNickname(nicknameInput, reasonInput)
                        if (nicknameInput == '') {
                            embed
                                .setTitle("Управление никнеймами")
                                .setColor(config.color)
                                .setDescription(`Администратор ${author} сбросил никнейм пользователю ${member}, причина: ${reasonInput}`)
                        } else {
                            embed
                                .setTitle("Управление никнеймами")
                                .setColor(config.color)
                                .setDescription(`Администратор ${author} изменил никнейм пользователю ${member} на ${nicknameInput}, причина: ${reasonInput}`)
                        }
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
[3] ${member} (${member.id})
[4] ${nicknameInput}
[5] ${reasonInput}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                        if (!bypass) {
                            await connection
                                .query(`UPDATE protection SET mutes=mutes+1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await wait(120000);
                            await connection
                                .query(`UPDATE protection SET mutes=mutes-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
                    })
                    .catch((err) => {

                    })
                }
                if (buttonId === 'buttonActionBanEvent') {
                    await ButtonInteraction.deferUpdate()
                    status = 'timeEvent';
                    await connection
                        .query(`SELECT eventban, bypass FROM protection WHERE id = ${author.id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        embed
                            .setDescription(`${author}, Команда временно заблокирована`)
                            .setColor(config.colorError);
                        interaction.editReply({
                            embeds: [embed],
                            components: []
                        }) 
                        return
                    })
                    if (sqlResult[0] === undefined) {
                        await connection
                            .query(`INSERT INTO protection (id) VALUES (${author.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    } else {
                        actions = sqlResult[0].eventban;
                        bypass = sqlResult[0].bypass;
                    }
                    actions++
                    if (actions > 7) {
                        warn(author);
                        await connection
                            .query(`UPDATE protection SET block=1 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Event ban\n[3] ${member} (${member.id})\n [4] Command locked`)
                            .setColor("#ff0000")
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
                    }
                    if (member.roles.cache.has(config.roleEventBan)) {
                        status = 'end'
                        embed.setDescription(`${author}, у пользователя уже есть **Event ban**`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                    embed
                        .setTitle("Выдать Event ban")
                        .setColor(config.colorError)
                        .setDescription(`\`\`\`ini
Веберите длительность наказания:

[1] 12 часов
[2] 1 день
[3] 3 дня
[4] 7 дней
[5] Навсегда\`\`\``)
                    await interaction.editReply({
                        embeds: [embed],
                        components: [rowTimeEvent],
                    })
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonActionTime12h' || ButtonInteraction.customId === 'buttonActionTime1d' || ButtonInteraction.customId === 'buttonActionTime3d' || ButtonInteraction.customId === 'buttonActionTime7d' || ButtonInteraction.customId === 'buttonActionTimeForever';
    
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
                        let timeText
                        let timestamp = Date.now()
                        if (buttonId == 'buttonActionTime12h') {
                            time = 12*60*60
                            timeText = '12 часов'
                        }
                        if (buttonId == 'buttonActionTime1d') {
                            time = 24*60*60
                            timeText = '1 день'
                        }
                        if (buttonId == 'buttonActionTime3d') {
                            time = 72*60*60
                            timeText = '3 дня'
                        }
                        if (buttonId == 'buttonActionTime7d') {
                            time = 7*24*60*60
                            timeText = '7 дней'
                        }
                        if (buttonId == 'buttonActionTimeForever') {
                            time = 0
                            timeText = 'навсегда'
                        }
                        const modal = new ModalBuilder()
                            .setCustomId('modalActionEventBan')
                            .setTitle('Выдать Event ban');
                        const reasonInput = new TextInputBuilder()
                            .setCustomId('modalActionKickReasonInput')
                            .setLabel('Введите причину')
                            .setPlaceholder('Нарушаем')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(11)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            status = 'Event ban';
                            const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                            await member.roles.add(config.roleEventBan)
                            if (time != 0) {
                                await connection
                                    .query(`INSERT INTO mutes (id, type, timestamp) VALUES (${member.id}, 'eventban', ${timestamp+time});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                .then(result => console.log(result))
                                .catch(err => console.log(err))
                            } else {
                                await connection
                                    .query(`INSERT INTO mutes (id, type, timestamp) VALUES (${member.id}, 'eventban', 0);`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                .then(result => console.log(result))
                                .catch(err => console.log(err))
                            }
                            embed
                                .setDescription(`Администратор ${author} выдал **Event ban** пользователю ${member} на ${timeText}, причина: ${reasonInput}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            if (ghost) {
                                await connection
                                    .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'eventban', ${time}, '${reasonInput}', ${Date.now()});`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await member.send({
                                    content: `${member}, вам выдан **event ban** на ${timeText} на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                                })
                                .catch((err) => {
    
                                })
                                return
                            }
                            await member.send({
                                content: `${member}, вам выдан **event ban** на ${timeText} на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'eventban', ${time*60*1000}, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Event ban")
                                .setDescription(`[1] ${author} (${author.id})
[2] Event ban
[3] ${member} (${member.id})
[4] ${timeText}
[5] ${reasonInput}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannelMute.send({
                                embeds: [logEmbed]
                            })
                            if (!bypass) {
                                await connection
                                    .query(`UPDATE protection SET eventban=eventban+1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await wait(120000);
                                await connection
                                    .query(`UPDATE protection SET eventban=eventban-1 WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                return
                            }
                        })
                        .catch((err) => {

                        })
                    })
                }
                if (buttonId === 'buttonActionUnbanEvent') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalActionEventUnban')
                        .setTitle('Снять Event ban');
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('modalActionKickReasonInput')
                        .setLabel('Введите причину')
                        .setPlaceholder('Ошибочка вышла')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(11)
                        .setRequired(false)
                    const firstActionRow = new ActionRowBuilder().addComponents(reasonInput)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    await ButtonInteraction.awaitModalSubmit({ time: 60000 })
                    .then(async ModalInteraction => {
                        await ModalInteraction.deferUpdate()
                        if (!member.roles.cache.has(config.roleEventBan)) {
                            status = 'end'
                            embed.setDescription(`${author}, у пользователя нет event ban`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            return
                        }
                        status = 'Event ban';
                        const reasonInput = reason(ModalInteraction.components[0].components[0].value)
                        await member.roles.remove(config.roleEventBan)
                        embed
                            .setDescription(`Администратор ${author} снял Event ban с пользователя ${member}, причина: ${reasonInput}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        if (ghost) {
                            await connection
                                .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${config.client_id}, ${member.id}, 'eventunban', 0, '${reasonInput}', ${Date.now()});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await member.send({
                                content: `${member}, с вас снят event ban на сервере ${interaction.guild.name}, администратором ***Console***, по причине ${reasonInput}`
                            })
                            .catch((err) => {
    
                            })
                            return
                        }
                        await member.send({
                            content: `${member}, с вас снят event ban на сервере ${interaction.guild.name}, администратором ${author}, по причине ${reasonInput}`
                        })
                        .catch((err) => {
    
                        })
                        await connection
                            .query(`INSERT INTO punishment (executor, target, type, duration, reason, time) VALUES (${author.id}, ${member.id}, 'eventunban', 0, '${reasonInput}', ${Date.now()});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Event unban")
                            .setDescription(`[1] ${author} (${author.id})
[2] Event unban
[3] ${member} (${member.id})
[4] ${timeText}
[5] ${reasonInput}`)
                            .setColor('#ff0000')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannelMute.send({
                            embeds: [logEmbed]
                        })
                        if (!bypass) {
                            await connection
                                .query(`UPDATE protection SET eventban=eventban+1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await wait(120000);
                            await connection
                                .query(`UPDATE protection SET eventban=eventban-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
                    })
                    .catch((err) => {

                    })
                }
            })
            collector.on('end', async () => {
				if (status == 'start') {
					for (let i = 0; i<rowStart1.components.length;i++) {
                        rowStart1.components[i].setDisabled(true)
                    }
                    for (let i = 0; i<rowStart2.components.length;i++) {
                        rowStart2.components[i].setDisabled(true)
                    }
                    for (let i = 0; i<rowStart3.components.length;i++) {
                        rowStart3.components[i].setDisabled(true)
                    }
                    await interaction.editReply({
                        components: [rowStart1, rowStart2, rowStart3],
                    })
				}
                if (status == 'time') {
                    for (let i = 0; i<rowTime.components.length;i++) {
                        rowTime.components[i].setDisabled(true)
                    }
                    await interaction.editReply({
                        components: [rowTime],
                    })
                }
            })
        } catch(err) {
            console.log(err)
        }
	}
};