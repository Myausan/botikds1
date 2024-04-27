const { Events, EmbedBuilder, AuditLogEvent, Attachment } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.MessageUpdate,
	once: false,
    async execute(messageBefore, messageAfter, connection) {
        const { default: chalk } = await import('chalk')
            if (!config.logs) {
            return
        }
        try {
            const logChannel = await messageBefore.guild.channels.cache.find(channel1 => channel1.name === `${config.logMessages}`)
            const author = messageBefore.author;
            let ghost = 0;
            let contentBefore = messageBefore.content;
            let contentAfter = messageAfter.content;
            let sqlResult;
            if (messageBefore.inGuild() && !(author.user?.bot || author.bot)) {
                if (contentBefore == '') {
                    contentBefore = 'пусто'
                }
                if (contentAfter == '') {
                    contentAfter = 'пусто'
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
                if (ghost) {
                    return
                }
                const LogEmbed = new EmbedBuilder()
                    .setTitle("Message was edited")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Message edited\n[3] ${messageBefore.channel}(${messageBefore.channel.id})\n [4] ${contentBefore}\n[5] ${contentAfter}`)
                    .setColor("#ffff00")
                    .setFooter({text: `${author.id} • ${messageBefore.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [LogEmbed],
                })
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log message edit ${err}`))
        }
    },
};