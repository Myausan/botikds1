const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');
const fs = require

module.exports = {
	name: Events.ClientReady,
	once: false,
    async execute(client, connection, client1, lockedCommands) {
        if (true) {
            return
        }
        let now;
        let hour;
        let banner = '';
        let id;
        let edit = true;
        const guild = await client.guilds.fetch(config.guild_id)
        let files = fs.readdirSync('./banners/')
        while (true) {
            const guild = await client.guilds.fetch(config.guild_id)
            now = new Date
            hour = now.getHours()
            if (hour >= 4 && hour < 11 && id !=1) {
                id = 1;
                edit = true;
            }
            if (hour >= 11 && hour < 17 && id !=2) {
                id = 2;
                edit = true;
            }
            if (hour >= 17 && hour < 22 && id !=3) {
                id = 3;
                edit = true;
            }
            if ((hour >= 22 || hour < 4) && id !=4) {
                id = 4;
                edit = true;
            }
            if (edit) {
                await guild.setBanner(files[id])
            }
            await wait(60000);
        }
    },
};