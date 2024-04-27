const { Events, EmbedBuilder, AuditLogEvent, Attachment } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.MessageDelete,
	once: false,
    async execute(message, connection) {
        const { default: chalk } = await import('chalk')
            if (!config.logs) {
            return
        }
        let ghost = 0;
        let sqlResult;
        let content = message.content;
        try {
            const logChannel = await message.guild.channels.cache.find(channel1 => channel1.name === `${config.logMessages}`)
            const author = message.author;
            if (message.inGuild() && !(author.user?.bot || author.bot)) {
                if (content == '') {
                    content = 'пусто'
                }
                await connection
                    .query(`SELECT id, ghost FROM money WHERE id = ${author.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                if (sqlResult[0] === undefined) {
                    await connection
                    .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                } else {
                    ghost = sqlResult[0].ghost;
                }
                if (ghost == 1) {
                    return
                }
                if (message.attachments.size > 0) {
                    let attachments = [];
                    for (var [key, value] of message.attachments) {
                        attachments.push(value.attachment)
                    }
                    if (attachments.size == 1){
                        const LogEmbed = new EmbedBuilder()
                        .setTitle("Message was deleted")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Message deleted\n[3] ${message.channel}(${message.channel.id})\n [4] ${content}`)
                        .setColor("#ff0000")
                        .setImage(attachments[0])
                        .setFooter({text: `${author.id} • ${message.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [LogEmbed],
                    })
                    } else {
                        const LogEmbed = new EmbedBuilder()
                        .setTitle("Message was deleted")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Message deleted\n[3] ${message.channel}(${message.channel.id})\n [4] ${content}`)
                        .setColor("#ff0000")
                        .setFooter({text: `${author.id} • ${message.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [LogEmbed],
                    })
                    await logChannel.send({
                        files: attachments
                    })
                    }
                } else {
                    const LogEmbed = new EmbedBuilder()
                        .setTitle("Message was deleted")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Message deleted\n[3] ${message.channel}(${message.channel.id})\n [4] ${content}`)
                        .setColor("#ff0000")
                        .setFooter({text: `${author.id} • ${message.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [LogEmbed],
                    })
                }
            } else {
                if (author.id == '865670098705973259' && message.channel.parentId == '859031841129758740') {
                    const fetchedLogs = await message.guild.fetchAuditLogs({
                        limit: 1,
                        type: AuditLogEvent.MessageDelete
                    });
                        const RoleDeleteLog = fetchedLogs.entries.first();
                        const {executor, target, changes} = RoleDeleteLog;
                        const actionType = RoleDeleteLog.actionType;
                        const user =  await message.guild.members.fetch(executor.id)
                        .catch(console.error)
                        if (user.id != '432199748699684864' && user.id != '865670098705973259') {
                            let attachments = [];
                            for (var [key, value] of message.attachments) {
                                attachments.push(value.attachment)
                            }
                            owner = await message.guild.members.fetch(config.owner_id);
                            owner.send({
                                content: `${user} удаляет логи\n`,
                                files: attachments,
                                embeds: message.embeds
                            })
                        }
                }
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: message delete ${err}`))
        }
    },
};