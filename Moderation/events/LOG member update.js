const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.GuildMemberUpdate,
	once: false,
	    async execute(oldMember, newMember, connection) {
            const { default: chalk } = await import('chalk')
            if (!config.logs) {
                return
            }
            const bot = await oldMember.guild.members.fetch(config.client_id);
            const highestBotRolePosition = bot.roles.highest.position;
            let sqlResult;
            let ghost = 0;
            try {
                if (oldMember.roles.cache.size !== newMember.roles.cache.size) { // Roles change
                    const logChannelRoles = await oldMember.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    if (oldMember.roles.cache.size < newMember.roles.cache.size) { //role member add
                        const fetchedLogs = await oldMember.guild.fetchAuditLogs({
                            limit: 1,
                            type: AuditLogEvent.MemberRoleUpdate
                        });
                        const RoleDeleteLog = fetchedLogs.entries.first();
                        const {executor, target, changes} = RoleDeleteLog;
                        const actionType = RoleDeleteLog.actionType;
                        const member = await oldMember.guild.members.fetch(executor.id);
                        const roles = changes[0].new //{ name: 'name', id: 'id' },
                        let rolesList = []
                        let role
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
                            .query(`INSERT INTO money (id) VALUES (${member.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        } else {
                            ghost = sqlResult[0].ghost;
                        }
                        if (ghost == 1) {
                            return
                        }
                        if (newMember.roles.cache.size-oldMember.roles.cache.size == 1) {
                            role = await oldMember.guild.roles.fetch(roles[0].id)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n[3] ${oldMember}(${oldMember.id})\n[4] ${role}(${role.id})`)
                                .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                        } else {
                            for (var [key, value] of newMember.roles.cache) {
                                if (!oldMember.roles.cache.has(key)) {
                                    rolesList.push(`<@&${key}>`)
                                }
                            }
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member role add\n[3] ${oldMember}(${oldMember.id})\n[4] ${rolesList}`)
                                .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                        }
                        if (!member.permissions.has('Administrator') && !member.permissions.has('ManageRoles')) {
                            return
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
                            .query(`INSERT INTO money (id) VALUES (${member.id});`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        } else {
                            ghost = sqlResult[0].ghost;
                        }
                        if (ghost == 1) {
                            return
                        }
                        if (oldMember.roles.cache.size-newMember.roles.cache.size == 1) {
                            role = await oldMember.guild.roles.fetch(roles[0].id)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role remove**")
                                .setColor("#ff0000")
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member role remove\n [3] ${oldMember}(${oldMember.id})\n[4] ${role}(${role.id})`)
                                .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                        } else {
                            for (var [key, value] of oldMember.roles.cache) {
                                if (!newMember.roles.cache.has(key)) {
                                    rolesList.push(`<@&${key}>`)
                                }
                            }
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role remove**")
                                .setColor("#ff0000")
                                .setDescription(`[1] ${member}(${member.id})\n[2] Member role remove\n [3] ${oldMember}(${oldMember.id})\n[4] ${rolesList}`)
                                .setFooter({text: `${member.id} • ${oldMember.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
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
                console.log(chalk.hex('#ff0000')(`[${time}] Event: Log member update ${err}`))
            }
	    },
};
