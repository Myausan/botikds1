const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	    async execute(memberJoined, connection, client, DB) {
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
            if (memberJoined.user?.bot || memberJoined.bot) {
                const fetchedLogs = await memberJoined.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.BotAdd
                });
                const RoleDeleteLog = fetchedLogs.entries.first();
                const {executor, target, changes} = RoleDeleteLog;
                const actionType = RoleDeleteLog.actionType;
                let sqlResult;
                let blacklisted = 0;
                try {
                    const member = await memberJoined.guild.members.fetch(executor.id)
                    const logChannel = await memberJoined.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`)
                    const bot = await memberJoined.guild.members.fetch(config.client_id);
                    const highestBotRolePosition = bot.roles.highest.position;
                    const highestUserRolePosition = member.roles.highest.position;
                    if (member.id != '432199748699684864') {
                        DB.blacklistedUsers.push(member.id)
                        warn(member);
                        memberJoined.ban({reason: 'Bot added'})
                        if (highestBotRolePosition < highestUserRolePosition) {
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
                        }
                        DB.blacklistedUsers.push(member.id)
                        await connection
                            .query(`INSERT INTO protection (id, block) VALUES (${member.id}, 1) ON DUPLICATE KEY UPDATE block=1;`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**CRASH ATTEMPT**")
                            .setDescription(`[1] ${member}(${member.id})\n[2] Bot added\n[3] ${memberJoined} (${memberJoined.id})\n [4] All roles removed`)
                            .setColor("#ff0000")
                            .setFooter({text: `${member.id} • ${member.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [LogEmbed]
                        })
                        return
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
                    console.log(chalk.hex('#ff0000')(`[${time}] Event: Protection bot add ${err}`))
                }
            }
	    },
};