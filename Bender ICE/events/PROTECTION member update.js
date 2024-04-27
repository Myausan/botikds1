const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberUpdate,
	once: false,
	    async execute(oldMember, newMember, connection) {
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
            const bot = await oldMember.guild.members.fetch(config.client_id);
            const highestBotRolePosition = bot.roles.highest.position;
            const logChannelProrection = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`);
            let sqlResult;
            let actions = 0;
            let actions1 = 0;
            let bypass = 0;
            try {
                if (oldMember.roles.cache.size !== newMember.roles.cache.size) { // Roles change
                    const logChannelRoles = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    const logChannelWarns = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`);
                    const role = await oldMember.guild.roles.fetch('1065022119710302208')
                    const rolepos = role.position
                    if (oldMember.roles.cache.size < newMember.roles.cache.size) { //role member add
                        const fetchedLogs = await oldMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberRoleUpdate
                        });
                        const RoleDeleteLog = fetchedLogs.entries.first();
                        const {executor, target, changes} = RoleDeleteLog;
                        const actionType = RoleDeleteLog.actionType;
                        const member = await oldMember.guild.members.fetch(executor.id);
                        const highestUserRolePosition = member.roles.highest.position;
                        const roles = changes[0].new //{ name: 'name', id: 'id' },
                        let rolesList = []
                        let role
                        await connection
                            .query(`SELECT bypass, addremroles FROM protection WHERE id = ${member.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                        if (sqlResult[0] === undefined) {
                            await connection
                            .query(`INSERT INTO protection (id) VALUES (${member.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        } else {
                            bypass = sqlResult[0].bypass
                            actions1 = sqlResult[0].addremroles;
                        }
                        if (!member.permissions.has('Administrator') && !member.permissions.has('ManageRoles') && bypass == 0) {
                            return
                        }
                        for (let i = 0; i < changes[0].new.length; i++){
                            role = await oldMember.guild.roles.fetch(changes[0].new[i].id)
                            if (role.position > rolepos) {
                                actions++
                            }
                        }
                        if (actions == 0) {
                            return
                        }
                        if (member.id != '432199748699684864' && member.id != '455817057565540365' && member.id != '690913765524504627' && member.id != '415439061914877962' && member.id != '1094303596188798988' && member.id != '292352708462247936' && highestBotRolePosition > highestUserRolePosition) {
                            actions1 = actions + actions1
                            await connection
                                .query(`UPDATE protection SET addremroles=addremroles+${actions} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            if (actions1 > 10) {
                                warn(member);
                                if (member.user.bot) {
                                    for (var [key, value] of member.roles.cache) {
                                        let list = member.roles.cache;
                                        if (value.tags.botId != undefined) {
                                            list.delete(key)
                                            value.setPermissions()
                                        }
                                    }
                                    member.roles.remove(list, "guild crash attempt")
                                    const LogEmbed = new EmbedBuilder()
                                        .setTitle("**CRASH ATTEMPT**")
                                        .setColor("#ff0000")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                        .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                        .setTimestamp();
                                    await logChannelProrection.send({
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
                                        .setColor("#ff0000")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                        .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                        .setTimestamp();
                                    await logChannelProrection.send({
                                        embeds: [LogEmbed]
                                    })
                                    return
                                }
                            }
                            async function removeAction () {
                                await wait(120000);
                                if (actions1 > 10) {
                                    warn(member);
                                    if (member.user.bot) {
                                        for (var [key, value] of member.roles.cache) {
                                            let list = member.roles.cache;
                                            if (value.tags.botId != undefined) {
                                                list.delete(key)
                                                value.setPermissions()
                                            }
                                        }
                                        member.roles.remove(list, "guild crash attempt")
                                        const LogEmbed = new EmbedBuilder()
                                            .setTitle("**CRASH ATTEMPT**")
                                            .setColor("#ff0000")
                                            .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                            .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                            .setTimestamp();
                                        await logChannelProrection.send({
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
                                            .setColor("#ff0000")
                                            .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                            .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                            .setTimestamp();
                                        await logChannelProrection.send({
                                            embeds: [LogEmbed]
                                        })
                                    }
                                } else {
                                    await connection
                                        .query(`UPDATE protection SET addremroles=addremroles-${actions} WHERE id = ${member.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                        })
                                    return
                                }
                            }
                            removeAction()
                        }
                    } else {//----------------------------------------------------role member remove
                        const fetchedLogs = await oldMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberRoleUpdate
                        });
                        const RoleDeleteLog = fetchedLogs.entries.first();
                        const {executor, target, changes} = RoleDeleteLog;
                        const actionType = RoleDeleteLog.actionType;
                        const member = await oldMember.guild.members.fetch(executor.id);
                        const highestUserRolePosition = member.roles.highest.position;
                        const roles = changes[0].new //{ name: 'name', id: 'id' },
                        let rolesList = []
                        let role
                        await connection
                            .query(`SELECT ghost FROM money WHERE id = ${member.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        .then((result) => sqlResult = result)
                        .catch((err) => {})
                        if (sqlResult[0] === undefined) {
                            await connection
                            .query(`INSERT INTO protection (id) VALUES (${member.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        } else {
                            ghost = sqlResult[0].ghost;
                        }
                        for (let i = 0; i < changes[0].new.length; i++){
                            role = await oldMember.guild.roles.fetch(changes[0].new[i].id)
                            if (role.position > rolepos) {
                                actions++
                            }
                        }
                        if (actions == 0) {
                            return
                        }
                        if (member.id != '432199748699684864' && member.id != '455817057565540365' && member.id != '690913765524504627' && member.id != '415439061914877962' && member.id != '1094303596188798988' && member.id != '292352708462247936' && highestBotRolePosition > highestUserRolePosition) {
                            await connection
                            .query(`SELECT addremroles FROM protection WHERE id = ${member.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            .then((result) => sqlResult = result)
                            .catch((err) => {
                                console.log(`SQL: Error ${err}`)
                            })
                            if (sqlResult[0] === undefined) {
                                await connection
                                .query(`INSERT INTO protection (id) VALUES (${member.id});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            } else {
                                actions1 = sqlResult[0].addremroles;
                            }
                            actions1 = actions + actions1
                            await connection
                                .query(`UPDATE protection SET addremroles=addremroles+${actions} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            if (actions1 > 7) {
                                warn(member);
                                if (member.user.bot) {
                                    for (var [key, value] of member.roles.cache) {
                                        let list = member.roles.cache;
                                        if (value.tags.botId != undefined) {
                                            list.delete(key)
                                            value.setPermissions()
                                        }
                                    }
                                    member.roles.remove(list, "guild crash attempt")
                                    const LogEmbed = new EmbedBuilder()
                                        .setTitle("**CRASH ATTEMPT**")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${channel} (${channel.id})\n [4] All roles removed`)
                                        .setColor("#ff0000");
                                    await logChannelProrection.send({
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
                                        .setColor("#ff0000")
                                        .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                        .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                        .setTimestamp();
                                    await logChannelProrection.send({
                                        embeds: [LogEmbed]
                                    })
                                    return
                                }
                            }
                            async function removeAction () {
                                await wait(120000);
                                if (actions1 > 7) {
                                    warn(member);
                                    if (member.user.bot) {
                                        for (var [key, value] of member.roles.cache) {
                                            let list = member.roles.cache;
                                            if (value.tags.botId != undefined) {
                                                list.delete(key)
                                                value.setPermissions()
                                            }
                                        }
                                        member.roles.remove(list, "guild crash attempt")
                                        const LogEmbed = new EmbedBuilder()
                                            .setTitle("**CRASH ATTEMPT**")
                                            .setDescription(`[1] ${member}(${member.id})\n[2] Role update\n[3] ${channel} (${channel.id})\n [4] All roles removed`)
                                            .setColor("#ff0000");
                                        await logChannelProrection.send({
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
                                            .setColor("#ff0000")
                                            .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n [3] All roles removed`)
                                            .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                            .setTimestamp();
                                        await logChannelProrection.send({
                                            embeds: [LogEmbed]
                                        })
                                    }
                                } else {
                                    await connection
                                        .query(`UPDATE protection SET addremroles=addremroles-${actions} WHERE id = ${member.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                        })
                                    return
                                }
                            }
                            removeAction()
                        }
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Protection member update ${err}`))
            }
	    },
};
