const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { memoryUsage } = require('node:process');

module.exports = {
	name: Events.VoiceStateUpdate,
    async execute(oldVoiceState, newVoiceState, connection) {
        try {
            let sqlResult
            let parents = ['1144740682280480889', '1141798058129096805', '1141798134499000442', '1142144757955580004']
            let createVoices = ['1144740760508452957','1142846205735469197', '1142846248374763570', '1142850975367958618']
            let voices = ['1143293000626225162', '1143291912720220290', '1143292276546744390']
            if (createVoices.includes(newVoiceState.channelId)) {
                let member = newVoiceState.member
                await connection
                    .query(`SELECT * FROM anti_abuse WHERE id = ${member.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        return
                    })
                if (sqlResult[0] && sqlResult[0].autovoice > 4) {
                    await member.voice.disconnect()
                    if (sqlResult[0].autovoiceblock < Math.floor(Date.now()/1000)) {
                        await connection
                            .query(`UPDATE anti_abuse SET autovoiceblock=${(Math.floor(Date.now()/1000))+60*60}, autovoice=0 WHERE id = ${member.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        let two = n => (n > 9 ? "" : "0") + n;
                        let format = now =>
                            two(now.getDate()) + "." +
                            two(now.getMonth() + 1) + "." +
                            now.getFullYear() + " " +
                            two(now.getHours()) + ":" +
                            two(now.getMinutes());
                        let now = new Date(Date.now()+1000*60*60);
                        let time = format(now)
                        const embed = new EmbedBuilder()
                            .setTitle("Предупреждение")
                            .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                            .setDescription(`${member}, вам был заблокирован доступ к созданию голосовых комнат до ${time}`)
                            .setColor(config.colorError)
                        await member.send({
                            embeds: [embed]
                        }) 
                    }
                    return
                }
                let newVoice = await newVoiceState.channel.parent.children.create({
                    name: member.user.username,
                    type: ChannelType.GuildVoice,
                })
                await newVoice.permissionOverwrites.edit(member, {
                    Connect: true
                });
                await member.voice.setChannel(newVoice)
                .then(async member => {
                    await connection
                        .query(`INSERT INTO anti_abuse (id, autovoice) VALUES (${member.id}, 1) ON DUPLICATE KEY UPDATE autovoice=autovoice+1;`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    await wait(2000)
                    await member.guild.members.fetch(member.id)
                    .then(async member => {
                        if (member.voice.channelId === newVoice.id) {
                            await connection
                                .query(`INSERT INTO autovoice (channelid, memberid, categoryid) VALUES (${newVoice.id}, ${member.id}, ${newVoiceState.channel.parentId});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            await wait(60000)
                            await connection
                                .query(`SELECT * FROM anti_abuse WHERE id = ${member.id}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                .then((result) => sqlResult = result)
                                .catch((err) => {
                                    console.log(`SQL: Error ${err}`)
                                    return
                                })
                            await connection
                                .query(`UPDATE anti_abuse SET autovoice=autovoice-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            await newVoice.delete()
                        }
                    })
                })
                .catch(async err => {
                    console.log(err)
                    await newVoice.delete()
                })
            }
            if (oldVoiceState.channel) {
                if (oldVoiceState.channelId !== newVoiceState.channelId && parents.includes(oldVoiceState.channel.parentId) && !createVoices.includes(oldVoiceState.channelId) && oldVoiceState.channel.members.size === 0 && !voices.includes(oldVoiceState.channel.id)) {
                    await connection
                        .query(`SELECT * FROM autovoice WHERE channelid = ${oldVoiceState.channelId}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then( async (result) => {
                        if (result[0].channelid) {
                            await connection
                                .query(`DELETE FROM autovoice WHERE channelid = ${oldVoiceState.channelId}`, {
                                    type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            await oldVoiceState.channel.delete()
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
            }
        } catch(err) {
            console.log("Event: autovoice",  err)
        }
    },
};