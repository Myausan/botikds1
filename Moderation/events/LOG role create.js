const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildRoleCreate,
	once: false,
	    async execute(role, connection) {
            const { default: chalk } = await import('chalk')
            if (!config.logs) {
                return
            }
            let ghost = 0;
            let sqlResult;
            try {
                const logChannel = await role.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                const fetchedLogs = await role.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.RoleCreate
                });
                const RoleCreateLog = fetchedLogs.entries.first();
                const {executor, target, changes} = RoleCreateLog;
                const actionType = RoleCreateLog.actionType;
                const member = await role.guild.members.fetch(executor.id);
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
                    .setTitle("**Role create**")
                    .setColor("#ff0000")
                    .setDescription(`[1] ${member}(${member.id})\n[2] Member create role\n[3] ${role}(${role.id})`)
                    .setFooter({text: `${member.id} • ${role.guild.name}`})
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log role create ${err}`))
            }
	    },
};
