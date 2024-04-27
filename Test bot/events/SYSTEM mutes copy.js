const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
    async execute(oldVoiceState, newVoiceState, connection) {
        if (!config.protection) {
            return
        }
        let sqlResult;
        let count;
        let type;
        let now;
        let member
        let m_id
        if (!oldVoiceState.channelId && newVoiceState.channelId && newVoiceState.serverMute) { //left
            console.log(newVoiceState.member.id)
            await connection
                .query(`SELECT * FROM mutes WHERE id = ${newVoiceState.member.id} AND type = 'unmute';`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            .then((result) => sqlResult = result)
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
                return
            })
            await connection
                .query(`DELETE FROM mutes WHERE id = ${newVoiceState.member.id} AND type = 'unmute'`, {
                    type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            newVoiceState.setMute(false, 'Time out')
        }
    },
};