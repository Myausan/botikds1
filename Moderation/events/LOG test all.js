const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildAuditLogEntryCreate,
	once: false,
	    async execute(auditLog, guild, connection) {
            const { default: chalk } = await import('chalk')
            let ghost = 0;
            let sqlResult;
            if (guild.id != '442685664434323456') {
                return
            }
            console.log(auditLog)
            try {
                if (auditLog.action === 25) {
                    console.log(auditLog.changes[0].key)
                    if (auditLog.changes[0].key === '$remove') {
                        console.log("asd")
                    } else if (auditLog.changes[0].key === '$add') {
                        
                    }
                }
                const logChannel = await channel.guild.channels.fetch('841684804469915679');
                const ChannelCreateLog = fetchedLogs.entries.first();
                const {executor, target, changes} = ChannelCreateLog;
                const actionType = ChannelCreateLog.actionType;
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
                    .setTitle("**Channel create**")
                    .setColor("#ff0000")
                    .setDescription(`[1] ${member}(${member.id})\n[2] Member create channel\n[3] ${channel.name}(${channel.id})`)
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log channel create ${err}`))
            }
	    },
};
