const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	/*name: Events.MessageCreate,
	once: false,
	    async execute(message, connection) {
            //const logChannel = await message.guild.channels.fetch(config.tempLogs);
            //const author = message.author
            if (author.id != '43219974869968486' && author.id != '455817057565540365' && author.id != '690913765524504627' && author.id != '415439061914877962') {
                let params = message.content.split(" ");
                for (let i = 0; i<params.length; i++) {
                    if (params[i].includes("https://discord.gg/")) {
                        let inviteCode = params[i].replace("https://discord.gg/", "");
                        try {
                            let invite = message.guild.invites.fetch(`${inviteCode}`)
                            .then(console.log)
                            .catch(console.error)
                        } catch {
                            author.ban({ deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'Other link' })
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Other link**")
                                .setDescription(`[1] ${user}(${user.id})\n[2] Other link\n[3] ${message.content}\n [4] Member banned`)
                                .setColor("#ff0000");
                            await logChannel.send({
                                embeds: [LogEmbed]
                            })
                        }
                    }
                }
            }
	    },*/
};
    