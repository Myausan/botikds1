const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildBanRemove,
	once: false,
	    async execute(member, connection) {
            const fetchedLogs = await member.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanRemove
            });
            /*const RoleDeleteLog = fetchedLogs.entries.first();
            const {executor, target, changes} = RoleDeleteLog;
            const actionType = RoleDeleteLog.actionType;
            const user =  await member.guild.members.fetch(executor.id)
            .catch(console.error)
            const logChannel = await member.guild.channels.fetch(config.tempLogs)
            .catch(member.guild.name, console.error)
            let sqlResult;
            let actions = 0;
            if (user.id != '432199748699684864' && user.id != '455817057565540365' && user.id != '690913765524504627' && user.id != '415439061914877962') {
                await connection
                .query(`SELECT actions FROM money WHERE id = ${user.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
                .catch(console.error)
                if (sqlResult[0] === undefined) {
                    await connection
                    .query(`INSERT INTO money (id, money) VALUES (${user.id}, 0);`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                } else {
                    actions = sqlResult[0].actions;
                }
                await connection
                    .query(`UPDATE money SET actions=actions+1 WHERE id = ${user.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .catch(console.error)
                
                if (actions + 1 > 6) {
                    user.roles.remove(user.roles.cache, "guild crash attempt");
                    const LogEmbed = new EmbedBuilder()
                        .setTitle("**CRASH ATTEMPT**")
                        .setDescription(`[1] ${user}(${user.id})\n[2] Member unbanned\n[3] ${member} (${member.id})\n [4] All roles removed`)
                        .setColor("#ff0000");
                    await logChannel.send({
                        embeds: [LogEmbed]
                    })
                    .catch(console.error)
                    return
                }
                async function removeAction () {
                    await wait(20000);
                    if (actions > 6) {
                        user.roles.remove(user.roles.cache, "guild crash attempt");
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${user}(${user.id})\n[2] Member unbanned\n[3] ${member} (${member.id})\n [4] All roles removed`)
                            .setColor("#ff0000");
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        .catch(console.error)
                    } else {
                        await connection
                        .query(`UPDATE money SET actions=actions-1 WHERE id = ${user.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .catch(console.error)
                    }
                }
                removeAction()
            }*/
	},
};
