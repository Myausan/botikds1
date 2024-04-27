const { Events, EmbedBuilder, AuditLogEvent, Colors } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction, connection) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member
        try {
            if (interaction.isButton()) {
                if (interaction.customId === 'buttonEventClose' || interaction.customId === 'buttonCloseClose' ) {
                    await wait(3000)
                    if (interaction.channel) {
                        await connection
                            .query(`UPDATE protection SET event = 0 WHERE id = ${author.id}`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        let parent = interaction.channel.parent
                        for (var [key, value] of parent.children.cache) {
                            await value.delete()
                        }
                        await parent.delete()
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
            console.log(chalk.hex('#ff0000')(`[${time}] Event: interation create ${err}`))
        }
    },
};