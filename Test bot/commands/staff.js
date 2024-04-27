const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { $selectMenu, $sendMessage, $row } = require("discord.js-basic")
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('staff')
        .setDescription('клан')
        .addSubcommand(subcommand =>
            subcommand
                .setName("profile")
                .setDescription("Посмотреть стафф профиль")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("action")
                .setDescription("Действия со стаффом")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(true)
                )
        ),
    async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const memberUser = interaction.options.getUser('member');
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembersEconomy}`)
        let ghost = 0;
        let member
        let warns = 0;
        let points = 0;
        let reports = 0;
        let verifi = 0;
        let block = 0;
        let m_warns = 0;
        let m_mutes = 0;
        let m_bans = 0;
        let sqlResult;
        let sqlResult1;
        let timeCode = 'all';
        let now = Date.now()
        let message;
        let groupText;
        let time;
        let time7;
        if (memberUser) {
            member = await interaction.guild.members.fetch(memberUser.id)
        } else {
            member = author
        }
        let group = (member) => {
            if (member.id == config.owner_id) {
                return 'Console'
            }
            if (member.roles.cache.has(config.roleLegendary)) {
                return '𝐋𝐞𝐠𝐞𝐧𝐝𝐚𝐫𝐲'
            }
            if (member.roles.cache.has(config.roleGods)) {
                return '𝐆𝐨𝐝𝐬'
            }
            if (member.roles.cache.has(config.roleSerafim)) {
                return '𝐒𝐞𝐫𝐚𝐩𝐡𝐢𝐦'
            }
            if (member.roles.cache.has(config.roleCurator)) {
                return '𝐀𝐫𝐡𝐚𝐧𝐠𝐞𝐥𝐮𝐬'
            }
            if (member.roles.cache.has(config.roleMod)) {
                return '𝐌𝐨𝐝𝐞𝐫𝐚𝐭𝐨𝐫'
            }
            if (member.roles.cache.has(config.roleEvent)) {
                return '𝐄𝐯𝐞𝐧𝐭-𝐌𝐚𝐬𝐭𝐞𝐫'
            }
            if (member.roles.cache.has(config.roleGameMaster)) {
                return '𝐆𝐚𝐦𝐞-𝐌𝐚𝐬𝐭𝐞𝐫'
            }
            if (member.roles.cache.has(config.roleControl)) {
                return '𝐂𝐨𝐧𝐭𝐫𝐨𝐥'
            }
            if (member.roles.cache.has(config.roleHelper)) {
                return '𝐇𝐞𝐥𝐩𝐞𝐫'
            }
            if (permissions.has(PermissionsBitField.Flags.Administrator)) {
                return 'Не определена'
            }
            return 'none'
        }
        let checkPerms = (permsMember, permsNeeded) => {
            if (permsMember >= permsNeeded) {
                return true
            } else {
                return false
            }
        }
        let formatTime = (time) => {
            let m = Math.floor(time%60);
            let h = Math.floor(time/60%24);
            let d = Math.floor(time/60/24);
            let result = '';
            if ((d % 10 == 1) && d != 11) {
                result += `${d} день `
            } else {
                if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
                    result += `${d} дня `
                } else {
                    result += `${d} дней `
                }
            }
            if ((h % 10 == 1) && h != 11) {
                result += `${h} час `
            } else {
                if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
                    result += `${h} часа `
                } else {
                    result += `${h} часов `
                }
            }
            if ((m % 10 == 1) && m != 11) {
                result += `${m} минута`
            } else {
                if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
                    result += `${m} минуты`
                } else {
                    result += `${m} минут`
                }
            }
            return result
        }
        let ephemeral = (ghost) => {
            if (ghost) {
                return true
            } else {
                return false
            }
        }
        let checkTime = (time) => {
            switch(time) {
                case 'day7': return now-7*24*60*60*1000
                case 'day14': return now-14*24*60*60*1000
                case 'day30': return now-30*24*60*60*1000
                default: return 0
            }
        }
        let checkWarns = (sqlResult, time) => {
            let count = 0;
            for (key of sqlResult) {
                if (key.type === 'warn' && key.time > time) count++
            }
            return count
        }
        let checkMutes = (sqlResult, time) => {
            let count = 0;
            for (key of sqlResult) {
                if ((key.type === 'text' || key.type === 'voice' || key.type === 'timeout') && key.time > time) count++
            }
            return count
        }
        let checkBans = (sqlResult, time) => {
            let count = 0;
            for (key of sqlResult) {
                if (key.type === 'ban' && key.time > time) count++
            }
            return count
        }
        let checkReports = (sqlResult, time) => {
            let count = 0;
            for (key of sqlResult) {
                if (key.type === 'report' && key.time > time) count++
            }
            return count
        }
        let checkAdminWarns = (sqlResult, time) => {
            let count = 0;
            for (key of sqlResult) {
                if (key.type === 'awarn' && key.time+key.duration > time) count++
            }
            return count
        }
        switch (subcommand) {
            case 'profile': title=`Стафф профиль ${member.displayName}`;break;
            case 'action': title=`Взаимодействие с участником стаффа ${member.displayName}`;break;
        }
        if (lockedCommands.includes(interaction.commandName + ' ' + subcommand)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            await connection
                .query(`SELECT ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => {
                    sqlResult = result
                })
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    return
                })
            ghost = sqlResult[0].ghost
            await connection
                .query(`SELECT * FROM staff WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => {
                    sqlResult = result
                })
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    return
                })
            if (!sqlResult[0]) {
                if (author.id === member.id) {
                    const lockEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(`${author}, вы не являетесь участником стаффа`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                } else {
                    const lockEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(`${author}, ${member} не является участником стаффа`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                }
            }
            points = sqlResult[0].points
            reports = sqlResult[0].reports
            verifi = sqlResult[0].verifi
            block = sqlResult[0].block
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(author.user.displayAvatarURL())
            if (subcommand === 'profile') {
                await connection
                    .query(`SELECT * FROM active WHERE id = ${member.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => {
                        if (result[0]) {
                            sqlResult = result
                        } else {
                            sqlResult[0] = {
                                day1: 0,
                                day2: 0,
                                day3: 0,
                                day4: 0,
                                day5: 0,
                                day6: 0,
                                day7: 0,
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                await connection
                    .query(`SELECT * FROM punishment WHERE executor = ${member.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => {
                        sqlResult1 = result
                    })
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                const row = new ActionRowBuilder()
                    .addComponents(
                        new $selectMenu()
                            .customId("SelectMenuStaffProfile")
                            .placeholder("Период")
                            .options({
                                label: '7 дней',
                                description: 'Статистика за 7 дней',
                                value: 'day7',
                                emoji: {
                                    id: "783709313012465664",
                                    name: "kek",
                                    animated: false
                                    },
                                },
                                {
                                label: '14 дней',
                                description: 'Статистика за 14 дней',
                                value: 'day14',
                                emoji: {
                                    id: "783709256629223464",
                                    name: "wtf",
                                    animated: false
                                    },
                                },
                                {
                                    label: '30 дней',
                                    description: 'Статистика за 30 дней',
                                    value: 'day30',
                                    emoji: {
                                        id: "1060971756824834088",
                                        name: "833678936634163240",
                                        animated: false
                                        },
                                },
                                {
                                    label: 'За всё время',
                                    description: 'Статистика за всё время',
                                    value: 'all',
                                    emoji: {
                                        id: "783709248404193290",
                                        name: "hehe",
                                        animated: false
                                        },
                                })
                            .save()
                    )
                warns = checkAdminWarns(sqlResult, now)
                groupText = group(member)
                time7 = formatTime(sqlResult[0].day1 ?? 0+sqlResult[0].day2 ?? 0+sqlResult[0].day3 ?? 0+sqlResult[0].day4 ?? 0+sqlResult[0].day5 ?? 0+sqlResult[0].day6 ?? 0+sqlResult[0].day7 ?? 0)
                embed
                    .addFields({name: `Админ группа:`, value: `\`\`\`${groupText}\`\`\``, inline: false},
                    {name: `Голосовая активность(за 7 дней):`, value: `\`\`\`${time7}\`\`\``, inline: false},
                    {name: `Выговоров:`, value: `\`\`\`${warns}/3\`\`\``, inline: true},
                    {name: `Поинтов:`, value: `\`\`\`${points}\`\`\``, inline: true},
                    {name: `Рассмотрено репортов:`, value: `\`\`\`${reports}\`\`\``, inline: true},
                    {name: `Выдано варнов:`, value: `\`\`\`${checkWarns(sqlResult1, 0) ?? 0}\`\`\``, inline: true},
                    {name: `Выдано мутов:`, value: `\`\`\`${checkMutes(sqlResult1, 0) ?? 0}\`\`\``, inline: true},
                    {name: `Выдано банов:`, value: `\`\`\`${checkBans(sqlResult1, 0) ?? 0}\`\`\``, inline: true})
                await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    fetchReply: true
                })
                .then((msg) => {
                    message = msg
                })
                const collector = message.createMessageComponentCollector({ time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    collector.resetTimer()
                    await ButtonInteraction.deferUpdate()
                    await connection
                        .query(`SELECT * FROM punishment WHERE executor = ${member.id} AND time > ${checkTime(ButtonInteraction.values[0])}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => {
                            sqlResult1 = result
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    embed.setFields()
                    embed
                        .addFields({name: `Админ группа:`, value: `\`\`\`${groupText}\`\`\``, inline: false},
                        {name: `Голосовая активность(за 7 дней):`, value: `\`\`\`${time7}\`\`\``, inline: false},
                        {name: `Выговоров:`, value: `\`\`\`${warns}/3\`\`\``, inline: true},
                        {name: `Поинтов:`, value: `\`\`\`${points}\`\`\``, inline: true},
                        {name: `Рассмотрено репортов:`, value: `\`\`\`${reports}\`\`\``, inline: true},
                        {name: `Выдано варнов:`, value: `\`\`\`${checkWarns(sqlResult1) ?? 0}\`\`\``, inline: true},
                        {name: `Выдано мутов:`, value: `\`\`\`${checkMutes(sqlResult1) ?? 0}\`\`\``, inline: true},
                        {name: `Выдано банов:`, value: `\`\`\`${checkBans(sqlResult1) ?? 0}\`\`\``, inline: true})
                    await interaction.editReply({
                        embeds: [embed]
                    })
                })
            }
            if (subcommand === 'action') {
                if (group(member) === 'none') {
                    await interaction.reply({
                        content: `${author}, ${member} не является участником стафа`,
                        ephemeral: true
                    })
                    return
                }
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionRemoveStaff')
                            .setLabel('Снятие со стафа')
                            //.setEmoji('<:timeout:1121529551206486067>')
                            .setDisabled(false)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionWarn')
                            .setLabel('Выдать предупреждение')
                            //.setEmoji('<:untimeout:1121529560832430201>')
                            .setDisabled(false)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionUnwarn')
                            .setLabel('Снять предупреждение')
                            //.setEmoji('<:voicemute:1121529563898466364>')
                            .setDisabled(false)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionBlacklist')
                            .setLabel('Снятие со стафа с внесением в чс')
                            //.setEmoji('<:voiceunmute:1121529565374853190>')
                            .setDisabled(false)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionUnblacklist')
                            .setLabel('Вернуть из чс стафа')
                            //.setEmoji('<:voiceunmute:1121529565374853190>')
                            .setDisabled(false)
                            .setStyle(2),
                    )
                const rowCancel = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonStaffActionCancel')
                            .setLabel('Отмена')
                            //.setEmoji('<:timeout:1121529551206486067>')
                            .setDisabled(false)
                            .setStyle(4),
                    )
                embed.setDescription(`${author}, выберите тип взаимодействия с ${member}`)
                await interaction.reply({
                    embeds: [embed],
                    components: [row, rowCancel],
                    ephemeral: ephemeral(ghost),
                    fetchReply: true
                })
                .then((msg) => {
                    message = msg
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonStaffActionRemoveStaff' || ButtonInteraction.customId === 'buttonStaffActionWarn' || ButtonInteraction.customId === 'buttonStaffActionUnwarn' || ButtonInteraction.customId === 'buttonStaffActionBlacklist' || ButtonInteraction.customId === 'buttonStaffActionUnblacklist'  || ButtonInteraction.customId === 'buttonStaffActionCancel';

			    const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    if (ButtonInteraction.customId === 'buttonStaffActionRemoveStaff') {
                        
                    }
                })
            }
        } catch(err) {
            lockedCommands.push(interaction.commandName)
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