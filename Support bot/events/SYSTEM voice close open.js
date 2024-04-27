const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { memoryUsage } = require('node:process');

module.exports = {
	name: Events.VoiceStateUpdate,
    async execute(oldVoiceState, newVoiceState, connection) {
        try {
            let parents = ['797484126638571531', '949957292743360532', '934372403264516136', '977654896356651058', '977654896356651058']
            if (oldVoiceState.channelId === newVoiceState.channelId) {
                return
            }
            if (oldVoiceState.channel) {
                if (parents.includes(oldVoiceState.channel.parentId) && oldVoiceState.channelId !== '1192176698716856380' && oldVoiceState.channel.members.size === 0) {
                    await oldVoiceState.channel.permissionOverwrites.edit(oldVoiceState.guild.id, {
                        ViewChannel: false
                    });
                }
            }
            if (newVoiceState.channel) {
                if (parents.includes(newVoiceState.channel.parentId) && newVoiceState.channelId !== '1192176698716856380') {
                    await newVoiceState.channel.permissionOverwrites.edit(newVoiceState.guild.id, {
                        ViewChannel: null
                    });
                }
            }
        } catch(err) {
            console.log("Event: autovoice",  err)
        }
    },
};