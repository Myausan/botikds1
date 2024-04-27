const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { memoryUsage } = require('node:process');

module.exports = {
	name: Events.VoiceStateUpdate,
    async execute(oldVoiceState, newVoiceState, connection) {
        return
        try {
            if (oldVoiceState.channelId !== newVoiceState.channelId) {
                if (newVoiceState.channelId === '1201609914825576589') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610457685971044')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (newVoiceState.channelId === '1201610295471259689') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610634668806154')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (newVoiceState.channelId === '1201610318003060846') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610698900385802')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (newVoiceState.channelId === '1201610336755781652') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610652108722218')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (newVoiceState.channelId === '1201610392279986246') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610673759715430')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (newVoiceState.channelId === '1201610364035539035') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610728822550688')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: true
                    });
                }
                if (oldVoiceState.channelId === '1201609914825576589') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610457685971044')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
                if (oldVoiceState.channelId === '1201610295471259689') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610634668806154')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
                if (oldVoiceState.channelId === '1201610318003060846') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610698900385802')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
                if (oldVoiceState.channelId === '1201610336755781652') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610652108722218')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
                if (oldVoiceState.channelId === '1201610392279986246') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610673759715430')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
                if (oldVoiceState.channelId === '1201610364035539035') {
                    const channel = await newVoiceState.guild.channels.fetch('1201610728822550688')
                    await channel.permissionOverwrites.edit(oldVoiceState.member.id, {
                        ViewChannel: null
                    });
                }
            }
        } catch(err) {
            console.log("Event: autovoice",  err)
        }
    },
};