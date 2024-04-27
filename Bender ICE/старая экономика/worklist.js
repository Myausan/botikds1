const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const money = require('./money');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('worklist')
		.setDescription('посмотреть список работ'),
    async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logWorkTimely}`)
        let money = 0;
		let balance = 0;
        let jailtime = 0;
        let baneconomy = 0;
        let workCooldown = 0;
        let ghost = 0;
        let answer = 0;
        let work
        let workName
        let bypass
        let sqlResult;
        let message
        let now = Date.now()
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Выйти на работу")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            await connection
                .query(`SELECT money, bank, jailtime, baneconomy, work, bypass1, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setDescription(`${author}, Команда временно заблокирована`)
                        .setColor(config.colorError);
                    interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                })
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                balance = sqlResult[0].money;
                jailtime = sqlResult[0].jailtime
                baneconomy = sqlResult[0].baneconomy;
                workCooldown = sqlResult[0].work
                bypass = sqlResult[0].bypass1;
                ghost = sqlResult[0].ghost
            }

            if (baneconomy == 1) {
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
                console.log(chalk.hex('#ff0000')(`[${time}] Command ${interaction.commandName}: User ${author.displayName} blacklisted`))
                const banEmbed = new EmbedBuilder()
                    .setTitle("Выйти на работу")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (jailtime > now) {
                let formatTime = (time) => {
                    let m = Math.floor(time/1000/60%60);
                    let h = Math.floor(time/1000/60/60%24);
                    let d = Math.floor(time/1000/60/60/24);
                    let result = '';
                    if ((d % 10 == 1) && d != 11) {
                        result += `${d} день `
                    } else {
                        if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
                            result += `${d} дня `
                        } else {
                            result += `${d} дней `
                        }
                    }
                    if ((h % 10 == 1) && h != 11) {
                        result += `${h} час `
                    } else {
                        if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
                            result += `${h} часа `
                        } else {
                            result += `${h} часов `
                        }
                    }
                    if ((m % 10 == 1) && m != 11) {
                        result += `${m} минута`
                    } else {
                        if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
                            result += `${m} минуты`
                        } else {
                            result += `${m} минут`
                        }
                    }
                    return result
                }
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Игра: Выйти на работу")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('work1')
                        .setEmoji(config.emojis.mine)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('work2')
                        .setEmoji(config.emojis.designer)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('work3')
                        .setEmoji(config.emojis.owner)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('work4')
                        .setEmoji(config.emojis.proger)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('work5')
                        .setEmoji(config.emojis.porn)
                        .setStyle(2),
                )

            let work1 = 'Майнкрафтер';
            let work2 = 'Дизайнер';
            let work3 = 'Овнер';
            let work4 = 'Кодер';
            let work5 = 'Порноактриса';
            const Embed = new EmbedBuilder()
                .setTitle("Выйти на работу")
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`[1] ${work1} 10 - 25 ${emoji} (каждые 60 минут)\n[2] ${work2} 20 - 40 ${emoji} (каждые 120 минут)\n[3] ${work3} 30 - 50 ${emoji} (каждые 240 минут)\n[4] ${work4} 40 - 80 ${emoji} (каждые 360 минут)\n[5] ${work5} 50 - 150 ${emoji} (каждые 720 минут)`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then ((send) => {
				message = send
			})
            const filter = ButtonInteraction => ButtonInteraction.customId === 'work1' || ButtonInteraction.customId === 'work2' || ButtonInteraction.customId === 'work3'|| ButtonInteraction.customId === 'work4' || ButtonInteraction.customId === 'work5';

            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async ButtonInteraction => {
                let buttonId = ButtonInteraction.customId;
				if (ButtonInteraction.user.id != author.id) {
					const errorEmbed = new EmbedBuilder()
						.setDescription(`${ButtonInteraction.user}, вы не можете этого делать`)
						.setColor(config.colorError);
					await ButtonInteraction.reply({
						embeds: [errorEmbed],
						ephemeral: true
					})
                    return
                }
                await ButtonInteraction.deferUpdate()
                work = ButtonInteraction.customId
                let currentTimestamp = Date.now();
                await connection
                .query(`SELECT money, bank, jailtime, baneconomy, work, bypass1, ghost FROM money WHERE id = ${ButtonInteraction.user.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                balance = sqlResult[0].money;
                jailtime = sqlResult[0].jailtime
                baneconomy = sqlResult[0].baneconomy;
                workCooldown = sqlResult[0].work
                bypass = sqlResult[0].bypass1;
                ghost = sqlResult[0].ghost
                answer++
                if (jailtime > now) {
                    let formatTime = (time) => {
                        let m = Math.floor(time/1000/60%60);
                        let h = Math.floor(time/1000/60/60%24);
                        let d = Math.floor(time/1000/60/60/24);
                        let result = '';
                        if ((d % 10 == 1) && d != 11) {
                            result += `${d} день `
                        } else {
                            if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
                                result += `${d} дня `
                            } else {
                                result += `${d} дней `
                            }
                        }
                        if ((h % 10 == 1) && h != 11) {
                            result += `${h} час `
                        } else {
                            if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
                                result += `${h} часа `
                            } else {
                                result += `${h} часов `
                            }
                        }
                        if ((m % 10 == 1) && m != 11) {
                            result += `${m} минута`
                        } else {
                            if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
                                result += `${m} минуты`
                            } else {
                                result += `${m} минут`
                            }
                        }
                        return result
                    }
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Игра: Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                    await interaction.editReply({
                        embeds: [errorEmbed],
                    }) 
                    return
                }
                if (work == 'work1') {
                    workName = work1
                }
                if (work == 'work2') {
                    workName = work2
                }
                if (work == 'work3') {
                    workName = work3
                }
                if (work == 'work4') {
                    workName = work4
                }
                if (work == 'work5') {
                    workName = work5
                }
                if ((workCooldown > currentTimestamp) && bypass == 0) {
                    let time = workCooldown - currentTimestamp
                    let sec = Math.floor(time/1000%60);
                    let min = Math.floor(time/1000/60%60);
                    let hours = Math.floor(time/1000/60/60%24);
                    let result = `${hours}h ${min}m ${sec}s`;
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы сможете выйти на работу ${workName} через ${result}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    return
                }
                if (work == 'work1') {
                    money = Math.floor(Math.random() * (25 - 10) + 10);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы вышли на работу ${work1} и заработали ${money}${emoji}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET money = money+${money}, work = ${Date.now()+60*60*1000} WHERE id = ${author.id};`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Work")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Работа: ${work1}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                        .setColor('#ff0000')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
                if (work == 'work2') {
                    money = Math.floor(Math.random() * (40 - 20) + 20);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы вышли на работу ${work2}${emoji} и заработали ${money}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET money = money+${money}, work = ${Date.now()+2*60*60*1000} WHERE id = ${author.id};`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Work")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Работа: ${work2}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                        .setColor('#ff0000')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
                if (work == 'work3') {//150
                    money = Math.floor(Math.random() * (50 - 30) + 30);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы вышли на работу ${work3} и заработали ${money}${emoji}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET money = money+${money}, work = ${Date.now()+4*60*60*1000} WHERE id = ${author.id};`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Work")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Работа: ${work3}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                        .setColor('#ff0000')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
                if (work == 'work4') { // 125
                    money = Math.floor(Math.random() * (80 - 40) + 40);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы вышли на работу ${work4} и заработали ${money}${emoji}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET money = money+${money}, work = ${Date.now()+6*60*60*1000} WHERE id = ${author.id};`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Work")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Работа: ${work4}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                        .setColor('#ff0000')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
                if (work == 'work5') { // 100
                    money = Math.floor(Math.random() * (150 - 50) + 50);
                    const cooldownEmbed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы вышли на работу ${work5} и заработали ${money}${emoji}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                        .setColor(config.color)
                    interaction.editReply({
                        embeds: [cooldownEmbed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET money = money+${money}, work = ${Date.now()+12*60*60*1000} WHERE id = ${author.id};`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Work")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Работа: ${work5}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                        .setColor('#00ff00')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
            })
            collector.on('end', async () => {
                if (answer == 0) {
                    for (let i = 0; i<row.components.length;i++) {
                        row.components[i].setDisabled(true)
                    }
                    const Embed = new EmbedBuilder()
                        .setTitle("Выйти на работу")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`[1] ${work1} 10 - 25 ${emoji} (каждые 60 минут)\n[2] ${work2} 20 - 40 ${emoji} (каждые 120 минут)\n[3] ${work3} 30 - 50 ${emoji} (каждые 240 минут)\n[4] ${work4} 40 - 80 ${emoji} (каждые 360 минут)\n[5] ${work5} 50 - 150 ${emoji} (каждые 720 минут)`)
                        .setColor(config.color);
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [row]
                    })
                }
            })
        } catch(err) {
            if (err.code != 10062) {
				lockedCommands.push(interaction.commandName)
			}
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
            console.log(chalk.hex('#ff0000')(`[${time}] Command ${interaction.commandName}: Error ${err}`))
            try {
                await interaction.reply({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
            } catch(err) {
                await interaction.editReply({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
            }
        }
	}
};