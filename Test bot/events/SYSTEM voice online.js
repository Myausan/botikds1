const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.ClientReady,
	once: false,
    async execute(client, connection) {
        return
        let guild = await client.guilds.fetch(config.guild_id)
        let members = [];
        let skip = false;
        let sqlResult = [];
        let member1;
        let member2;
        try {
            while (true) {
                loveMembers = []
                guild = await client.guilds.fetch(config.guild_id)
                for (var [v_id, voice] of guild.channels.cache) {
                    if (voice.type == 2) {
                        if (voice.members.size != 0) {
                            let list = voice.members;
                            for (var [m_id, member] of list) {
                                await connection
                                    .query(`SELECT ghost FROM money WHERE id = ${m_id}`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                    .then((result) => sqlResult = result)
                                    .catch((err) => {
                                        console.log(`SQL: Error ${err}`)
                                    })
                                if (sqlResult[0] === undefined) {
                                    await connection
                                    .query(`INSERT INTO money (id, voice_online) VALUES (${m_id}, 60000);`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                } else {
                                    await connection
                                        .query(`UPDATE money SET voice_online = voice_online+60000 WHERE id = ${m_id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                }
                                if (!member.selfMute && !member.serverMute) {
                                    if (members.includes(m_id)) {
                                        members.splice(members.indexOf(m_id), 1)
                                        await connection
                                            .query(`UPDATE money SET money = money+1 WHERE id = ${m_id};`, {
                                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                    } else {
                                        members.push(m_id)
                                    }
                                }
                            }
                            if (voice.parent.id === '639900024096030730') {
                                await connection
                                    .query(`SELECT partner, partner1 FROM marry WHERE loveroom_id = ${v_id}`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                .then((result) => sqlResult = result)
                                if (sqlResult[0] === undefined) {
                                    continue
                                } else {
                                    partner1 = sqlResult[0].partner;
                                    partner2 = sqlResult[0].partner1;
                                    let boo1 = false
                                    let boo2 = false
                                    for (var [m_id, member] of list) {
                                        if (m_id == partner1) {
                                            boo1 = true
                                        } else if (m_id == partner2) {
                                            boo2 = true
                                        }
                                    }
                                    if (boo1 && boo2) {
                                        await connection
                                            .query(`UPDATE marry SET love_online = love_online+60000 WHERE loveroom_id = ${v_id}`, {
                                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                    }
                                }
                            }
                        }
                    }
                }
                await wait(60000)
            }
        } catch(err) {
            console.log("Event: voice online",  err)
        }
    },
};