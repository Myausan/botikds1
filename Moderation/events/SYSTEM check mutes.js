const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.ClientReady,
	once: false,
    async execute(client, connection, client1, lockedCommands) {
        if (!config.moderation) {
            return
        }
        let sqlResult;
        let count;
        let type;
        let now;
        let member
        let m_id
        const guild = await client.guilds.fetch(config.guild_id)
        const logChannel = await guild.channels.cache.find(channel1 => channel1.name === `${config.logMutes}`)
        while (true) {
            const guild = await client.guilds.fetch(config.guild_id)
            now = Date.now();
            await connection
				.query(`SELECT COUNT(*) as count FROM mutes WHERE timestamp < ${now} AND timestamp != 0;`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
            .then((result) => sqlResult = result)
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
            })
            if (sqlResult[0].count != 0) {
                count = sqlResult[0].count
                await connection
                    .query(`SELECT * FROM mutes WHERE timestamp < ${now} AND timestamp != 0;`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
                for (let i = 0; i < count; i++) {
                    m_id = String(sqlResult[i].id)
                    type = sqlResult[i].type
                    await connection
                        .query(`DELETE FROM mutes WHERE id = ${m_id} AND type = '${type}'`, {
                            type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    await guild.members.fetch(m_id)
                    .then(async (fetchedMember) => {
                        member = fetchedMember
                        if (type == 'text') {
                            await member.roles.remove(config.roleMute, 'Time out')
                            .then((member) => {
                                console.log(member)
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                        }
                        if (type == 'voice') {
                            if (member.voice.channelId) {
                                await member.voice.setMute(false)
                            } else {
                                await connection
                                    .query(`INSERT INTO mutes (id, type, timestamp) VALUES (${member.id}, 'unmute', 0);`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            }
                        }
                        if (type == 'eventban') {
                            if (member.roles.cache.has(config.roleEventBan)) {
                                await connection
                                    .query(`DELETE FROM mutes WHERE id = ${m_id} AND type = '${type}'`, {
                                        type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await member.roles.remove(config.roleEventBan)
                            }
                        }
                    })
                    .catch((err) => {
                    })
                }
            }
            await wait(60000);
        }
    },
};