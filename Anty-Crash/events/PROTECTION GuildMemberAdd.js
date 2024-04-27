const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	    async execute(memberAdded, connection, client, DB) {
            if (!config.protection) {
                return
            }
            return
            let sqlResult;
            const { default: chalk } = await import('chalk')
            try {
                await connection
                    .query(`SELECT status FROM money WHERE id = ${memberAdded.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
            if (sqlResult[0].status = 'warn') {
                await memberAdded.ban('Member blacklisted')
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Protection member add ${err}`))
            }
	},
};
