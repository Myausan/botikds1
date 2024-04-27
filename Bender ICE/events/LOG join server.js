const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
    async execute(member, connection) {
        const { default: chalk } = await import('chalk')
            if (!config.logs) {
            return
        }
        try {
            const logChannel = await member.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembers}`)
            let ghost = 0;
            let sqlResult;
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
                //.catch(async err => {
                //    console.log("Event: guildMemberAdd  ", err)
                //})
            } else {
                ghost = sqlResult[0].ghost;
            }
            if (ghost) {
                return
            }
            let createdTimestamp = member.user?.createdTimestamp;
            let two = n => (n > 9 ? "" : "0") + n;
            let format = now =>
            two(now.getDate()) + "." +
            two(now.getMonth() + 1) + "." +
            now.getFullYear() + " " +
            two(now.getHours()) + ":" +
            two(now.getMinutes()) + ":" +
            two(now.getSeconds());
            let now = new Date(createdTimestamp);
            let created = format(now)
            const LogEmbed = new EmbedBuilder()
                .setDescription(`[1] ${member} (${member.id})\n[2] Join server\n[3] Created at:${created}`)
                .setColor("#00ff00")
                .setFooter({text: `${member.id} • ${member.guild.name}`})
                .setTimestamp()
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log join server ${err}`))
        }
    },
};