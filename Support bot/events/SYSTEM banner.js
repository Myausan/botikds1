const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { readdirSync } = require('fs');


module.exports = {
	name: Events.ClientReady,
	once: true,
    async execute(client, connection, client1, lockedCommands) {
        return
        let id;
        let now;
        let hour;
        let edit
        let path
        const guild = await client.guilds.fetch(config.guild_id)
        while (true) {
            now = new Date
            hour = now.getHours()
            if (hour >= 4 && hour < 11 && id !=1 && !edit) {
                id = 1;
                edit = true;
            }
            if (hour >= 11 && hour < 17 && id !=2 && !edit) {
                id = 2;
                edit = true;
            }
            if (hour >= 17 && hour < 22 && id !=3 && !edit) {
                id = 3;
                edit = true;
            }
            if ((hour >= 22 || hour < 4) && id !=4 && !edit) {
                id = 4;
                edit = true;
            }
            if (edit) {
                path=`banners/banner${id}.png`
                await guild.setBanner(path)
                .catch(console.error)
                edit = false
            }
            await wait(60000);
        }
    },
};