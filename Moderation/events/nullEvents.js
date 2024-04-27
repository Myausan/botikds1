const { Events, AuditLogEvent } = require("discord.js");
module.exports = async (client) => { 
    /*client.on(Events.GuildDelete, async role => {
        const fetchlogs = await role.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.RoleDelete
        })
        const RoleDeleteLog = fetchlogs.entries.first();
        console.log(RoleDeleteLog);
    })
    client.on(Events.MessageDelete, async msg => {
        console.log(msg.content);
    })*/
};