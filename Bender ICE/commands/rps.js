const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rps')
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
		let a_balance = 0;
        let m_balance = 0;
        let answer = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let a_motion = "Не сделан";
        let m_motion = "Не сделан";
        let temp;
        let sqlResult;
        let message;
        let now = Date.now()
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Камень ножницы бумага")
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
                .query(`SELECT money, baneconomy FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Камень ножницы бумага")
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
                a_baneconomy = sqlResult[0].baneconomy
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
                    .setTitle("Камень ножницы бумага")
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
                    .setTitle("Камень ножницы бумага")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 50`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (a_balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Камень ножницы бумага")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${a_balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            let embedMember = () => {
                `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Выбрал: ${author}: ${a_motion}
[8] Выбрал: ${member}: ${m_motion}
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
[7] Выбрал: ${author}: ${a_motion}
[8] Выбрал: ${member}: ${m_motion}
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
[7] Выбрал: ${author}: ${a_motion}
[8] Выбрал: ${member}: ${m_motion}
[9] Выиграл: ${author}
[10] Выигрыш: ${money-fee} ${emoji}
[11] Новый баланс ${author}: ${a_balance+money-fee}
[12] Новый баланс ${member}: ${m_balance-money}`
            }
            if (member == null) {
                await connection
                    .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelCreate')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Камень ножницы бумага")
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
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonDuelCreate';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {/////////////////////// a_mention = не сделан m_mention = Не сделан member != member answer = 0 temp = undefined
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonInteraction.user.id === author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете создать дуэль с самом собой`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    await connection
                        .query(`SELECT money, bank, baneconomy FROM money WHERE id = ${ButtonMember.id}`, {
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
                    }
                    if (m_baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle("Камень ножницы бумага")
                            .setDescription(`${member}, вы не можете принять дуэль, вам выдан бан экономики, длительность: Навсегда`)
                            .setColor(config.colorError);
                        await ButtonInteraction.reply({
                            embeds: [banEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (m_balance < money) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Камень ножницы бумага")
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
                    answer++;
                    member = ButtonMember;
                    await connection
                        .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const row1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsStone')
                                .setEmoji('<:stone:1109961965352267796>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsScissors')
                                .setEmoji('<:scissors1:1109961966711210085>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsPaper')
                                .setEmoji('<:paper:1109961969085206528>')
                                .setStyle(2),
                        )
                    const EmbedAuthorMotion = new EmbedBuilder()
                        .setTitle("Камень ножницы бумага")
                        .setColor(config.color)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`**Ход ${author}: Ожидается...**\nХод ${member}: ${m_motion}`);
                    await ButtonInteraction.update({
                        content: `${author}`,
                        embeds: [EmbedAuthorMotion],
                        components: [row1],
                    })

                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRpsStone' || ButtonInteraction.customId === 'buttonRpsScissors' || ButtonInteraction.customId === 'buttonRpsPaper';

                    const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

                    collector1.on('collect', async ButtonInteraction => { ////////////////ожидание хода автора member = member answer = 1
                        if (ButtonInteraction.user.id != author.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        answer++/////////////////////// a_mention = ход m_mention = Не сделан member = member answer = 2 temp = id кнопки автора
                        temp = ButtonInteraction.customId
                        switch(temp) {
                            case 'buttonRpsStone':
                                a_motion = 'Камень';
                                break;
                            case 'buttonRpsScissors':
                                a_motion = 'Ножницы';
                                break;
                            case 'buttonRpsPaper':
                                a_motion = 'Бумага';
                                break;
                        }
                        const row2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsStone1')
                                .setEmoji('<:stone:1109961965352267796>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsScissors1')
                                .setEmoji('<:scissors1:1109961966711210085>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsPaper1')
                                .setEmoji('<:paper:1109961969085206528>')
                                .setStyle(2),
                        )
                        const EmbedMemberMotion = new EmbedBuilder()
                            .setTitle("Камень ножницы бумага")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`Ход ${author}: Сделан\n**Ход ${member}: Ожидается...**`);
                        await ButtonInteraction.update({
                            content: `${member}`,
                            embeds: [EmbedMemberMotion],
                            components: [row2],
                        })

                        const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonRpsStone1' || ButtonInteraction.customId === 'buttonRpsScissors1' || ButtonInteraction.customId === 'buttonRpsPaper1';

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
                            answer++/////////////////////// a_mention = ход m_mention = ход member = member answer = 3 temp = id кнопки member
                            temp = ButtonInteraction.customId
                            switch(temp) {
                                case 'buttonRpsStone1':
                                    m_motion = 'Камень';
                                    break;
                                case 'buttonRpsScissors1':
                                    m_motion = 'Ножницы';
                                    break;
                                case 'buttonRpsPaper1':
                                    m_motion = 'Бумага';
                                    break;
                            }
                            if (a_motion == m_motion) { //-------------ничья
                                const EmbedDrow = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}

${config.emojis.dot} Ничья

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedDrow],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor('#ffff00')
                                    .setDescription(EmbedDrow())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                            if ((a_motion == 'Камень' && m_motion == 'Ножницы') || (a_motion == 'Ножницы' && m_motion == 'Бумага') || (a_motion == 'Бумага' && m_motion == 'Камень')) { // ----------автор
                                const EmbedWinAuthor = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${author}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedWinAuthor],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            } else { //--------------------member
                                const EmbedWinMember = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${member}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedWinMember],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
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
                                const EmbedTimeout = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
${member} О-о-очень долго думал
                                    
${config.emojis.dot} Победитель: ${author}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await interaction.editReply({
                                    content: '',
                                    embeds: [EmbedTimeout],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
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
                                .setTitle("Камень ножницы бумага")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author} О-о-очень долго думал
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${member}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

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
                                .setTitle("Камень ножницы бумага")
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
                            .setTitle("Камень ножницы бумага")
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
                        .setDescription(`${ButtonMember}, вы не можете принять свою дуэль`);
                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                if (m_baneconomy == 1) {
                    const banEmbed = new EmbedBuilder()
                        .setTitle("Камень ножницы бумага")
                        .setDescription(`${author}, вы не можете предложить дуэль ${member}`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [banEmbed],
                        ephemeral: true
                    }) 
                    return
                }

                if (m_balance < money) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Камень ножницы бумага")
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
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonRpsReject')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Камень ножницы бумага")
                    .setColor(config.color)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author} хочет сразиться с ${member} на ${money}${emoji}`);
                await interaction.reply({
                    content: `${member}`,
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
                    temp = ButtonInteraction.customId;
                    if (temp == 'buttonRpsReject') {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Камень ножницы бумага")
                            .setColor(config.colorError)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} не хочет с вами сражаться`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            components: []
                        })
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        return
                    }
                    answer++;
                    await connection
                        .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const row1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsStone')
                                .setEmoji('<:stone:1109961965352267796>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsScissors')
                                .setEmoji('<:scissors1:1109961966711210085>')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonRpsPaper')
                                .setEmoji('<:paper:1109961969085206528>')
                                .setStyle(2),
                        )
                    const EmbedAuthorMotion = new EmbedBuilder()
                        .setTitle("Камень ножницы бумага")
                        .setColor(config.color)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`**Ход ${author}: Ожидается...**\nХод ${member}: ${m_motion}`);
                    await ButtonInteraction.update({
                        content: `${author}`,
                        embeds: [EmbedAuthorMotion],
                        components: [row1],
                    })

                    const filter = (ButtonInteraction) => (ButtonInteraction.customId === 'buttonRpsStone' || ButtonInteraction.customId === 'buttonRpsScissors' || ButtonInteraction.customId === 'buttonRpsPaper') && answer == 1;

                    const collector1 = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                    collector1.on('collect', async ButtonInteraction => { ////////////////ожидание хода автора member = member answer = 1
                        if (ButtonInteraction.user.id != author.id) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                            await ButtonInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        answer++/////////////////////// a_mention = ход m_mention = Не сделан member = member answer = 2 temp = id кнопки автора
                        temp = ButtonInteraction.customId
                        switch(temp) {
                            case 'buttonRpsStone':
                                a_motion = 'Камень';
                                break;
                            case 'buttonRpsScissors':
                                a_motion = 'Ножницы';
                                break;
                            case 'buttonRpsPaper':
                                a_motion = 'Бумага'
                                break;
                        }
                        const EmbedMemberMotion = new EmbedBuilder()
                            .setTitle("Камень ножницы бумага")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`Ход ${author}: Сделан\n**Ход ${member}: Ожидается...**`);
                        await ButtonInteraction.update({
                            content: `${member}`,
                            embeds: [EmbedMemberMotion],
                            components: [row1],
                        })

                        const filter = ButtonInteraction => (ButtonInteraction.customId === 'buttonRpsStone' || ButtonInteraction.customId === 'buttonRpsScissors' || ButtonInteraction.customId === 'buttonRpsPaper') && answer == 2;

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
                            answer++/////////////////////// a_mention = ход m_mention = ход member = member answer = 3 temp = id кнопки member
                            temp = ButtonInteraction.customId
                            switch(temp) {
                                case 'buttonRpsStone':
                                    m_motion = 'Камень';
                                    break;
                                case 'buttonRpsScissors':
                                    m_motion = 'Ножницы';
                                    break;
                                case 'buttonRpsPaper':
                                    m_motion = 'Бумага';
                                    break;
                            }
                            if (a_motion == m_motion) { //-------------ничья
                                const EmbedDrow = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}

${config.emojis.dot} Ничья

Баланс ${author}: ${a_balance} ${emoji}
Баланс ${member}: ${m_balance} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedDrow],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id} OR id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor('#ffff00')
                                    .setDescription(EmbedDrow())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            }
                            if ((a_motion == 'Камень' && m_motion == 'Ножницы') || (a_motion == 'Ножницы' && m_motion == 'Бумага') || (a_motion == 'Бумага' && m_motion == 'Камень')) { // ----------автор
                                const EmbedWinAuthor = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${author}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedWinAuthor],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor('#00ff00')
                                    .setDescription(embedAuthor())
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp();;
                                await logChannel.send({
                                    embeds: [logEmbed],
                                })
                                return
                            } else { //--------------------member
                                const EmbedWinMember = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${member}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}
`)
                                await ButtonInteraction.update({
                                    content: '',
                                    embeds: [EmbedWinMember],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${member.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
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
                                const EmbedTimeout = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`Ход ${author}: ${a_motion}
${member} О-о-очень долго думал
                                    
${config.emojis.dot} Победитель: ${author}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

Баланс ${author}: ${a_balance+money-fee} ${emoji}
Баланс ${member}: ${m_balance-money} ${emoji}
`)
                                await interaction.editReply({
                                    content: '',
                                    embeds: [EmbedTimeout],
                                    components: [],
                                })
                                await connection
                                    .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (a_ghost == 1 || m_ghost == 1) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Камень ножницы бумага")
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
                                .query(`UPDATE money SET money = money+${money*2} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedTimeout = new EmbedBuilder()
                                .setTitle("Камень ножницы бумага")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author} О-о-очень долго думал
Ход ${member}: ${m_motion}
                                    
${config.emojis.dot} Победитель: ${member}
${config.emojis.dot} Выигрыш составил: ${money-fee} ${emoji}
${config.emojis.dot} Комиссия: ${fee} ${emoji}

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
                                .setTitle("Камень ножницы бумага")
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
                            .setTitle("Камень ножницы бумага")
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

