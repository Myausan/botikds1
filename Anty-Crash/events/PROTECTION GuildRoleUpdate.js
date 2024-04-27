const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')


module.exports = {
	name: Events.GuildRoleUpdate,
	once: false,
	    async execute(roleBefore, roleAfter, connection, client, DB) {
            if (!config.protection) {
                return
            }
            async function warn(member) {
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
                console.log(chalk.hex('#ff0000')(`[${time}]Protection: Guild crash attempt (${member.user.tag})`))
            }
            const { default: chalk } = await import('chalk')
            const fetchedLogs = await roleAfter.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.RoleUpdate
            });
            const RoleDeleteLog = fetchedLogs.entries.first();
            const {executor, target, changes} = RoleDeleteLog;
            const Type = RoleDeleteLog.Type;
            try {
                const member =  await roleBefore.guild.members.fetch(executor.id)
                const logChannel = await roleBefore.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`)
                const bot = await roleBefore.guild.members.fetch(config.client_id);
                const highestBotRolePosition = bot.roles.highest.position;
                const highestUserRolePosition = member.roles.highest.position;
                if (!(highestBotRolePosition < highestUserRolePosition || DB.whitelistedUsers.bypass.includes(member.id) || DB.whitelistedUsers.roles.includes(member.id))) {
                    let permissionsRoleBefore = roleBefore.permissions.toArray();
                    let permissionsRoleAfter = roleAfter.permissions.toArray();
                    if (roleBefore.name != roleAfter.name || roleBefore.color !=roleAfter.color || JSON.stringify(permissionsRoleBefore) != JSON.stringify(permissionsRoleAfter)) {
                        if ((!permissionsRoleBefore.includes('Administrator') && permissionsRoleAfter.includes('Administrator')) || (!permissionsRoleBefore.includes('BanMembers') && permissionsRoleAfter.includes('BanMembers')) || (!permissionsRoleBefore.includes('KickMembers') && permissionsRoleAfter.includes('KickMembers')) || (!permissionsRoleBefore.includes('ManageGuild') && permissionsRoleAfter.includes('ManageGuild'))) {
                            warn(member);
                            roleAfter.setPermissions(roleBefore.permissions)
                            if (member.user.bot) {
                                let list = member.roles.cache;
                                for (var [key, value] of member.roles.cache) {
                                    if (value.tags.botId) {
                                        list.delete(key)
                                        value.setPermissions([])
                                    }
                                }
                                member.roles.remove(list, "guild crash attempt")
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**CRASH ATTEMPT**")
                                    .setDescription(`[1] ${member}(${member.id})\n[2] Unauthorized addition of administrative permissions\n[3] ${roleAfter} (${roleAfter.id})\n [4] All roles removed`)
                                    .setColor("#ff0000");
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                                return
                            } else {
                                if (member.guild.roles.premiumSubscriberRole != null) {
                                    if (member.guild.roles.cache.has(member.guild.roles.premiumSubscriberRole.id)) {
                                        let list = member.roles.cache;
                                        list.delete(member.guild.roles.premiumSubscriberRole.id);
                                        member.roles.remove(list, "guild crash attempt");
                                    } else {
                                        member.roles.remove(member.roles.cache, "guild crash attempt")
                                    }
                                } else {
                                    member.roles.remove(member.roles.cache, "guild crash attempt")
                                }
                                await connection
                                    .query(`INSERT INTO protection (id, block) VALUES (${member.id}, 1) ON DUPLICATE KEY UPDATE block=1;`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**CRASH ATTEMPT**")
                                    .setDescription(`[1] ${member}(${member.id})\n[2] Unauthorized addition of administrative permissions\n[3] ${roleAfter} (${roleAfter.id})\n [4] All roles removed`)
                                    .setColor("#ff0000");
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                                return
                            }
                        }
                        //if (!DB.actions) DB.actions = {}
                        if (!DB.actions[member.id]) {
                            DB.actions[member.id] = {
                                roles: 0
                            }
                        }
                        if (DB.actions[member.id]["roles"]) {
                            DB.actions[member.id]["roles"] += 1;
                        } else {
                            DB.actions[member.id]["roles"] = 1;
                        }
                        if (DB.actions[member.id]["roles"] > 4) {
                            warn(member);
                            DB.blacklistedUsers.push(member.id)
                            if (member.user.bot) {
                                for (var [key, value] of member.roles.cache) {
                                    let list = member.roles.cache;
                                    if (value.tags.botId != undefined) {
                                        list.delete(key)
                                        value.setPermissions(0n)
                                    }
                                }
                                member.roles.remove(list, "guild crash attempt")
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**CRASH ATTEMPT**")
                                    .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${roleAfter} (${roleAfter.id})\n [4] All roles removed`)
                                    .setColor("#ff0000");
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                                return
                            } else {
                                if (member.guild.roles.premiumSubscriberRole != null) {
                                    if (member.guild.roles.cache.has(member.guild.roles.premiumSubscriberRole.id)) {
                                        let list = member.roles.cache;
                                        list.delete(member.guild.roles.premiumSubscriberRole.id);
                                        member.roles.remove(list, "guild crash attempt");
                                    } else {
                                        member.roles.remove(member.roles.cache, "guild crash attempt")
                                    }
                                } else {
                                    member.roles.remove(member.roles.cache, "guild crash attempt")
                                }
                                await connection
                                    .query(`INSERT INTO protection (id, block) VALUES (${member.id}, 1) ON DUPLICATE KEY UPDATE block=1;`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**CRASH ATTEMPT**")
                                    .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${roleAfter} (${roleAfter.id})\n [4] All roles removed`)
                                    .setColor("#ff0000");
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                                await connection
                                    .query(`INSERT INTO protection (id, block) VALUES (${member.id}, 1) ON DUPLICATE KEY UPDATE block=1;`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                return
                            }
                        }
                        async function removeAction () {
                            await wait(600000);
                            if (actions > 6) {
                                warn(member);
                                if (member.user.bot) {
                                    for (var [key, value] of member.roles.cache) {
                                        let list = member.roles.cache;
                                        if (value.tags.botId != undefined) {
                                            list.delete(key)
                                            value.setPermissions(0n)
                                        }
                                    }
                                    member.roles.remove(list, "guild crash attempt")
                                    const LogEmbed = new EmbedBuilder()
                                        .setTitle("**CRASH ATTEMPT**")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${roleAfter} (${roleAfter.id})\n [4] All roles removed`)
                                        .setColor("#ff0000");
                                    await logChannel.send({
                                        embeds: [LogEmbed]
                                    })
                                    return
                                } else {
                                    if (member.guild.roles.premiumSubscriberRole != null) {
                                        if (member.guild.roles.cache.has(member.guild.roles.premiumSubscriberRole.id)) {
                                            let list = member.roles.cache;
                                            list.delete(member.guild.roles.premiumSubscriberRole.id);
                                            member.roles.remove(list, "guild crash attempt");
                                        } else {
                                            member.roles.remove(member.roles.cache, "guild crash attempt")
                                        }
                                    } else {
                                        member.roles.remove(member.roles.cache, "guild crash attempt")
                                    }
                                    await connection
                                        .query(`UPDATE protection SET block=1 WHERE id = ${member.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                    const LogEmbed = new EmbedBuilder()
                                        .setTitle("**CRASH ATTEMPT**")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${channel} (${channel.id})\n [4] All roles removed`)
                                        .setColor("#ff0000");
                                    await logChannel.send({
                                        embeds: [LogEmbed]
                                    })
                                    return
                                }
                            } else {
                                await connection
                                .query(`UPDATE protection SET editedroles=editedroles-1 WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            }
                        }
                        removeAction()
                    }
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Protection role update ${err}`))
            }
        },
};
