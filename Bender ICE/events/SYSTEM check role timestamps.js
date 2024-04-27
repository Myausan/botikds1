const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	name: Events.ClientReady,
	once: true,
	    async execute(client, connection) {
            return
            if (!config.economy) {
                return
            }
            let sqlResult;
            let count;
            let roleid;
            let role;
            let now;
            let notNow;
            const guild = await client.guilds.fetch(config.guild_id)
            const logChannel = await guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`)
            await connection
				.query(`UPDATE protection SET bans = 0, deletedroles = 0, editedroles = 0, deletedchannels = 0, addremroles = 0;`, {
					type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
            while (true) {
                now = Date.now();
                notNow = Date.now()-1000*60*60*24*7
                await connection
					.query(`SELECT COUNT(*) as count FROM tmroles WHERE timestamp < ${now};`, {
						type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
                if (sqlResult[0].count != 0) {
                    count = sqlResult[0].count
                    await connection
                        .query(`SELECT * FROM tmroles WHERE timestamp < ${now};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                    for (let i = 0; i < count; i++) {
                        roleid = sqlResult[i].roleid
                        role = await guild.roles.fetch(roleid)
                        .then(async (role) => {
                            if (sqlResult[i].cost != 0) {
                                await connection
                                    .query(`UPDATE tmroles SET cost = 0 WHERE roleid = ${roleid};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**Role remove from tm**")
                                    .setDescription(`[1] ${role.name}(${roleid})\n[2] Role remove from tm\n[3] ${client.user}(${client.user.id})\n[4] Time out`)
                                    .setColor("#ff0000")
                                    .setFooter({text: `${client.user.id} • ${guild.name}`})
                                    .setTimestamp()
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                            }
                        })
                        .catch((err) => {
                            
                        })
                    }
                }
                await connection
					.query(`SELECT COUNT(*) as count FROM tmroles WHERE timestamp < ${notNow};`, {
						type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
                if (sqlResult[0].count != 0) {
                    count = sqlResult[0].count
                    await connection
                        .query(`SELECT * FROM tmroles WHERE timestamp < ${notNow};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => sqlResult = result)
                    for (let i = 0; i < count; i++) {
                        roleid = sqlResult[i].roleid
                        await guild.roles.fetch(roleid)
                        .then((role) => {
                            role.delete()
                        })
                        .catch( async (err) => {
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Role deleted**")
                                .setDescription(`[1] Роль: ${role.name}(${roleid})\n[2] Role delete\n[3] Удалена пользователем: ${client.user}(${client.user.id})\n[4] Причина: Time out\n[5] Куплена раз: ${sqlResult[i].bought}`)
                                .setColor("#ff0000")
                                .setFooter({text: `${client.user.id} • ${guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [LogEmbed]
                            })
                        })
                        await connection
                            .query(`DELETE FROM tmroles WHERE roleid = ${roleid};`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    }
                }
                await wait(60000);
            }
        }
};