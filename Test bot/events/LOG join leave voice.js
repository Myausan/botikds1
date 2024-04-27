const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
    async execute(oldVoiceState, newVoiceState, connection) {
        const { default: chalk } = await import('chalk')
            if (!config.logs) {
            return
        }
        let limit
        let limitOldVoice
        let limitNewVoice
        try {
            let ghost = 0;
            const logChannel = await oldVoiceState.guild.channels.cache.find(channel1 => channel1.name === `${config.logVoices}`);
            let member = oldVoiceState.member
            let sqlResult;
            await connection
                .query(`SELECT ghost FROM money WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                })
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                ghost = sqlResult[0].ghost;
            }
            if (ghost) {
                return
            }
            if (oldVoiceState.channelId) { //left
                if (newVoiceState.channelId){ //move
                    let oldVoice = oldVoiceState.channel
                    let newVoice = newVoiceState.channel
                    if (oldVoice.id == newVoice.id) {
                        return
                    }
                    limitOldVoice = oldVoice.userLimit;
                    limitNewVoice = newVoice.userLimit;
                    if (limitOldVoice == 0 ) {
                        limitOldVoice = "∞"
                    }
                    if (limitNewVoice == 0) {
                        limitNewVoice = "∞"
                    }
                    const LogEmbed = new EmbedBuilder()
                        .setTitle("Member move voice channel")
                        .setDescription(`[1] ${member}(${member.id})\n[2] Member move to voice channel\n[3] ${oldVoice}(${oldVoice.id})\n [4] ${oldVoice.members.size}/${limitOldVoice}\n[5] ${newVoice}(${newVoice.id})\n [6] ${newVoice.members.size}/${limitNewVoice}`)
                        .setColor("#ffff00")
                        .setFooter({text: `${member.id} • ${oldVoiceState.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [LogEmbed]
                    })
                } else { //left
                    let voice = oldVoiceState.channel
                    limit = voice.userLimit
                    if (limit == 0 ) {
                        limit = "∞"
                    }
                    const LogEmbed = new EmbedBuilder()
                        .setTitle("Member leave voice channel")
                        .setDescription(`[1] ${member}(${member.id})\n[2] Member left from voice channel\n[3] ${voice}(${voice.id})\n [4] ${voice.members.size}/${limit}`)
                        .setColor("#ff0000")
                        .setFooter({text: `${member.id} • ${oldVoiceState.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [LogEmbed]
                    })
                }
            }
            else {  //join
                let voice = newVoiceState.channel
                limit = voice.userLimit;
                if (limit == 0 ) {
                    limit = "∞";
                }
                const LogEmbed = new EmbedBuilder()
                    .setTitle("Member join voice channel")
                    .setDescription(`[1] ${member}(${member.id})\n[2] Member join into voice channel\n[3] ${voice}(${voice.id})\n [4] ${voice.members.size}/${limit}`)
                    .setColor("#00ff00")
                    .setFooter({text: `${oldVoiceState.id} • ${oldVoiceState.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [LogEmbed]
                })
            }
        } catch(err) {
            let two = n => (n > 9 ? "" : "0") + n;
                let format = now =>
                    two(now.getDate()) + "." +
                    two(now.getMonth() + 1) + "." +
                    now.getFullYear() + " " +
                    two(now.getHours()) + ":" +
                    two(now.getMinutes()) + ":" +
                    two(now.getSeconds());
                let now = new Date();
                let time = format(now)
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log join leave move voice ${err}`))
        }
    },
};