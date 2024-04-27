const { Events, EmbedBuilder, AuditLogEvent, PermissionFlagsBits } = require('discord.js');
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
            let sqlResult;
            let block = 0;
            let list = []
            try {
                if (oldMember.roles.cache.size !== newMember.roles.cache.size) { // Roles change
                    const logChannelRoles = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    const logChannelProrection = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`);
                    if (oldMember.roles.cache.size < newMember.roles.cache.size) { //role member add
                        if (newMember.permissions.has(PermissionFlagsBits.Administrator || PermissionFlagsBits.BanMembers || PermissionFlagsBits.DeafenMembers || PermissionFlagsBits.KickMembers || PermissionFlagsBits.ManageChannels || PermissionFlagsBits.ManageGuild || PermissionFlagsBits.ManageNicknames || PermissionFlagsBits.ManageRoles || PermissionFlagsBits.ModerateMembers || PermissionFlagsBits.MoveMembers || PermissionFlagsBits.MuteMembers || PermissionFlagsBits.ViewAuditLog))
                        await connection
                            .query(`SELECT block FROM protection WHERE id = ${newMember.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                        if (block == 0) {
                            return
                        }
                        for (var [key, value] of newMember.roles.cache) {
                            if (!oldMember.roles.cache.has(key)) {
                                newMember.roles.remove(key, 'User blacklisted')
                                roles.push(value)
                            }
                        }
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("**Member role remove**")
                            .setColor("#ff0000")
                            .setDescription(`[1] ${newMember}(${newMember.id})\n[2] Member role remove\n [3] ${newMember}(${newMember.id})\n[4] ${role}(${role.id})\n [5] User blacklisted`)
                            .setFooter({text: `${newMember.id} • ${newMember.guild.name}`})
                            .setTimestamp();
                        await logChannelRoles.send({
                            embeds: [LogEmbed]
                        })
                        const LogEmbed1 = new EmbedBuilder()
                            .setTitle("**USER BLACKLISTED**")
                            .setDescription(`[1] ${newMember}(${newMember.id})\n[2] User blacklited\n[3] Roles removed\n [4] ${list}`)
                            .setColor("#ff0000")
                            .setFooter({text: `${newMember.id} • ${newMember.guild.name}`})
                            .setTimestamp();
                        await logChannelProrection.send({
                            embeds: [LogEmbed1]
                        })
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Protection check blacklist ${err}`))
            }
	    },
};
