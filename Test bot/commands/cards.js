const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes, col } = require('sequelize');
const br = require('./br');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cards')
		.setDescription('предложить сражение')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('ставка')
			.setRequired(true))
        .addUserOption(option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(false)),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		let member = interaction.options.getUser('member');
        const money = interaction.options.getInteger('money');
        const fee = Math.ceil(money/25)
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
        let end = false
        let cards = [[''],
        [''],
        ['<:j1:1100890669725253793>', '<:j2:1100890671956623522>', '<:j3:1100890674678734901>', '<:j4:1100890718769270926>'],
        ['<:q1:1100890728508424212>', '<:q2:1100890730928537620>', '<:q3:1100890732228784200>', '<:q4:1100890733549981746>'],
        ['<:k1:1100890721021603952>', '<:k2:1100890722976137226>', '<:k3:1100890725618548746>', '<:k4:1100890727078166578>'],
        [''],
        ['<:61:1100890556630044692>', '<:62:1100890559087923240>', '<:63:1100890560337817662>', '<:64:1100890563437416559>'],
        ['<:71:1100890564951547944>', '<:72:1100890566163693690>', '<:73:1100890568910983258>', '<:74:1100890570395758612>'],
        ['<:81:1100890572861997076>', '<:82:1100890596375281837>', '<:83:1100890598044602480>', '<:84:1100890600745730129>'],
        ['<:91:1100890606110265596>', '<:92:1100890609583128697>', '<:93:1100890612347195484>', '<:94:1100890615069282344>'],
        ['<:101:1100890617850122260>', '<:102:1100890619242623036>', '<:103:1100890656970383502>', '<:104:1100890659327586396>'],
        ['<:a1:1100890661147918448>', '<:a2:1100890662586556446>', '<:a3:1100890664885047348>', '<:a4:1100890666566946858>'],
        ]
        const hiddenCard = '<:hidden_card:1100909421661532210>';
        let a_cards = '';
        let a_cards_hidden = '';
        let a_score = 0;
        let m_cards = '';
        let m_cards_hidden = '';
        let m_score = 0;
		let a_balance = 0;
        let m_balance = 0;
        let answer = 0;
        let a_bypass = 0;
        let m_bypass = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let a_ghost = 0;
        let m_ghost = 0;
        let suit
        let number
        let message;
        let sqlResult
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Игра: Двадцать одно")
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
                .query(`SELECT money, baneconomy, bypass, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Игра: Двадцать одно")
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
                .query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                a_balance = sqlResult[0].money;
                a_baneconomy = sqlResult[0].baneconomy;
                a_bypass = sqlResult[0].bypass
                a_ghost = sqlResult[0].ghost
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
                    .setTitle("Игра: Двадцать одно")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (money < 50) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Игра: Двадцать одно")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 50`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (a_balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Игра: Двадцать одно")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${a_balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            let embedMember = () => {
                let text = `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Карты ${author}(${a_score}): ${a_cards}
[8] Карты ${member}(${m_score}): ${m_cards}
[9] Выиграл: ${member}
[10] Выигрыш: ${money-fee} ${emoji}
[11] Новый баланс ${author}: ${a_balance-money}
[12] Новый баланс ${member}: ${m_balance+money-fee}`;
            }
            let embedAuthor = () => {
                `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Карты ${author}(${a_score}): ${a_cards}
[8] Карты ${member}(${m_score}): ${m_cards}
[9] Выиграл: ${author}
[10] Выигрыш: ${money-fee} ${emoji}
[11] Новый баланс ${author}: ${a_balance+money-fee}
[12] Новый баланс ${member}: ${m_balance-money}`
            }
            let EmbedDrow = () => {
                `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Карты ${author}(${a_score}): ${a_cards}
[8] Карты ${member}(${m_score}): ${m_cards}
[9] Выиграл: Drow
[10] Выигрыш: 0 ${emoji}
[11] Новый баланс ${author}: ${a_balance}
[12] Новый баланс ${member}: ${m_balance}`
            }
            if (member == null) {
                await connection
                    .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCardsCreate')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Игра: Двадцать одно")
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
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCardsCreate';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
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
                        .query(`SELECT money, baneconomy, bypass1, ghost FROM money WHERE id = ${ButtonMember.id}`, {
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
                        m_baneconomy = sqlResult[0].baneconomy;
                        m_bypass = sqlResult[0].bypass;
                        m_ghost = sqlResult[0].ghost;
                    }

                    if (m_baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${member}, вы не можете принять дуэль, вам выдан бан экономики, длительность: Навсегда`)
                        await ButtonInteraction.reply({
                            embeds: [banEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (m_balance < money) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете принять дуэль на ${money} ${emoji}\n\n\\Ваш баланс: ${m_balance} ${emoji}`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    await ButtonInteraction.deferUpdate()
                    member = ButtonMember
                    await connection
                        .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    let ratio = Math.floor(Math.random() * 2);
                    answer++;
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonCardsMore')
                                .setLabel('ещё')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonCardsEnough')
                                .setLabel('хватит')
                                .setStyle(2),
                        )
                    let score = () => {
                        let number = Math.floor(Math.random() * 9) + 2;
                        while (cards[number].length == 0) {
                            number = Math.floor(Math.random() * 9) + 2;
                        }
                        if (number<5) {
                            return number
                        } else {
                            return number+1
                        }
                    }
                    if (ratio == 0) {// random = first author, motion = author
                        number = score()
                        a_score += number;
                        suit = Math.floor(Math.random() * cards[number].length);
                        a_cards += cards[number][suit]
                        a_cards_hidden = a_cards_hidden + cards[number][suit];
                        cards[number].splice(suit, 1)
                        const aFirstScore = number
                        number = score()
                        m_score += number;
                        suit = Math.floor(Math.random() * cards[number].length);
                        m_cards += cards[number][suit]
                        m_cards_hidden = m_cards_hidden + cards[number][suit];
                        cards[number].splice(suit, 1)
                        const mFirstScore = number
                        const Embed = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\n${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                        await ButtonInteraction.editReply({
                            content: `${author}`,
                            embeds: [Embed],
                            components: [row]
                        })
                        const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCardsMore' || ButtonInteraction.customId === 'buttonCardsEnough';

                        const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id !== author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            collector1.resetTimer()
                            if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = author, a_score < 21, m_score = 0, win = no
                                number = score()
                                a_cards_hidden = a_cards_hidden + hiddenCard;
                                a_score += number;
                                suit = Math.floor(Math.random() * cards[number].length);
                                a_cards += cards[number][suit]
                                cards[number].splice(suit, 1)
                                if (a_score > 21) {// random = first author, motion = author, a_score > 21, m_score = 0, win = member
                                    await ButtonInteraction.deferUpdate()
                                    answer++
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                    await ButtonInteraction.editReply({
                                        content: ``,
                                        embeds: [Embed],
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
                                        .setTitle("Двадцать одно")
                                        .setColor('#00ff00')
                                        .setDescription(embedMember())
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp();;
                                    await logChannel.send({
                                        embeds: [logEmbed],
                                    })
                                    return
                                } else {// random = first author, motion = author, a_score < 21, m_score = 0, win = no
                                    ButtonInteraction.reply({
                                        content: `Ваши карты(${a_score}): ${a_cards}`,
                                        ephemeral: true
                                    })
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\n${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                    await interaction.editReply({
                                        embeds: [Embed],
                                        components: [row]
                                    })
                                }
                            }
                            if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score = 0, win = no
                                await ButtonInteraction.deferUpdate()
                                answer++;
                                collector1.stop();
                                const Embed = new EmbedBuilder()
                                    .setTitle("Игра: Двадцать одно")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                await ButtonInteraction.editReply({
                                    content: `${member}`,
                                    embeds: [Embed],
                                    components: [row]
                                })

                                const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                                collector2.on('collect', async ButtonInteraction => {
                                    if (ButtonInteraction.user.id !== member.id) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setColor(config.colorError)
                                            .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                        await ButtonInteraction.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        })
                                        return
                                    }
                                    collector2.resetTimer()
                                    if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                        number = score()
                                        m_cards_hidden = m_cards_hidden + hiddenCard;
                                        m_score += number;
                                        suit = Math.floor(Math.random() * cards[number].length);
                                        m_cards += cards[number][suit]
                                        cards[number].splice(suit, 1)
                                        if (m_score > 21) {// random = first author, motion = member, a_score < 21, m_score > 21, win = author
                                            await ButtonInteraction.deferUpdate()
                                            answer++
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        } else {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            ButtonInteraction.reply({
                                                content: `Ваши карты(${m_score}): ${m_cards}`,
                                                ephemeral: true
                                            })
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nХод: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                            await interaction.editReply({
                                                content: `${member}`,
                                                embeds: [Embed],
                                                components: [row]
                                            })
                                        }
                                    }
                                    if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                        await ButtonInteraction.deferUpdate()
                                        answer++;
                                        collector2.stop()
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                                collector2.on('end', async () => {// random = first author, motion = member, a_score < 21, m_score < 21, win = author(time out)
                                    if (answer == 2) {
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (answer == 1 && !end) {
                                answer++;
                                const Embed = new EmbedBuilder()
                                    .setTitle("Игра: Двадцать одно")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                await ButtonInteraction.editReply({
                                    content: `${member}`,
                                    embeds: [Embed],
                                    components: [row]
                                })

                                const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                                collector2.on('collect', async ButtonInteraction => {
                                    if (ButtonInteraction.user.id !== member.id) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setColor(config.colorError)
                                            .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                        await ButtonInteraction.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        })
                                        return
                                    }
                                    collector2.resetTimer()
                                    if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                        number = score()
                                        m_cards_hidden = m_cards_hidden + hiddenCard;
                                        m_score += number;
                                        suit = Math.floor(Math.random() * cards[number].length);
                                        m_cards += cards[number][suit]
                                        cards[number].splice(suit, 1)
                                        if (m_score > 21) {// random = first author, motion = member, a_score < 21, m_score > 21, win = author
                                            await ButtonInteraction.deferUpdate()
                                            answer++
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        } else {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            ButtonInteraction.reply({
                                                content: `Ваши карты(${m_score}): ${m_cards}`,
                                                ephemeral: true
                                            })
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nХод: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                            await interaction.editReply({
                                                content: `${member}`,
                                                embeds: [Embed],
                                                components: [row]
                                            })
                                        }
                                    }
                                    if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                        await ButtonInteraction.deferUpdate()
                                        answer++;
                                        collector2.stop()
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                                collector2.on('end', async () => {// random = first author, motion = member, a_score < 21, m_score < 21, win = author(time out)
                                    if (answer == 2) {
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                            }
                        })
                    } else {// random = first member, motion = member
                        number = score()
                        a_score += number;
                        suit = Math.floor(Math.random() * cards[number].length);
                        a_cards += cards[number][suit]
                        a_cards_hidden = a_cards_hidden + cards[number][suit];
                        cards[number].splice(suit, 1)
                        const aFirstScore = number
                        number = score()
                        m_score += number;
                        suit = Math.floor(Math.random() * cards[number].length);
                        m_cards += cards[number][suit]
                        m_cards_hidden = m_cards_hidden + cards[number][suit];
                        cards[number].splice(suit, 1)
                        const mFirstScore = number
                        const Embed = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход: ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                        await ButtonInteraction.editReply({
                            content: `${member}`,
                            embeds: [Embed],
                            components: [row]
                        })
                        const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCardsMore' || ButtonInteraction.customId === 'buttonCardsEnough';

                        const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id !== member.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            collector1.resetTimer()
                            if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = member, m_score < 21, a_score = 0, win = no
                                number = score()
                                m_cards_hidden = m_cards_hidden + hiddenCard;
                                m_score += number;
                                suit = Math.floor(Math.random() * cards[number].length);
                                m_cards += cards[number][suit]
                                cards[number].splice(suit, 1)
                                if (m_score > 21) {// random = first member, motion = member, m_score > 21, a_score = 0, win = author
                                    await ButtonInteraction.deferUpdate()
                                    answer++
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                    await ButtonInteraction.editReply({
                                        content: ``,
                                        embeds: [Embed],
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
                                        .setTitle("Двадцать одно")
                                        .setColor('#00ff00')
                                        .setDescription(embedAuthor())
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp();
                                    await logChannel.send({
                                        embeds: [logEmbed],
                                    })
                                    return
                                } else {// random = first member, motion = member, m_score < 21, a_score = 0, win = no
                                    ButtonInteraction.reply({
                                        content: `Ваши карты(${m_score}): ${m_cards}`,
                                        ephemeral: true
                                    })
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход: ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                    await interaction.editReply({
                                        content: `${member}`,
                                        embeds: [Embed],
                                        components: [row]
                                    })
                                }
                            }
                            if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, m_score < 21, a_score = 0, win = no
                                await ButtonInteraction.deferUpdate()
                                answer++;
                                collector1.stop();
                                const Embed = new EmbedBuilder()
                                    .setTitle("Игра: Двадцать одно")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                await ButtonInteraction.editReply({
                                    content: `${author}`,
                                    embeds: [Embed],
                                    components: [row]
                                })

                                const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                                collector2.on('collect', async ButtonInteraction => {
                                    if (ButtonInteraction.user.id !== author.id) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setColor(config.colorError)
                                            .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                        await ButtonInteraction.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        })
                                        return
                                    }
                                    collector2.resetTimer()
                                    if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                        number = score()
                                        a_cards_hidden = a_cards_hidden + hiddenCard;
                                        a_score += number;
                                        suit = Math.floor(Math.random() * cards[number].length);
                                        a_cards += cards[number][suit]
                                        cards[number].splice(suit, 1)
                                        if (a_score > 21) {// random = first member, motion = author, m_score < 21, a_score > 21, win = member
                                            await ButtonInteraction.deferUpdate()
                                            answer++
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        } else {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                            ButtonInteraction.reply({
                                                content: `Ваши карты(${a_score}): ${a_cards}`,
                                                ephemeral: true
                                            })
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Ход: ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                            await interaction.editReply({
                                                content: `${author}`,
                                                embeds: [Embed],
                                                components: [row]
                                            })
                                        }
                                    }
                                    if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, a_score < 21, m_score < 21, win = no
                                        await ButtonInteraction.deferUpdate()
                                        answer++;
                                        collector2.stop()
                                        if (a_score == m_score) { // random = first member, motion = author, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                                collector2.on('end', async () => {
                                    if (answer == 2) {
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (answer == 1 && !end) {
                                answer++;
                                const Embed = new EmbedBuilder()
                                    .setTitle("Игра: Двадцать одно")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                await ButtonInteraction.editReply({
                                    content: `${author}`,
                                    embeds: [Embed],
                                    components: [row]
                                })

                                const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });

                                collector2.on('collect', async ButtonInteraction => {
                                    if (ButtonInteraction.user.id !== author.id) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setColor(config.colorError)
                                            .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                        await ButtonInteraction.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        })
                                        return
                                    }
                                    collector2.resetTimer()
                                    if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                        number = score()
                                        a_cards_hidden = a_cards_hidden + hiddenCard;
                                        a_score += number;
                                        suit = Math.floor(Math.random() * cards[number].length);
                                        a_cards += cards[number][suit]
                                        cards[number].splice(suit, 1)
                                        if (a_score > 21) {// random = first member, motion = author, m_score < 21, a_score > 21, win = member
                                            await ButtonInteraction.deferUpdate()
                                            answer++
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        } else {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                            ButtonInteraction.reply({
                                                content: `Ваши карты(${a_score}): ${a_cards}`,
                                                ephemeral: true
                                            })
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Ход: ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                            await interaction.editReply({
                                                content: `${author}`,
                                                embeds: [Embed],
                                                components: [row]
                                            })
                                        }
                                    }
                                    if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, a_score < 21, m_score < 21, win = no
                                        await ButtonInteraction.deferUpdate()
                                        answer++;
                                        collector2.stop()
                                        if (a_score == m_score) { // random = first member, motion = author, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                                collector2.on('end', async () => {
                                    if (answer == 2) {
                                        if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Ничья!

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
                                                components: []
                                            })
                                            await connection
                                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                            })
                                            if (a_ghost == 1 || m_ghost == 1) {
                                                return
                                            }
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle("Двадцать одно")
                                                .setColor('#ffff00')
                                                .setDescription(EmbedDrow())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}

<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedAuthor())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                        if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                            const Embed = new EmbedBuilder()
                                                .setTitle("Игра: Двадцать одно")
                                                .setThumbnail(author.user.displayAvatarURL())
                                                .setColor(config.color)
                                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**

<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                            await ButtonInteraction.editReply({
                                                content: ``,
                                                embeds: [Embed],
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
                                                .setTitle("Двадцать одно")
                                                .setColor('#00ff00')
                                                .setDescription(embedMember())
                                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                .setTimestamp();;
                                            await logChannel.send({
                                                embeds: [logEmbed],
                                            })
                                            return
                                        }
                                    }
                                })
                            }
                        })
                    } 
                });
                collector.on('end', async () => {
                    if (answer == 0) {
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, на ваше предложение никто не ответил`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                    }
                })
            } else { //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------дуэль с участником
                await connection
                    .query(`SELECT money, bypass, baneconomy, ghost FROM money WHERE id = ${member.id}`, {
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
                    m_bypass = sqlResult[0].bypass;
                    m_baneconomy = sqlResult[0].baneconomy;
                    m_ghost = sqlResult[0].ghost
                }

                if (member.id === author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.colorError)
                        .setDescription(`${ButtonMember}, вы не можете создать дуэль с самом собой`);
                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                if (m_baneconomy == 1) {
                    const banEmbed = new EmbedBuilder()
                        .setTitle("Игра: Двадцать одно")
                        .setColor(config.colorError)
                        .setDescription(`${author}, вы не можете предложить дуэль ${member}`)
                    await interaction.reply({
                        embeds: [banEmbed],
                        ephemeral: true
                    }) 
                    return
                }
                if (m_balance < money) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Игра: Двадцать одно")
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
                            .setCustomId('buttonDuelAccept')
                            .setEmoji(config.emojis.yes)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelReject')
                            .setEmoji(config.emojis.no)
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Игра: Двадцать одно")
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
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonDuelAccept' || ButtonInteraction.customId === 'buttonDuelReject';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user
                    if (ButtonMember.id != member.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    if (ButtonInteraction.customId === 'buttonDuelReject') {
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Дуэли: cards")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} не захотел с вами сражаться`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                        return
                    }
                    if (ButtonInteraction.customId === 'buttonDuelAccept') {
                        let ratio = Math.floor(Math.random() * 2);
                        answer++;
                        await ButtonInteraction.deferUpdate()
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCardsMore')
                                    .setLabel('ещё')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCardsEnough')
                                    .setLabel('хватит')
                                    .setStyle(2),
                            )
                        let score = () => {
                            let number = Math.floor(Math.random() * 9) + 2;
                            while (cards[number].length == 0) {
                                number = Math.floor(Math.random() * 9) + 2;
                            }
                            if (number<5) {
                                return number
                            } else {
                                return number+1
                            }
                        }
                        if (ratio == 0) {// random = first author, motion = author
                            number = score()
                            a_score += number;
                            suit = Math.floor(Math.random() * cards[number].length);
                            a_cards += cards[number][suit]
                            a_cards_hidden = a_cards_hidden + cards[number][suit];
                            cards[number].splice(suit, 1)
                            const aFirstScore = number
                            number = score()
                            m_score += number;
                            suit = Math.floor(Math.random() * cards[number].length);
                            m_cards += cards[number][suit]
                            m_cards_hidden = m_cards_hidden + cards[number][suit];
                            cards[number].splice(suit, 1)
                            const mFirstScore = number
                            const Embed = new EmbedBuilder()
                                .setTitle("Игра: Двадцать одно")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\n${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                            await ButtonInteraction.editReply({
                                content: `${author}`,
                                embeds: [Embed],
                                components: [row]
                            })
                            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCardsMore' || ButtonInteraction.customId === 'buttonCardsEnough';
    
                            const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                            collector1.on('collect', async ButtonInteraction => {
                                if (ButtonInteraction.user.id !== author.id) {
                                    const errorEmbed = new EmbedBuilder()
                                        .setColor(config.colorError)
                                        .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                    await ButtonInteraction.reply({
                                        embeds: [errorEmbed],
                                        ephemeral: true
                                    })
                                    return
                                }
                                collector1.resetTimer()
                                if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = author, a_score < 21, m_score = 0, win = no
                                    number = score()
                                    a_cards_hidden = a_cards_hidden + hiddenCard;
                                    a_score += number;
                                    suit = Math.floor(Math.random() * cards[number].length);
                                    a_cards += cards[number][suit]
                                    cards[number].splice(suit, 1)
                                    if (a_score > 21) {// random = first author, motion = author, a_score > 21, m_score = 0, win = member
                                        await ButtonInteraction.deferUpdate()
                                        answer++
                                        const Embed = new EmbedBuilder()
                                            .setTitle("Игра: Двадцать одно")
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.color)
                                            .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                        await ButtonInteraction.editReply({
                                            content: ``,
                                            embeds: [Embed],
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
                                            .setTitle("Двадцать одно")
                                            .setColor('#00ff00')
                                            .setDescription(embedMember())
                                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                                            .setTimestamp();;
                                        await logChannel.send({
                                            embeds: [logEmbed],
                                        })
                                        return
                                    } else {// random = first author, motion = author, a_score < 21, m_score = 0, win = no
                                        ButtonInteraction.reply({
                                            content: `Ваши карты(${a_score}): ${a_cards}`,
                                            ephemeral: true
                                        })
                                        const Embed = new EmbedBuilder()
                                            .setTitle("Игра: Двадцать одно")
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.color)
                                            .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\n${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                        await interaction.editReply({
                                            content: `${author}`,
                                            embeds: [Embed],
                                            components: [row]
                                        })
                                    }
                                }
                                if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score = 0, win = no
                                    await ButtonInteraction.deferUpdate()
                                    answer++;
                                    collector1.stop();
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                    await ButtonInteraction.editReply({
                                        content: `${member}`,
                                        embeds: [Embed],
                                        components: [row]
                                    })
    
                                    const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                                    collector2.on('collect', async ButtonInteraction => {
                                        if (ButtonInteraction.user.id !== member.id) {
                                            const errorEmbed = new EmbedBuilder()
                                                .setColor(config.colorError)
                                                .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                            await ButtonInteraction.reply({
                                                embeds: [errorEmbed],
                                                ephemeral: true
                                            })
                                            return
                                        }
                                        collector2.resetTimer()
                                        if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            number = score()
                                            m_cards_hidden = m_cards_hidden + hiddenCard;
                                            m_score += number;
                                            suit = Math.floor(Math.random() * cards[number].length);
                                            m_cards += cards[number][suit]
                                            cards[number].splice(suit, 1)
                                            if (m_score > 21) {// random = first author, motion = member, a_score < 21, m_score > 21, win = author
                                                await ButtonInteraction.deferUpdate()
                                                answer++
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            } else {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                                ButtonInteraction.reply({
                                                    content: `Ваши карты(${m_score}): ${m_cards}`,
                                                    ephemeral: true
                                                })
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nХод: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                                await interaction.editReply({
                                                    content: `${member}`,
                                                    embeds: [Embed],
                                                    components: [row]
                                                })
                                            }
                                        }
                                        if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            await ButtonInteraction.deferUpdate()
                                            answer++;
                                            collector2.stop()
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                    collector2.on('end', async () => {// random = first author, motion = member, a_score < 21, m_score < 21, win = author(time out)
                                        if (answer == 2) {
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                }
                            })
                            collector1.on('end', async () => {
                                if (answer == 1 && !end) {
                                    answer++;
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                    await ButtonInteraction.editReply({
                                        content: `${member}`,
                                        embeds: [Embed],
                                        components: [row]
                                    })
    
                                    const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                                    collector2.on('collect', async ButtonInteraction => {
                                        if (ButtonInteraction.user.id !== member.id) {
                                            const errorEmbed = new EmbedBuilder()
                                                .setColor(config.colorError)
                                                .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                            await ButtonInteraction.reply({
                                                embeds: [errorEmbed],
                                                ephemeral: true
                                            })
                                            return
                                        }
                                        collector2.resetTimer()
                                        if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            number = score()
                                            m_cards_hidden = m_cards_hidden + hiddenCard;
                                            m_score += number;
                                            suit = Math.floor(Math.random() * cards[number].length);
                                            m_cards += cards[number][suit]
                                            cards[number].splice(suit, 1)
                                            if (m_score > 21) {// random = first author, motion = member, a_score < 21, m_score > 21, win = author
                                                await ButtonInteraction.deferUpdate()
                                                answer++
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            } else {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                                ButtonInteraction.reply({
                                                    content: `Ваши карты(${m_score}): ${m_cards}`,
                                                    ephemeral: true
                                                })
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nХод: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                                await interaction.editReply({
                                                    content: `${member}`,
                                                    embeds: [Embed],
                                                    components: [row]
                                                })
                                            }
                                        }
                                        if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first author, motion = member, a_score < 21, m_score < 21, win = no
                                            await ButtonInteraction.deferUpdate()
                                            answer++;
                                            collector2.stop()
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                    collector2.on('end', async () => {// random = first author, motion = member, a_score < 21, m_score < 21, win = author(time out)
                                        if (answer == 2) {
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                }
                            })
                        } else {// random = first member, motion = member
                            number = score()
                            a_score += number;
                            suit = Math.floor(Math.random() * cards[number].length);
                            a_cards += cards[number][suit]
                            a_cards_hidden = a_cards_hidden + cards[number][suit];
                            cards[number].splice(suit, 1)
                            const aFirstScore = number
                            number = score()
                            m_score += number;
                            suit = Math.floor(Math.random() * cards[number].length);
                            m_cards += cards[number][suit]
                            m_cards_hidden = m_cards_hidden + cards[number][suit];
                            cards[number].splice(suit, 1)
                            const mFirstScore = number
                            const Embed = new EmbedBuilder()
                                .setTitle("Игра: Двадцать одно")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход: ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                            await ButtonInteraction.editReply({
                                content: `${member}`,
                                embeds: [Embed],
                                components: [row]
                            })
                            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCardsMore' || ButtonInteraction.customId === 'buttonCardsEnough';
    
                            const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                            collector1.on('collect', async ButtonInteraction => {
                                if (ButtonInteraction.user.id !== member.id) {
                                    const errorEmbed = new EmbedBuilder()
                                        .setColor(config.colorError)
                                        .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                    await ButtonInteraction.reply({
                                        embeds: [errorEmbed],
                                        ephemeral: true
                                    })
                                    return
                                }
                                collector1.resetTimer()
                                if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = member, m_score < 21, a_score = 0, win = no
                                    number = score()
                                    m_cards_hidden = m_cards_hidden + hiddenCard;
                                    m_score += number;
                                    suit = Math.floor(Math.random() * cards[number].length);
                                    m_cards += cards[number][suit]
                                    cards[number].splice(suit, 1)
                                    if (m_score > 21) {// random = first member, motion = member, m_score > 21, a_score = 0, win = author
                                        await ButtonInteraction.deferUpdate()
                                        answer++
                                        const Embed = new EmbedBuilder()
                                            .setTitle("Игра: Двадцать одно")
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.color)
                                            .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}(Перебор)
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                        await ButtonInteraction.editReply({
                                            content: ``,
                                            embeds: [Embed],
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
                                            .setTitle("Двадцать одно")
                                            .setColor('#00ff00')
                                            .setDescription(embedAuthor())
                                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                                            .setTimestamp();
                                        await logChannel.send({
                                            embeds: [logEmbed],
                                        })
                                        return
                                    } else {// random = first member, motion = member, m_score < 21, a_score = 0, win = no
                                        ButtonInteraction.reply({
                                            content: `Ваши карты(${m_score}): ${m_cards}`,
                                            ephemeral: true
                                        })
                                        const Embed = new EmbedBuilder()
                                            .setTitle("Игра: Двадцать одно")
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.color)
                                            .setDescription(`${author}(${aFirstScore}+?): ${a_cards_hidden}\n**Ход: ${member}(${mFirstScore}+?): ${m_cards_hidden}**`);
                                        await interaction.editReply({
                                            content: `${member}`,
                                            embeds: [Embed],
                                            components: [row]
                                        })
                                    }
                                }
                                if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, m_score < 21, a_score = 0, win = no
                                    await ButtonInteraction.deferUpdate()
                                    answer++;
                                    collector1.stop();
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                    await ButtonInteraction.editReply({
                                        content: `${author}`,
                                        embeds: [Embed],
                                        components: [row]
                                    })
    
                                    const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                                    collector2.on('collect', async ButtonInteraction => {
                                        if (ButtonInteraction.user.id !== author.id) {
                                            const errorEmbed = new EmbedBuilder()
                                                .setColor(config.colorError)
                                                .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                            await ButtonInteraction.reply({
                                                embeds: [errorEmbed],
                                                ephemeral: true
                                            })
                                            return
                                        }
                                        collector2.resetTimer()
                                        if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                            number = score()
                                            a_cards_hidden = a_cards_hidden + hiddenCard;
                                            a_score += number;
                                            suit = Math.floor(Math.random() * cards[number].length);
                                            a_cards += cards[number][suit]
                                            cards[number].splice(suit, 1)
                                            if (a_score > 21) {// random = first member, motion = author, m_score < 21, a_score > 21, win = member
                                                await ButtonInteraction.deferUpdate()
                                                answer++
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            } else {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                                ButtonInteraction.reply({
                                                    content: `Ваши карты(${a_score}): ${a_cards}`,
                                                    ephemeral: true
                                                })
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Ход: ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                                await interaction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: [row]
                                                })
                                            }
                                        }
                                        if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, a_score < 21, m_score < 21, win = no
                                            await ButtonInteraction.deferUpdate()
                                            answer++;
                                            collector2.stop()
                                            if (a_score == m_score) { // random = first member, motion = author, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                    collector2.on('end', async () => {
                                        if (answer == 2) {
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                }
                            })
                            collector1.on('end', async () => {
                                if (answer == 1 && !end) {
                                    answer++;
                                    const Embed = new EmbedBuilder()
                                        .setTitle("Игра: Двадцать одно")
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.color)
                                        .setDescription(`**Ход ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                    await ButtonInteraction.editReply({
                                        content: `${author}`,
                                        embeds: [Embed],
                                        components: [row]
                                    })
    
                                    const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });
    
                                    collector2.on('collect', async ButtonInteraction => {
                                        if (ButtonInteraction.user.id !== author.id) {
                                            const errorEmbed = new EmbedBuilder()
                                                .setColor(config.colorError)
                                                .setDescription(`${ButtonInteraction.member}, вы не можете этого делать`);
                                            await ButtonInteraction.reply({
                                                embeds: [errorEmbed],
                                                ephemeral: true
                                            })
                                            return
                                        }
                                        collector2.resetTimer()
                                        if (ButtonInteraction.customId === 'buttonCardsMore') {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                            number = score()
                                            a_cards_hidden = a_cards_hidden + hiddenCard;
                                            a_score += number;
                                            suit = Math.floor(Math.random() * cards[number].length);
                                            a_cards += cards[number][suit]
                                            cards[number].splice(suit, 1)
                                            if (a_score > 21) {// random = first member, motion = author, m_score < 21, a_score > 21, win = member
                                                await ButtonInteraction.deferUpdate()
                                                answer++
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}(Перебор)
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            } else {// random = first member, motion = author, m_score < 21, a_score < 21, win = no
                                                ButtonInteraction.reply({
                                                    content: `Ваши карты(${a_score}): ${a_cards}`,
                                                    ephemeral: true
                                                })
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Ход: ${author}(${aFirstScore}+?): ${a_cards_hidden}**\nКарты: ${member}(${mFirstScore}+?): ${m_cards_hidden}`);
                                                await interaction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: [row]
                                                })
                                            }
                                        }
                                        if (ButtonInteraction.customId === 'buttonCardsEnough') {// random = first member, motion = author, a_score < 21, m_score < 21, win = no
                                            await ButtonInteraction.deferUpdate()
                                            answer++;
                                            collector2.stop()
                                            if (a_score == m_score) { // random = first member, motion = author, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first member, motion = author, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                    collector2.on('end', async () => {
                                        if (answer == 2) {
                                            if (a_score == m_score) { // random = first author, motion = member, a_score < 21, m_score < 21, win = drow
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Ничья!
    
Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
                                                    components: []
                                                })
                                                await connection
                                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                                })
                                                if (a_ghost == 1 || m_ghost == 1) {
                                                    return
                                                }
                                                const logEmbed = new EmbedBuilder()
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#ffff00')
                                                    .setDescription(EmbedDrow())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score > m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = author
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`**Карты ${author}(${a_score}): ${a_cards}**
Карты ${member}(${m_score}): ${m_cards}
    
<:dot:1098344713242820798> Победитель: ${author}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedAuthor())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                            if (a_score < m_score) {// random = first author, motion = member, a_score < 21, m_score < 21, win = member
                                                const Embed = new EmbedBuilder()
                                                    .setTitle("Игра: Двадцать одно")
                                                    .setThumbnail(author.user.displayAvatarURL())
                                                    .setColor(config.color)
                                                    .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                                                await ButtonInteraction.editReply({
                                                    content: ``,
                                                    embeds: [Embed],
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
                                                    .setTitle("Двадцать одно")
                                                    .setColor('#00ff00')
                                                    .setDescription(embedMember())
                                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                                    .setTimestamp();;
                                                await logChannel.send({
                                                    embeds: [logEmbed],
                                                })
                                                return
                                            }
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
                collector.on('end', async () => {
                    if (answer == 0) {
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Игра: Двадцать одно")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} проигнорировал ваше предложение`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                    }
                })
            }
        } catch(err) {
            if (err.code != 10062) {
				DB.lockedCommands.push(interaction.commandName)
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

