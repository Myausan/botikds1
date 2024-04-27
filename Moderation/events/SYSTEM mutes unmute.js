const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
    async execute(oldVoiceState, newVoiceState, connection) {
        if (!config.moderation) {
            return
        }
        let sqlResult;
        let count;
        let type;
        let now;
        let member
        let m_id
        if (!oldVoiceState.channelId && newVoiceState.channelId) { //join
            await connection
                .query(`SELECT * FROM mutes WHERE id = ${newVoiceState.member.id} AND (type = 'unmute' OR type = 'voice');`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            .then((result) => {
                if (result.length != 0) {
                    sqlResult = result
                } else {
                    return
                }
            })
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
                return
            })
            if (!sqlResult) {
                return
            }
            console.log(123)
            if (sqlResult[0].type == 'voice') {
                newVoiceState.setMute(true)
            } else {
                await connection
                    .query(`DELETE FROM mutes WHERE id = ${newVoiceState.member.id} AND type = 'unmute'`, {
                        type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                newVoiceState.setMute(false, 'Time out')
            }
        }
    },
};