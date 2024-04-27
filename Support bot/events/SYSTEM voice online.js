const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.ClientReady,
	once: true,
    async execute(client, connection) {
        let guild = await client.guilds.fetch(config.guild_id)
        let members = [];
        let skip = false;
        let sqlResult = [];
        let day;
        let dict = {}
        let getDay = (date) => {
            switch(date) {
                case 0: return 'day7'
                case 1: return 'day1'
                case 2: return 'day2'
                case 3: return 'day3'
                case 4: return 'day4'
                case 5: return 'day5'
                case 6: return 'day6'
            }
        }
        let getDate = (date, sqlResult) => {
            switch(date) {
                case 0: return sqlResult[0].day7
                case 1: return sqlResult[0].day1
                case 2: return sqlResult[0].day2
                case 3: return sqlResult[0].day3
                case 4: return sqlResult[0].day4
                case 5: return sqlResult[0].day5
                case 6: return sqlResult[0].day6
            }
        }
        try {
            await wait(60000)
            while (true) {
                let date = new Date
                day = getDay(date.getDay())
                let dateDay = date.getDate()
                await connection
                    .query(`SELECT ${day} FROM active WHERE id = 0;`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                .then((result) => {
                    sqlResult = result
                })
                .catch((err) => {
                    console.log(err)
                })
                if (getDate(date.getDay(), sqlResult) !== dateDay) {
                    await connection
                        .query(`UPDATE active SET ${day} = 0 WHERE id <> 0;`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    await connection
                        .query(`UPDATE active SET ${day} = ${dateDay} WHERE id = 0;`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                }
                loveMembers = []
                guild = await client.guilds.fetch(config.guild_id)
                for (var [v_id, voice] of guild.channels.cache) {
                    if (voice.type == 2) {
                        if (voice.members.size != 0) {
                            let list = voice.members;
                            for (var [m_id, member] of list) {
                                if (member.user.bot) {
                                    continue
                                }
                                await connection
                                    .query(`INSERT INTO money (id, voice_online, exp) VALUES (${m_id}, 1, 15) ON DUPLICATE KEY UPDATE voice_online=voice_online+1, exp=exp+15`, {//exp+50
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                if (voice.parentId === '1014471270626234370' || voice.parentId === '722598206177017858' || voice.parentId === '890680448756379669' || voice.parentId === '989163001884057642') {
                                    await connection.query(`INSERT INTO active (id, ${day}) VALUES (${m_id}, 1) ON DUPLICATE KEY UPDATE ${day}=${day}+1;`)
                                }
                                if (!member.voice.selfMute && !member.voice.serverMute) {
                                    if (dict[m_id] == undefined) {
                                        dict[m_id] = 1
                                    } else {
                                        dict[m_id] = dict[m_id]+1
                                    }
                                    if (dict[m_id] > 2 && dict[m_id] != undefined) {
                                        await connection
                                            .query(`UPDATE money SET money = money+1 WHERE id = ${m_id};`, {
                                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                        dict[m_id] = 0
                                    }
                                }
                            }
                            if (voice.parent.id === '639900024096030730', voice.members.size == 2) {
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
                                    let boo = true
                                    for (var [m_id, member] of list) {
                                        if (m_id != partner1 && m_id != partner2) {
                                            boo = false
                                        }
                                    }
                                    if (boo) {
                                        await connection
                                            .query(`UPDATE marry SET love_online = love_online+1 WHERE loveroom_id = ${v_id}`, {
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