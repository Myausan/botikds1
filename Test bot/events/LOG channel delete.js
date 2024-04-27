const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.ChannelCreate,
	once: false,
	    async execute(channel, connection) {
            const { default: chalk } = await import('chalk')
            if (!config.logs) {
                return
            }
            let ghost = 0;
            let sqlResult;
            try {
                const logChannel = await channel.guild.channels.cache.find(channel1 => channel1.name === `${config.logServer}`);
                const fetchedLogs = await channel.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.ChannelDelete
                });
                const ChannelDeleteLog = fetchedLogs.entries.first();
                const {executor, target, changes} = ChannelDeleteLog;
                const actionType = ChannelDeleteLog.actionType;
                const member = await channel.guild.members.fetch(executor.id);
                await connection
                    .query(`SELECT ghost FROM money WHERE id = ${member.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                if (sqlResult[0] === undefined) {
                    await connection
                    .query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                } else {
                    ghost = sqlResult[0].ghost;
                }
                if (ghost) {
                    return
                }
                const LogEmbed = new EmbedBuilder()
                    .setTitle("**Channel Delete**")
                    .setColor("#00ff00")
                    .setDescription(`[1] ${member}(${member.id})\n[2] Member Delete channel\n[3] ${channel.name}(${channel.id})`)
                    .setFooter({text: `${member.id} • ${channel.guild.name}`})
                    .setTimestamp();
                await logChannel.send({
                    embeds: [LogEmbed]
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log channel delete ${err}`))
            }
	    },
};
