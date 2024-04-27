const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.WebhooksUpdate,
	once: false,
	    async execute(channel, connection) {
            //await wait(4000);
            //console.log(channel);
            //await wait(4000);
            //console.log(connection)
            /*const fetchedLogs = await channel.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.WebhookCreate
            });
            console.log("hello2")
            const RoleDeleteLog = fetchedLogs.entries.first();
            console.log("hello3")
            const {executor, target, changes} = RoleDeleteLog;
            console.log("hello4")
            const actionType = RoleDeleteLog.actionType;
            console.log("hello5")
            const user = await channel.guild.members.fetch(executor.id);
            console.log("hello6")
            const logChannel = await channel.guild.channels.fetch(config.tempLogs);
            let sqlResult;
            let actions = 0;
            console.log(user)
            if (user.id == '432199748699684864' || user.id == '455817057565540365' || user.id == '690913765524504627' || user.id == '415439061914877962' || user.id == '1012666287337508884') { 
                return
            }
            await connection
                .query(`SELECT actions FROM money WHERE id = ${user.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${user.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                actions = sqlResult[0].actions;
            }
            await connection
                .query(`UPDATE money SET actions1=actions1+1 WHERE id = ${user.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            user.roles.remove(user.roles.cache, "guild crash attempt");
            const LogEmbed = new EmbedBuilder()
                .setTitle("**CRASH ATTEMPT**")
                .setDescription(`[1] ${user}(${user.id})\n[2] Member banned\n[3] ${member} (${member.id})\n [4] All roles removed`)
                .setColor("#ff0000");
            await logChannel.send({
                embeds: [LogEmbed]
            })*/
	    },
};
