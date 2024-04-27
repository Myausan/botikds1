const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('steal')
		.setDescription('украсть валюту')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
        async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const member = interaction.options.getUser('member');
        const emoji = config.emoji;
        let stealCooldown = 0;
        let currentTimestamp = Date.now();
        let money;
		let a_balance = 0;
        let m_balance = 0;
        let a_jailtime = 0;
        let m_jailtime = 0;
        let a_bypass = 0;
        let m_bypass = 0;
        let ratio = 0;
        let price = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let ghost = 0;
        let sqlResult;
        let message;
        let answer = 0;
        let now = Date.now()
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Кража валюты")
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
                .query(`SELECT money, jailtime, baneconomy, steal, ghost, bypass FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Кража валюты")
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
                a_balance = sqlResult[0].money;
                a_jailtime = sqlResult[0].jailtime
                a_baneconomy = sqlResult[0].baneconomy
                stealCooldown = sqlResult[0].steal
                ghost = sqlResult[0].ghost
                a_bypass = sqlResult[0].bypass
            }
            await connection
                .query(`SELECT money, baneconomy, bypass FROM money WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                    .query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                m_balance = sqlResult[0].money;
                m_jailtime = sqlResult[0].jailtime;
                m_baneconomy = sqlResult[0].baneconomy;
                m_bypass = sqlResult[0].bypass;
            }

            if (a_baneconomy == 1) {
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
                    .setTitle("Кража")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            let formatTime = (time) => {
                let m = Math.floor(time/1000/60%60);
                let h = Math.floor(time/1000/60/60%24);
                let result = '';
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
            if (a_jailtime > now) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Кража")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(a_jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            if (m_baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Кража")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете украсть у ${member}`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            let steal = Date.now()+1000*60*60*12;
            let jail = Date.now()+1000*60*60*2;
            if ((stealCooldown > currentTimestamp) && (a_bypass !== 1)) {
                let time = stealCooldown - currentTimestamp
                let result = formatTime(time);
                const cooldownEmbed = new EmbedBuilder()
                    .setTitle("Кража")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, использовать steal можно раз в 12 часов\n\n\\Вы cможете использовать ещё раз через ${result}`)
                    .setColor(config.colorError)
                interaction.reply({
                    embeds: [cooldownEmbed]
                })
                return
            }
            const rowAgree = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonStealYes')
                        .setEmoji(config.emojis.yes)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonStealNo')
                        .setEmoji(config.emojis.no)
                        .setStyle(2),
                )

            if (m_balance < 50) {
                await connection
                    .query(`UPDATE money SET steal = ${steal} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const stealEmbed = new EmbedBuilder()
                    .setTitle("Кража")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, у ${member} ничего не нашлось`)
                    .setColor(config.color)
                interaction.reply({
                    embeds: [stealEmbed]
                })
                return
            }
            ratio = Math.floor(Math.random() * 3)
            if ((ratio == 0 || a_bypass == 1) && m_bypass !=1 ) {
                money = Math.round(m_balance*0.1);
                const embed = new EmbedBuilder()
                    .setTitle("Кража - удачно")
                    .setColor(config.color)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Ловкость рук и никакого мошенничества, ${author}! И вот в твоих руках заветная сумма денег - ${money} ${emoji} , не забудь перевести их в электрокристаллы, иначе ты можешь повторить судьбу несчастного - ${member} и потерять намного больше чем получил.`);
                await interaction.reply({
                    embeds: [embed]
                });
                await connection
                    .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                await connection
                    .query(`UPDATE money SET money = money+${money}, steal = ${steal} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Steal")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Steal\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance+money}${emoji}\n[5] Сколько: ${money}${emoji}\n[6] Пользователь: ${member}\n[7] Старый баланс: ${m_balance}${emoji}\n[8] Новый баланс: ${m_balance-money}${emoji}`)
                    .setColor('#00ff00')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
            } else {
                if (a_balance < 250) {
                    const Embed = new EmbedBuilder()
                        .setTitle('Кража - неудачно')
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`Полицейский: -Мы знаем что вы сделали или пытались сделать, пройдемте со мной. *и вот вы уже в наручниках едете в тюрьму - отбывать свой срок в* ***2 часа***`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [Embed],
                        components: []
                    })
                    await connection
                        .query(`UPDATE money SET jailtime = ${jail}, steal = ${steal} WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed1 = new EmbedBuilder()
                        .setTitle("Steal(jail)")
                        .setDescription(`[1] ${author}(${author.id})\n[2] Jail\n[3] Посажен до: ${jail}`)
                        .setColor('#ff0000')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed1]
                    })
                    return
                }
                ratio = Math.floor(Math.random() * 10)
                await connection
                    .query(`UPDATE money SET steal = ${steal} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const embed = new EmbedBuilder()
                    .setTitle("Кража - неудачно")
                    .setColor(config.color)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`*прозвучали сирены и вы от испуга быть замеченным постарались смешаться с толпой, но тут вас за руку схватил незнакомец…* 

-Знаешь, ${author}, тут стоят камеры и ты на них точно попал, но я знаю как можно стереть данные за сегодняшний день, интересует? Конечно я помогаю не бесплатно, так что с тебя - 250 ${emoji}`);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowAgree],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonStealYes' || ButtonInteraction.customId === 'buttonStealNo';

                const collector = message.createMessageComponentCollector({filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    if (ButtonInteraction.user.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('Кража')
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                            .setColor(config.colorError);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    answer++
                    buttonId = ButtonInteraction.customId
                    if (buttonId == 'buttonStealYes') {
                        if (ratio == 0) {
                            const Embed = new EmbedBuilder()
                                .setTitle('Незнакомец не помог')
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`Незнакомец: -Прости, но мне не удалось договориться с владельцем записи, он отказывается ее удалять.
${author}: -А как же деньги? Я же заплатил тебе! Верни по хорошему!
*незнакомец отказывается отдавать деньги и ты замахиваешься чтобы выбить из него всю дурь, как вдруг твою руку перехватывает полицейский…*
Полицейский: -Пройдемте со мной, у нас есть записи с камер где вы в открытую воруете!
*на вас надевают наручники и под крики с вашей стороны вас увозят в тюрьму, где вы и проведете ближайшие* ***2 часа***`)
                                .setColor(config.color);
                            await ButtonInteraction.update({
                                embeds: [Embed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE money SET money = money-250, jailtime = ${jail} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Steal")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Steal(fine)\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance-250}${emoji}\n[5] Сколько: ${250}${emoji}\n[6] Пользователь: ${member}\n[7] Старый баланс: ${m_balance}${emoji}\n[8] Новый баланс: ${m_balance}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            const logEmbed1 = new EmbedBuilder()
                                .setTitle("Steal(jail)")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Jail\n[3] Посажен до: ${jail}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed, logEmbed1]
                            })
                            return
                        } else {
                            const Embed = new EmbedBuilder()
                                .setTitle('Незнакомец помог')
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`Незнакомец: -Вот диск, владелец был не против что я заберу эту запись, будь внимательнее, ${author}.
*незнакомец быстро ушел, вы даже не успели поблагодарить его*`)
                                .setColor(config.color);
                            await ButtonInteraction.update({
                                embeds: [Embed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE money SET money = money-250 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Steal")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Steal(fine)\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance-250}${emoji}\n[5] Сколько: ${250}${emoji}\n[6] Пользователь: ${member}\n[7] Старый баланс: ${m_balance}${emoji}\n[8] Новый баланс: ${m_balance}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            const logEmbed1 = new EmbedBuilder()
                                .setTitle("Steal(jail)")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Jail\n[3] Посажен до: ${jail}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed, logEmbed1]
                            })
                            return
                        }
                    } else {
                        if (ratio == 0) {
                            const Embed = new EmbedBuilder()
                                .setTitle('Ложная тревога')
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`*Сирены полицейских машин стихли так же быстро как и появились, ${author}, вы выдохнули со спокойствием и решили все же посмотреть на камеру, которая как оказалось была просто муляжом*`)
                                .setColor(config.color);
                            await ButtonInteraction.update({
                                embeds: [Embed],
                                components: []
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Steal")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Steal(Nothing)\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance}${emoji}\n[5] Сколько: ${0}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed]
                            })
                            return
                        } else {
                            const Embed = new EmbedBuilder()
                                .setTitle('Ты садишься в тюрьму')
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`Незнакомец: Что-то мне подсказывает что зря ты отказался, - он разворачивается и уходит шаркая ногами и бормоча что-то себе под нос.
                                
*${author}, ты отказался от помощи и все таки зря, потому что сирены звучали неспроста и полиция ехала за тобой*
Полицейский: -Мы знаем что вы сделали или пытались сделать, пройдемте со мной. *и вот вы уже в наручниках едете в тюрьму - отбывать свой срок в* ***2 часа***`)
                                .setColor(config.color);
                            await ButtonInteraction.update({
                                embeds: [Embed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE money SET jailtime = ${jail} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Steal")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Steal\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance-250}${emoji}\n[5] Сколько: ${250}${emoji}\n[6] Пользователь: ${member}\n[7] Старый баланс: ${m_balance}${emoji}\n[8] Новый баланс: ${m_balance}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            const logEmbed1 = new EmbedBuilder()
                                .setTitle("Steal(jail)")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Jail\n[3] Посажен до: ${jail}`)
                                .setColor('#ff0000')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed, logEmbed1]
                            })
                            return
                        }
                    }
                })
                collector.on('end', async () => {
                    if (answer < 1) {
                        const Embed = new EmbedBuilder()
                            .setTitle('Кража')
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы не захотели платить штраф и вас посадили в тюрьму на 2 часа`)
                            .setColor(config.color);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: []
                        })
                        await connection
                            .query(`UPDATE money SET jailtime = ${jail} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Steal")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Steal\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance-250}${emoji}\n[5] Сколько: ${250}${emoji}\n[6] Пользователь: ${member}\n[7] Старый баланс: ${m_balance}${emoji}\n[8] Новый баланс: ${m_balance}${emoji}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        const logEmbed1 = new EmbedBuilder()
                            .setTitle("Steal(jail)")
                            .setDescription(`[1] ${author}(${author.id})\n[2] Jail\n[3] Посажен до: ${jail}`)
                            .setColor('#ff0000')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannel.send({
                            embeds: [logEmbed, logEmbed1]
                        })
                        return
                    }
                })
            }
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