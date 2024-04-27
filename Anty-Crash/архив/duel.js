const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder,} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes, col } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('duel')
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
        const author = interaction.member;
		let member = interaction.options.getUser('member');
        const money = interaction.options.getInteger('money');
        const fee = Math.ceil(money/25)
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
		let a_balance = 0;
        let m_balance = 0;
        let answer = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let message;
        let sqlResult
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Дуель: duel")
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
                .query(`SELECT money, bank, baneconomy FROM money WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Дуель: duel")
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
                a_baneconomy = sqlResult[0].baneconomy
            }

            if (a_baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Дуель: duel")
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
                    .setTitle("Дуель: duel")
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
                    .setTitle("Дуель: duel")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${a_balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }

            if (member == null) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelCreate')
                            .setLabel('принять')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Дуель: duel")
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

                collector.on('collect', async ButtonInteraction => {
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
                    let ButtonMember = ButtonInteraction.user;
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
                        m_baneconomy = 0;
                        m_balance = 0;
                    } else {
                        m_balance = sqlResult[0].money;
                        m_baneconomy = sqlResult[0].baneconomy;
                    }

                    if (m_baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle("Дуель: duel")
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
                            .setTitle("Дуель: duel")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете принять дуэль на ${money} ${emoji}\n\n\\Ваш баланс: ${m_balance} ${emoji}`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    let ratio = Math.floor(Math.random() * 2);
                    answer++;
                    if (ratio == 0) {
                        await connection
                                .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${ButtonMember.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinMember = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`Карты ${author}(${a_score}): ${a_cards}
**Карты ${member}(${m_score}): ${m_cards}**
    
<:dot:1098344713242820798> Победитель: ${member}
<:dot:1098344713242820798> Выигрыш составил: ${money-fee} ${emoji}
<:dot:1098344713242820798> Комиссия: ${fee} ${emoji}
    
Баланс ${author}: ${a_balance-money} ${emoji}
Баланс ${member}: ${m_balance+money-fee} ${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinMember],
                                components: [],
                            })
                            .catch(console.error)
                    } else {
                        await connection
                                .query(`UPDATE money SET money = money-${money} WHERE id = ${ButtonMember.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinAuthor = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`${author}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance+money}${emoji}\n${ButtonMember}, ваш новый баланс ${m_balance-money}${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinAuthor],
                                components: [],
                            })
                            .catch(console.error)
                    }
                });
                collector.on('end', async () => {
                    if (answer = 0) {
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, на ваше предложение никто не ответил`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                    }
                })
            } else { // -----------------------------------------------------------------------дуэль с участником
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

                if (m_baneconomy == 1) {
                    const banEmbed = new EmbedBuilder()
                        .setTitle("Дуель: duel")
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
                        .setTitle("Дуель: duel")
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
                            .setLabel('принять')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelReject')
                            .setLabel('отклонить')
                            .setStyle(2),
                    )
                const embedBattle = new EmbedBuilder()
                    .setTitle("Дуель: duel")
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
                    ButtonMember = ButtonInteraction.user
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
                            .setTitle("Дуэли: roulette")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} не захотел с вами сражаться`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: [],
                        })
                        return
                    }
                    let ButtonMember = ButtonInteraction.user;
                    let ratio = Math.floor(Math.random() * 2);
                    answer++
                    switch(ratio) {
                        case 0:
                            await connection
                                .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${ButtonMember.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinMember = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${ButtonMember}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance-money}${emoji}\n${ButtonMember}, ваш новый баланс ${m_balance+money}${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinMember],
                                components: [],
                            })
                            .catch(console.error)
                        case 1:
                            await connection
                                .query(`UPDATE money SET money = money-${money} WHERE id = ${ButtonMember.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinAuthor = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance+money}${emoji}\n${ButtonMember}, ваш новый баланс ${m_balance-money}${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinAuthor],
                                components: [],
                            })
                            .catch(console.error)
                    }
                });
                collector.on('end', async () => {
                    if (answer = 0){
                        await connection
                            .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedTimeout = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, ${member} проигнорировал ваше предложение`);
                        await interaction.editReply({
                            embeds: [EmbedTimeout],
                            components: []
                        })
                    }
                })
            }
        } catch(err) {
            lockedCommands.push(interaction.commandName)
        }
	}
};

