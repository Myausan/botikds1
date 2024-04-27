const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildBanAdd,
	once: false,
	    async execute(memberBanned, connection, client,  DB) {
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
                console.log(`[${time}]Protection: Guild crash attempt (${member.user.tag})`)
            }
            const { default: chalk } = await import('chalk')
            const fetchedLogs = await memberBanned.guild.fetchAuditLogs({
                limit: 1,
                type: AuditLogEvent.MemberBanAdd
            });
            const RoleDeleteLog = fetchedLogs.entries.first();
            const {executor, target, changes} = RoleDeleteLog;
            const actionType = RoleDeleteLog.actionType;
            let sqlResult;
            let bans = 0;
            try {
                const member =  await memberBanned.guild.members.fetch(executor.id)
                const logChannel = await memberBanned.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`)
                const bot = await memberBanned.guild.members.fetch(config.client_id);
                const highestBotRolePosition = bot.roles.highest.position;
                const highestUserRolePosition = member.roles.highest.position;
                if (!(highestBotRolePosition < highestUserRolePosition || DB.whitelistedUsers.bypass.includes(member.id) || DB.whitelistedUsers.bans.includes(member.id))) {
                    if (!DB.actions[member.id]) {
                        DB.actions[member.id] = {
                            bans: 0
                        }
                    }
                    if (DB.actions[member.id]["bans"]) {
                        DB.actions[member.id]["bans"] += 1;
                    } else {
                        DB.actions[member.id]["bans"] = 1;
                    }
                    if (DB.actions[member.id]["bans"] > 4) {
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
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member banned\n[3] ${memberBanned} (${memberBanned.id})\n [4] All roles removed`)
                                .setColor("#ff0000")
                                .setFooter({text: `${member.id} • ${member.guild.name}`})
                                .setTimestamp();
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
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member banned\n[3] ${memberBanned} (${memberBanned.id})\n [4] All roles removed`)
                                .setColor("#ff0000")
                                .setFooter({text: `${member.id} • ${member.guild.name}`})
                                .setTimestamp();
                            await logChannel.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                    }
                    await wait(600000)
                    DB.actions[member.id]["bans"] -= 1;
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
                console.log(`[${time}] Event: Protection member banned ${err}`)
            }
	},
};
