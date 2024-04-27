const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	name: Events.ClientReady,
	once: true,
	    async execute(client, connection) {
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
            const logRoles = await guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`)
            const logMembers = await guild.channels.cache.find(channel1 => channel1.name === `${config.logMembers}`)
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
                                await logRoles.send({
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
                        .then(async (role) => {
                            role.delete()
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Role deleted**")
                                .setDescription(`[1] Роль: ${role.name}(${roleid})\n[2] Role delete\n[3] Удалена пользователем: ${client.user}(${client.user.id})\n[4] Причина: Time out\n[5] Куплена раз: ${sqlResult[i].bought}`)
                                .setColor("#ff0000")
                                .setFooter({text: `${client.user.id} • ${guild.name}`})
                                .setTimestamp()
                            await logRoles.send({
                                embeds: [LogEmbed]
                            })
                        })
                        .catch((err) => {
                        })
                        await connection
                            .query(`DELETE FROM tmroles WHERE roleid = ${roleid};`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    }
                }

                await connection
					.query(`SELECT COUNT(*) as count FROM marry WHERE love_time < ${now};`, {
						type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
                if (sqlResult[0].count != 0) {
                    count = sqlResult[0].count
                    await connection
                        .query(`SELECT * FROM marry WHERE love_time < ${now};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                    for (let i = 0; i < count; i++) {
                        let partner = sqlResult[i].partner
                        let love_money = sqlResult[i].love_money
                        if (love_money >= 2500) {
                            await connection
                                .query(`UPDATE marry SET love_money=love_money-2500, love_time = love_time+1000*60*60*24*14 WHERE partner = ${partner};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            let partner1 = sqlResult[i].partner1;
                            let love_background = sqlResult[i].love_background;
                            let love_create = sqlResult[i].love_create;
                            let love_online = sqlResult[i].love_online;
                            let voiceId = sqlResult[i].loveroom_id
                            await connection
                                .query(`DELETE FROM marry WHERE partner = ${partner};`, {
                                    type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            await guild.channels.fetch(voiceId)
                            .then( async (voice) => {
                                await voice.delete()
                            })
                            .catch((err) => {
                                
                            })
                            const EmbedLog = new EmbedBuilder()
                                .setTitle("Divorce")
                                .setColor('#ff0000')
                                .setDescription(`[1] <@${partner}> (${partner})
[2] <@${partner1}> (${partner1})
[3] Divorce(Time out)
[4] Баланс пары: ${love_money} ${config.emoji}
[5] Действует до: ${love_time}
[6] ID фона: ${love_background}
[7] Совместный онлайн: ${love_online}`)
                                .setFooter({text: `${partner.id} • ${guild.name}`})
                                .setTimestamp();
                            await logMembers.send({
                                embeds: [EmbedLog],
                            })
                        }
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
                        .query(`SELECT * FROM tmmembers WHERE timestamp < ${now};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => sqlResult = result)
                    for (let i = 0; i < count; i++) {
                        const role = await guild.roles.fetch(sqlResult[i].roleid)
                        const member = await guild.members.fetch(sqlResult[i].id)
                        await member.roles.remove(role)
                        .then(async (role) => {
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Role deleted**")
                                .setDescription(`[1] Роль: ${role.name}(${roleid})\n[2] Role delete\n[3] Удалена пользователем: ${client.user}(${client.user.id})\n[4] Причина: Time out\n[5] Куплена раз: ${sqlResult[i].bought}`)
                                .setColor("#ff0000")
                                .setFooter({text: `${client.user.id} • ${guild.name}`})
                                .setTimestamp()
                            await logRoles.send({
                                embeds: [LogEmbed]
                            })
                        })
                        await connection
                            .query(`DELETE FROM tmroles WHERE roleid = ${role.id} AND id = ${member.id};`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                    }
                }
                await wait(60000);
            }
        }
};