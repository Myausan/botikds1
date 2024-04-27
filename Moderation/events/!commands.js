const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.MessageCreate,
	once: false,
    async execute(message, connection, client, lockedCommands) {
        /*const { default: chalk } = await import('chalk')
        const author = message.author
        let content = message.content;
        if (!author.bot) {
            if (message.guildId == null) {
                console.log(`${author.username}(${author.id}): ${content}`)
                return
            }
            let params = content.split(" ");
            const command = params[0]
            try {
                if (command == '!award') {
                    const logChannel = await message.channel.guild.channels.cache.find(channel1 => channel1.name === `${config.logAward}`)
                    const emoji = config.emoji
                    const money = params[1]
                    let members = message.mentions.users
                    await connection
                        .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle("award")
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                                message.channel.send({
                                embeds: [lockEmbed],
                            }) 
                            return
                        })
                    if (parseInt(money) != money) {
                        const lockEmbed = new EmbedBuilder()
                            .setTitle("award")
                            .setDescription(`${author}, неправильный синтаксис команды, пример использования !award 50 <@${config.client_id}>`)
                            .setColor(config.colorError);
                        message.channel.send({
                            embeds: [lockEmbed],
                        }) 
                        return
                    }
                    if (parseInt(money) > 300) {
                        const lockEmbed = new EmbedBuilder()
                            .setTitle("award")
                            .setDescription(`${author}, вы не можете столько выдать`)
                            .setColor(config.colorError);
                        message.channel.send({
                            embeds: [lockEmbed],
                        }) 
                    }
                    let msg;
                    let mems = Array.from(members.values())
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ButtonAwardYes')
                                .setEmoji('<:yes:1096940673653022771>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('ButtonAwardNo')
                                .setEmoji('<:no:1096940683979407490>')
                                .setStyle(2),
                        )
                    const Embed = new EmbedBuilder()
                        .setTitle("award")
                        .setDescription(`${author}, хочет выдать ${money} ${config.emoji}
Пользователям:
${mems}`)
                        .setColor(config.colorError);
                    await message.channel.send({
                        embeds: [Embed],
                        components: [row],
                        fetchReply: true
                    }) 
                    .then((mes) => {
                        msg = mes
                    })
                    for (let i = 0; i < mems.length; i++) {
                        await connection
                            .query(`INSERT INTO awards (message, member, money) VALUES (${msg.id}, ${mems[i].id}, ${money});`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .catch((err) => {
                            
                        })
                    }
                }
                if (command == '!award1') {
                    const logChannel = await message.channel.guild.channels.cache.find(channel1 => channel1.name === `${config.logAward}`)
                    const emoji = config.emoji
                    let sqlResult
                    let balance
                    let ghost
                    if (author.id !== '690913765524504627' && author.id !== '432199748699684864') {
                        const lockEmbed = new EmbedBuilder()
                            .setTitle("Выдача валюты")
                            .setDescription(`${author}, вы не можете этого делать`)
                            .setColor(config.colorError);
                        message.channel.send({
                            embeds: [lockEmbed],
                        })
                        return
                    }
                    const money = params[1]
                    let members = message.mentions.users
                    await connection
                        .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle("Выдача валюты")
                                .setDescription(`${author}, Команда временно заблокирована`)
                                .setColor(config.colorError);
                                message.channel.send({
                                embeds: [lockEmbed],
                            }) 
                            return
                        })
                    if (parseInt(money) != money) {
                        const lockEmbed = new EmbedBuilder()
                            .setTitle("Выдача валюты")
                            .setDescription(`${author}, неправильный синтаксис команды, пример использования !award1 50 <@${config.client_id}>`)
                            .setColor(config.colorError);
                        message.channel.send({
                            embeds: [lockEmbed],
                        }) 
                        return
                    }
                    let msg;
                    let mems = Array.from(members.values())
                    for (let i = 0; i < mems.length; i++) {
                        await connection
                            .query(`SELECT money, ghost FROM money WHERE id = ${mems[i].id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => sqlResult = result)
                            .catch((err) => {
                                console.log(`SQL: Error ${err}`)
                                const lockEmbed = new EmbedBuilder()
                                    .setTitle("Выдача валюты")
                                    .setDescription(`${author}, Команда временно заблокирована`)
                                    .setColor(config.colorError);
                                message.channel.send({
                                    embeds: [lockEmbed],
                                    ephemeral: true
                                }) 
                                return
                            })
                        if (sqlResult[0] === undefined) {
                            await connection
                                .query(`INSERT INTO money (id, money) VALUES (${mems[i].id}, ${money};`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            balance = sqlResult[0].money;
                            ghost = sqlResult[0].ghost;
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${mems[i].id};`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const embed = new EmbedBuilder()
                                .setTitle("Выдача валюты")
                                .setDescription(`Администратор ${author} выдал пользоватею ${mems[i]} ${money}${emoji}`)
                                .setColor(config.color);
                            message.channel.send({
                                embeds: [embed],
                            }) 
                            if (!ghost) {
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("AWARD")
                                    .setDescription(`[1] ${author} (${author.id})
[2] ${mems[i]} ${mems[i].id}
[3] ${money} ${emoji}
[4] ${balance} ${emoji}
[5] ${balance+money} ${emoji}`)
                                    .setColor('#ff0000');
                                logChannel.send({
                                    embeds: [logEmbed],
                                })
                            }
                        }
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Выдача валюты")
                        .setDescription(`Всем выдано ${money}${emoji}!`)
                        .setColor(config.color);
                    message.channel.send({
                        embeds: [embed],
                    }) 
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
                console.log(chalk.hex('#ff0000')(`[${time}] ${command}: ${err}`))
            }
        }*/
    },
};