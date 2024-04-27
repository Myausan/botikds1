const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberUpdate,
	once: false,
	    async execute(oldMember, newMember, connection, client, DB) {
            if (!config.protection) {
                return
            }
            if (newMember.guild.id != config.guild_id) {
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
                        if (!member.permissions.has('Administrator') && !member.permissions.has('ManageRoles')) {
                            return
                        }
                        if (highestBotRolePosition <= highestUserRolePosition || DB.whitelistedUsers.bypass.includes(member.id) || DB.whitelistedUsers.addremRoles.includes(member.id)) {
                            for (let i = 0; i < changes[0].new.length; i++){
                                role = await oldMember.guild.roles.fetch(changes[0].new[i].id)
                                if (role.position > rolepos) {
                                    actions++
                                }
                            }
                            if (actions == 0) {
                                return
                            }
                            if (!DB.actions[member.id]) {
                                DB.actions[member.id] = {
                                    addremRoles: 0
                                }
                            }
                            if (DB.actions[member.id]["addremRoles"]) {
                                DB.actions[member.id]["addremRoles"] += actions;
                            } else {
                                DB.actions[member.id]["addremRoles"] = actions;
                            }
                            if (DB.actions[member.id]["addremRoles"] > 10) {
                                DB.blacklistedUsers.push(member.id)
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
                            await wait(600000);
                            DB.actions[member.id]["addremRoles"] -= actions;
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
                        if (!member.permissions.has('Administrator') && !member.permissions.has('ManageRoles')) {
                            return
                        }
                        if (!(highestBotRolePosition < highestUserRolePosition || DB.whitelistedUsers.bypass.includes(member.id) || DB.whitelistedUsers.addremRoles.includes(member.id))) {
                            for (let i = 0; i < changes[0].new.length; i++){
                                role = await oldMember.guild.roles.fetch(changes[0].new[i].id)
                                if (role.position > rolepos) {
                                    actions++
                                }
                            }
                            if (actions == 0) {
                                return
                            }
                            if (!DB.actions[member.id]) {
                                DB.actions[member.id] = {
                                    addremRoles: 0
                                }
                            }
                            if (DB.actions[member.id]["addremRoles"]) {
                                DB.actions[member.id]["addremRoles"] += 1;
                            } else {
                                DB.actions[member.id]["addremRoles"] = 1;
                            }
                            if (DB.actions[member.id]["addremRoles"] > 10) {
                                DB.blacklistedUsers.push(member.id)
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
                            await wait(600000);
                            DB.actions[member.id]["addremRoles"] += actions;
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
