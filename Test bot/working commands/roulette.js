const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roulette')
		.setDescription('предложить сражение')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('ставка')
			.setRequired(true))
        .addUserOption(option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(false)),
        async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		let member = interaction.options.getUser('member');
        const money = interaction.options.getInteger('money');
        const fee = Math.ceil(money/25)
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
		let a_balance = 0;
        let m_balance = 0;
        let a_jailtime = 0;
        let m_jailtime = 0;
        let answer = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let a_bypass = 0;
        let m_bypass = 0;
        let a_ghost = 0;
        let m_ghost = 0;
        let a_motion = "Не сделан";
        let m_motion = "Не сделан";
        let winner;
        let temp;
        let sqlResult;
        let message
        let now = Date.now()
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Русская рулетка")
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
                .query(`SELECT money, jailtime, baneconomy, bypass, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Русская рулетка")
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
                a_jailtime = sqlResult[0].jailtime;
                a_baneconomy = sqlResult[0].baneconomy;
                a_bypass = sqlResult[0].bypass;
                a_ghost = sqlResult[0].ghost;
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
                    .setTitle("Русская рулетка")
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
            let embedMember = () => {
                let text = `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Выбрал пулю: ${author}: ${a_motion}
[8] Выбрал пулю: ${member}: ${m_motion}
[9] Выпала пуля: ${winner}
[10] Выиграл: ${member}
[11] Выигрыш: ${money-fee}${emoji}
[12] Новый баланс ${author}: ${a_balance-money}${emoji}
[13] Новый баланс ${member}: ${m_balance+money-fee}${emoji}`;
            }
            let embedAuthor = () => {
                `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money} ${emoji}
[6] Комиссия: ${fee} ${emoji}(4%)
[7] Выбрал пулю: ${author}: ${a_motion}
[8] Выбрал пулю: ${member}: ${m_motion}
[9] Выпала пуля: ${winner}
[10] Выиграл: ${member}
[11] Выигрыш: ${money-fee}${emoji}
[12] Новый баланс ${author}: ${a_balance+money-fee}${emoji}
[13] Новый баланс ${member}: ${m_balance-money}${emoji}`
            }
            if (a_jailtime > now) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Русская рулетка")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(a_jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            if (money < 100) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Русская рулетка")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 100`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (a_balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Русская рулетка")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${a_balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            let lock = (a_motion, i) => {
                if (a_motion+1 == i) {
                    return true
                } else {
                    return false
                }
            }
            let gif = () => {
                let random = Math.floor(Math.random() * 100)+1;
                if (random > 100) {
                    let gifList = ['https://media.discordapp.net/attachments/1098268074433577100/1098272742530363484/4mM6.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272742870093905/7mhk.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272743188877454/820C.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272743545385062/1454565034_tumblr_nj60peaOSJ1th0r47o1_500.gif']
                    return gifList[Math.floor(Math.random() * 5)];
                } else {
                    return 'https://media.discordapp.net/attachments/1098268074433577100/1098274238869278873/shot.gif'
                }
            }
            if (member == null) {
                await connection
                    .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonRouletteCreate')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Русская рулетка")
                    .setColor(config.color)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author} хочет с кем-нибудь сразиться на ${money}${emoji}`);
                await interaction.reply({
                    embeds: [embedBattle],
                    components: [row],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRouletteCreate';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {/////////////////////// a_mention = не сделан m_mention = Не сделан member != member answer = 0 temp = undefined
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonInteraction.user.id === author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете принять свою дуэль`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    await connection
                        .query(`SELECT money, bank, baneconomy, jailtime, ghost FROM money WHERE id = ${ButtonMember.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => sqlResult = result)
                    if (sqlResult[0] === undefined) {
                        await connection
                        .query(`INSERT INTO money (id, money) VALUES (${ButtonMember.id}, 0);`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    } else {
                        m_balance = sqlResult[0].money;
                        m_baneconomy = sqlResult[0].baneconomy
                        m_bypass = sqlResult[0].bypass;
                        m_jailtime = sqlResult[0].jailtime
                        m_ghost = sqlResult[0].ghost;
                    }

                    if (m_baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setDescription(`${member}, вы не можете принять дуэль, вам выдан бан экономики, длительность: Навсегда`)
                            .setColor(config.colorError);
                        await ButtonInteraction.reply({
                            embeds: [banEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (m_jailtime > now) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(m_jailtime - Date.now())}`)
                        await interaction.reply({
                            embeds: [errorEmbed],
                        }) 
                        return
                    }
                    if (m_balance < money) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.colorError)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${ButtonMember}, вы не можете принять дуэль на ${money} ${emoji}\n\n\\Ваш баланс: ${m_balance} ${emoji}`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    //////////////////////////////////member принят
                    await ButtonInteraction.deferUpdate()
                    answer++;
                    member = ButtonMember;
                    await connection
                        .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const rowFirst = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone1')
                                .setLabel('1')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone2')
                                .setLabel('2')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone3')
                                .setLabel('3')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone4')
                                .setLabel('4')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone5')
                                .setLabel('5')
                                .setStyle(2),
                        )
                    const rowFirst1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteEveryone6')
                                .setLabel('6')
                                .setStyle(2),
                        )
                    const EmbedAuthorMotion = new EmbedBuilder()
                        .setTitle("Русская рулетка")
                        .setColor(config.color)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`**Ход ${author}: Ожидается...**\nХод ${member}: ${m_motion}`);
                    await ButtonInteraction.editReply({
                        content: `${author}`,
                        embeds: [EmbedAuthorMotion],
                        components: [rowFirst, rowFirst1],
                    })

                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRouletteEveryone1' || ButtonInteraction.customId === 'buttonRouletteEveryone2' || ButtonInteraction.customId === 'buttonRouletteEveryone3' || ButtonInteraction.customId === 'buttonRouletteEveryone4' || ButtonInteraction.customId === 'buttonRouletteEveryone5' || ButtonInteraction.customId === 'buttonRouletteEveryone6';

                    const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

                    collector1.on('collect', async ButtonInteraction => { ////////////////ожидание хода автора member = member answer = 1
                        if (ButtonInteraction.member.id != author.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await ButtonInteraction.deferUpdate()
                        answer++ /////////////////////// a_mention = ход m_mention = Не сделан member = member answer = 2 temp = id кнопки автора
                        temp = ButtonInteraction.customId
                        switch(temp) {
                            case 'buttonRouletteEveryone1':
                                a_motion = 0;
                                break;
                            case 'buttonRouletteEveryone2':
                                a_motion = 1;
                                break;
                            case 'buttonRouletteEveryone3':
                                a_motion = 2;
                                break;
                            case 'buttonRouletteEveryone4':
                                a_motion = 3;
                                break;
                            case 'buttonRouletteEveryone5':
                                a_motion = 4;
                                break;
                            case 'buttonRouletteEveryone6':
                                a_motion = 5;
                                break;
                        }
                        const rowSecond = new ActionRowBuilder()
                        for (let i = 1; i<=5; i++) {
                            rowSecond.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`button1RouletteEveryone${i}`)
                                    .setLabel(`${i}`)
                                    .setStyle(2)
                                    .setDisabled(lock(a_motion, i)),
                            )
                        }
                        const rowSecond1 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`button1RouletteEveryone6`)
                                    .setLabel(`6`)
                                    .setStyle(2)
                                    .setDisabled(lock(a_motion, 6))
                            )
                        const EmbedMemberMotion = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`Ход ${author}: Сделан\n**Ход ${member}: Ожидается...**`);
                        await ButtonInteraction.editReply({
                            content: `${member}`,
                            embeds: [EmbedMemberMotion],
                            components: [rowSecond, rowSecond1],
                        })

                        const filter = ButtonInteraction => ButtonInteraction.customId === 'button1RouletteEveryone1' || ButtonInteraction.customId === 'button1RouletteEveryone2' || ButtonInteraction.customId === 'button1RouletteEveryone3' || ButtonInteraction.customId === 'button1RouletteEveryone4' || ButtonInteraction.customId === 'button1RouletteEveryone5' || ButtonInteraction.customId === 'button1RouletteEveryone6';

                        const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                        collector2.on('collect', async ButtonInteraction => { /////////////////////// a_mention = ход m_mention = ход member = member answer = 2 temp = id кнопки member
                            if (ButtonInteraction.user.id != member.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ButtonInteraction.deferUpdate()
                            answer++ /////////////////////// a_mention = ход m_mention = ход member = member answer = 3 temp = id кнопки member
                            temp = ButtonInteraction.customId
                            switch(temp) {
                                case 'button1RouletteEveryone1':
                                    m_motion = 0;
                                    break;
                                case 'button1RouletteEveryone2':
                                    m_motion = 1;
                                    break;
                                case 'button1RouletteEveryone3':
                                    m_motion = 2;
                                    break;
                                case 'button1RouletteEveryone4':
                                    m_motion = 3;
                                    break;
                                case 'button1RouletteEveryone5':
                                    m_motion = 4;
                                    break;
                                case 'button1RouletteEveryone6':
                                    m_motion = 5;
                                    break;
                            }
                            if (m_bypass == 0 && a_bypass == 0) {
                                winner = Math.floor(Math.random() * 3)
                            } else if (a_bypass == 1) {
                                winner = a_motion
                            } else {
                                winner = m_motion
                            }
                            let list = ['https://media.discordapp.net/attachments/1098268074433577100/1110219374670917714/1.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1110219375119695985/2.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1110219375493005332/3.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1110219375912431707/4.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1110219373613953144/5.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1110219374108885182/6.gif']
                            const Embed = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor(config.color)
                                .setImage(list[winner]);
                            await ButtonInteraction.editReply({
                                embeds: [Embed],
                                components: [],
                            });
                            await wait(8500);
                            if (m_motion == winner) {
                                const EmbedWinAuthor = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${member} успешно застрелился

<:dot:1098344713242820798> Победитель: ${author}                                            
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                    .setImage(gif());
                                await ButtonInteraction.editReply({
                                    embeds: [EmbedWinAuthor],
                                    components: []
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            } else {
                                const EmbedWinMember = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author} успешно застрелился

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}
`)
                                    .setImage(gif());
                                await ButtonInteraction.editReply({
                                    embeds: [EmbedWinMember],
                                    components: []
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedMember())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                        })
                        collector2.on('end', async () => {
                            if (answer < 3) {/////////////////////// a_mention = ход m_mention = не сделан member = member answer = 2 temp = id кнопки автор
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                const EmbedTimeout = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author} застрелил ${member}, пока он выбирал пулю

<:dot:1098344713242820798> Победитель: ${author}                                                
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await interaction.editReply({
                                    content: '',
                                    embeds: [EmbedTimeout],
                                    components: [],
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                        })
                    })
                    collector1.on('end', async () => {
                        if (answer < 2) {/////////////////////// a_mention = не сделан m_mention = не сделан member = member answer = 1 temp = undefined
                            await connection
                                .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedTimeout = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${member} застрелил ${author}, пока он выбирал пулю

<:dot:1098344713242820798> Победитель: ${member}                                                
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}
`)
                            await interaction.editReply({
                                content: '',
                                embeds: [EmbedTimeout],
                                components: [],
                            })
                            if (a_ghost == 1 || m_ghost == 1) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor('#00ff00')
                                .setDescription(embedMember())
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp();;
                            await logChannel.send({
                                embeds: [logEmbed],
                            })
                            return
                        }
                    })
                });
                collector.on('end', async () => {
                    if (answer < 1) {/////////////////////// a_mention = не сделан m_mention = не сделан member != member answer = 0 temp = undefined
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, никто не захотел с вами сражаться`);
                        await interaction.editReply({
                            content: '',
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                        return
                    }
                })
            } else { //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------дуэль с участником
                await connection
                    .query(`SELECT money, bank, baneconomy FROM money WHERE id = ${member.id}`, {
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
                    m_baneconomy = sqlResult[0].baneconomy
                }
                
                if (member.id === author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.colorError)
                        .setDescription(`${ButtonMember},  вы не можете создать дуэль с самом собой`);
                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                if (m_baneconomy == 1) {
                    const banEmbed = new EmbedBuilder()
                        .setTitle("Русская рулетка")
                        .setDescription(`${author}, вы не можете предложить дуэль ${member}`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [banEmbed],
                        ephemeral: true
                    }) 
                    return
                }
                if (m_jailtime > now) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Русская рулетка")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, ${member} находится в тюрьме и не может принять дуэль`)
                    await interaction.reply({
                        embeds: [errorEmbed],
                    }) 
                    return
                }
                if (m_balance < money) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Русская рулетка")
                        .setColor(config.colorError)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы не можете предложить дуэль ${member} на ${money} ${emoji}\n\n\\Баланс ${member}: ${m_balance} ${emoji}`);
                    await interaction.reply({
                        embeds: [errorEmbed],
                    })
                    return
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonRpsAccept')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonRpsReject')
                            .setLabel('отклонить')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Русская рулетка")
                    .setColor(config.color)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author} хочет сразиться с ${member} на ${money}${emoji}`);
                await interaction.reply({
                    embeds: [embedBattle],
                    components: [row],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRpsAccept' || ButtonInteraction.customId === 'buttonRpsReject';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {/////////////////////// a_mention = не сделан m_mention = Не сделан member = member answer = 0 temp = undefined
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id !== member.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    answer++;
                    if (ButtonInteraction.customId === 'buttonRpsReject') {
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} не захотел с вами сражаться`);
                        await interaction.editReply({
                            content: '',
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                        return
                    }
                    await ButtonInteraction.deferUpdate()
                    await connection
                        .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const rowFirst = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember1')
                                .setLabel('1')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember2')
                                .setLabel('2')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember3')
                                .setLabel('3')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember4')
                                .setLabel('4')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember5')
                                .setLabel('5')
                                .setStyle(2),
                        )
                    const rowFirst1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRouletteMember6')
                                .setLabel('6')
                                .setStyle(2),
                        )
                    const EmbedAuthorMotion = new EmbedBuilder()
                        .setTitle("Русская рулетка")
                        .setColor(config.color)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`**Ход ${author}: Ожидается...**\nХод ${member}: ${m_motion}`);
                    await ButtonInteraction.editReply({
                        content: `${author}`,
                        embeds: [EmbedAuthorMotion],
                        components: [rowFirst, rowFirst1],
                    })

                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRouletteMember1' || ButtonInteraction.customId === 'buttonRouletteMember2' || ButtonInteraction.customId === 'buttonRouletteMember3' || ButtonInteraction.customId === 'buttonRouletteMember4' || ButtonInteraction.customId === 'buttonRouletteMember5' || ButtonInteraction.customId === 'buttonRouletteMember6';

                    const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

                    collector1.on('collect', async ButtonInteraction => { ////////////////ожидание хода автора member = member answer = 1
                        if (ButtonInteraction.member.id != author.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await ButtonInteraction.deferUpdate()
                        answer++ /////////////////////// a_mention = ход m_mention = Не сделан member = member answer = 2 temp = id кнопки автора
                        temp = ButtonInteraction.customId
                        switch(temp) {
                            case 'buttonRouletteMember1':
                                a_motion = 0;
                                break;
                            case 'buttonRouletteMember2':
                                a_motion = 1;
                                break;
                            case 'buttonRouletteMember3':
                                a_motion = 2;
                                break;
                            case 'buttonRouletteMember4':
                                a_motion = 3;
                                break;
                            case 'buttonRouletteMember5':
                                a_motion = 4;
                                break;
                            case 'buttonRouletteMember6':
                                a_motion = 5;
                                break;
                        }
                        const rowSecond = new ActionRowBuilder()
                        for (let i = 1; i<=5; i++) {
                            rowSecond.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`button1RouletteMember${i}`)
                                    .setLabel(`${i}`)
                                    .setStyle(2)
                                    .setDisabled(lock(a_motion, i)),
                            )
                        }
                        const rowSecond1 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`button1RouletteMember6`)
                                    .setLabel(`6`)
                                    .setStyle(2)
                                    .setDisabled(lock(a_motion, 6))
                            )
                        const EmbedMemberMotion = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`Ход ${author}: Сделан\n**Ход ${member}: Ожидается...**`);
                        await ButtonInteraction.editReply({
                            content: `${member}`,
                            embeds: [EmbedMemberMotion],
                            components: [rowSecond, rowSecond1],
                        })

                        const filter = ButtonInteraction => ButtonInteraction.customId === 'button1RouletteMember1' || ButtonInteraction.customId === 'button1RouletteMember2' || ButtonInteraction.customId === 'button1RouletteMember3' || ButtonInteraction.customId === 'button1RouletteMember4' || ButtonInteraction.customId === 'button1RouletteMember5' || ButtonInteraction.customId === 'button1RouletteMember6';

                        const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                        collector2.on('collect', async ButtonInteraction => { /////////////////////// a_mention = ход m_mention = ход member = member answer = 2 temp = id кнопки member
                            if (ButtonInteraction.user.id != member.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ButtonInteraction.deferUpdate()
                            answer++ /////////////////////// a_mention = ход m_mention = ход member = member answer = 3 temp = id кнопки member
                            temp = ButtonInteraction.customId
                            switch(temp) {
                                case 'button1RouletteMember1':
                                    m_motion = 0;
                                    break;
                                case 'button1RouletteMember2':
                                    m_motion = 1;
                                    break;
                                case 'button1RouletteMember3':
                                    m_motion = 2;
                                    break;
                                case 'button1RouletteMember4':
                                    m_motion = 3;
                                    break;
                                case 'button1RouletteMember5':
                                    m_motion = 4;
                                    break;
                                case 'button1RouletteMember6':
                                    m_motion = 5;
                                    break;
                            }
                            if (m_bypass == 0 && a_bypass == 0) {
                                winner = Math.floor(Math.random() * 3)
                            } else if (a_bypass == 1) {
                                winner = a_motion
                            } else {
                                winner = m_motion
                            }
                            let list = ['https://media.discordapp.net/attachments/1098268074433577100/1098268242235097228/1.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098268242667130972/2.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098268239559151667/3.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098268240142147674/4.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098268241278795776/5.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098268241794703411/6.gif']
                            const Embed = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor(config.color)
                                .setImage(list[winner]);
                            await ButtonInteraction.editReply({
                                embeds: [Embed],
                                components: [],
                            });
                            let gif = () => {
                                let random = Math.floor(Math.random() * 100)+1
                                if (random < 100) {
                                    let gifList = ['https://media.discordapp.net/attachments/1098268074433577100/1098272742530363484/4mM6.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272742870093905/7mhk.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272743188877454/820C.gif', 'https://media.discordapp.net/attachments/1098268074433577100/1098272743545385062/1454565034_tumblr_nj60peaOSJ1th0r47o1_500.gif']
                                    return gifList[Math.floor(Math.random() * 5)]
                                } else {
                                    return 'https://media.discordapp.net/attachments/1098268074433577100/1098274238869278873/shot.gif'
                                }
                            }
                            await wait(8500);
                            if (m_motion == winner) {
                                const EmbedWinAuthor = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setDescription(`${member} успешно застрелился

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                    .setImage(gif());
                                await ButtonInteraction.editReply({
                                    embeds: [EmbedWinAuthor],
                                    components: []
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            } else {
                                const EmbedWinMember = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setDescription(`${author} успешно застрелился

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                    .setImage(gif());
                                await ButtonInteraction.editReply({
                                    embeds: [EmbedWinMember],
                                    components: []
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedMember())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                        })
                        collector2.on('end', async () => {
                            if (answer < 3) {/////////////////////// a_mention = ход m_mention = не сделан member = member answer = 2 temp = id кнопки автор
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                const EmbedTimeout = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author} застрелил ${member}, пока он выбирал пулю

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await interaction.editReply({
                                    content: '',
                                    embeds: [EmbedTimeout],
                                    components: [],
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Русская рулетка")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                        })
                    })
                    collector1.on('end', async () => {
                        if (answer < 2) {/////////////////////// a_mention = не сделан m_mention = не сделан member = member answer = 1 temp = undefined
                            await connection
                                .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedTimeout = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${member} застрелил ${author}, пока он выбирал пулю

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}
`)
                            await interaction.editReply({
                                content: '',
                                embeds: [EmbedTimeout],
                                components: [],
                            })
                            if (a_ghost == 1 || m_ghost == 1) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Русская рулетка")
                                .setColor('#00ff00')
                                .setDescription(embedMember())
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp();;
                            await logChannel.send({
                                embeds: [logEmbed],
                            })
                            return
                        }
                    })
                });
                collector.on('end', async () => {
                    if (answer < 1) {/////////////////////// a_mention = не сделан m_mention = не сделан member = member answer = 0 temp = undefined
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Русская рулетка")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} проигнорировал ваше предложение`);
                        await interaction.editReply({
                            content: '',
                            embeds: [EmbedTimeout],
                            components: [],
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

