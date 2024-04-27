const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.MessageCreate,
	once: false,
    async execute(message, connection, client, lockedCommands) {
        return
        const author = message.author
        let sqlResult
        await connection
            .query(`SELECT ghost FROM money WHERE id = ${author.id}`, {
                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
        })
            .then((result) => sqlResult = result)
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
            })
        if (sqlResult[0] === undefined) {
            await connection
            .query(`INSERT INTO money (id, messages) VALUES (${author.id}, 1);`, {
                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
        } else {
            await connection
                .query(`UPDATE money SET messages = messages+1 WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
        }
    },
};