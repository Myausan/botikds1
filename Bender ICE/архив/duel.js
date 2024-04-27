const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder,} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes, col } = require('sequelize');
const chalk = require(chalk);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('duel')///////////////////////////////////////////оформление + логи
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
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
		let a_balance = 0;
        let m_balance = 0;
        let answer = 0;
		let a_baneconomy = 0;
        let m_baneconomy = 0;
        let a_ghost = 0;
        let m_ghost = 0;
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
                .query(`SELECT money, bank, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
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
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                a_balance = sqlResult[0].money;
                a_baneconomy = sqlResult[0].baneconomy
                a_ghost = sqlResult[0].ghost
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
            let embedMember = () => {
                let text = `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Выиграл: ${member}
[8] Выигрыш: ${money-fee} ${emoji}
[9] Новый баланс ${author}: ${a_balance-money}
[10] Новый баланс ${member}: ${m_balance+money-fee}`;
            }
            let embedAuthor = () => {
                `[1] ${author}(${author.id})
[2] ${member}(${member.id})
[3] Старый баланс ${author}: ${a_balance}${emoji}
[4] Старый баланс ${member}: ${m_balance}${emoji}
[5] Ставка: ${money}${emoji}
[6] Комиссия: ${fee}${emoji}(4%)
[7] Выиграл: ${author}
[8] Выигрыш: ${money-fee} ${emoji}
[9] Новый баланс ${author}: ${a_balance+money-fee}
[10] Новый баланс ${member}: ${m_balance-money}`
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
                            .setStyle(1),
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
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id === author.id) {
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
                        .query(`SELECT money, bank, baneconomy, ghost FROM money WHERE id = ${ButtonMember.id}`, {
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
                        m_ghost = sqlResult[0].ghost
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
                    member = ButtonMember
                    let ratio = Math.floor(Math.random() * 2);
                    answer++;
                    if (ratio == 0) {
                        await connection
                            .query(`UPDATE money SET money = money+${money-fee} WHERE id = ${member.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedWinMember = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${member}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance-money}${emoji}\n${member}, ваш новый баланс ${m_balance+money*fee}${emoji}`);
                        await ButtonInteraction.update({
                            embeds: [EmbedWinMember],
                            components: [],
                        })
                        if (a_ghost == 1 || m_ghost == 1) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setColor('#00ff00')
                            .setDescription(embedMember())
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();;
                        await logChannel.send({
                            embeds: [logEmbed],
                        })
                    } else {
                        await connection
                            .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        await connection
                            .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const EmbedWinAuthor = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance+money}${emoji}\n${member}, ваш новый баланс ${m_balance-money}${emoji}`);
                        await ButtonInteraction.update({
                            embeds: [EmbedWinAuthor],
                            components: [],
                        })
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Дуель: duel")
                            .setColor('#00ff00')
                            .setDescription(embedAuthor())
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp();
                        await logChannel.send({
                            embeds: [logEmbed],
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
                    m_ghost = sqlResult[0].ghost
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
                await connection
                    .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelAccept')
                            .setLabel('принять')
                            .setStyle(1),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonDuelReject')
                            .setLabel('отклонить')
                            .setStyle(1),
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
                                .query(`UPDATE money SET money = money+${fee} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinMember = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${member}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance-money}${emoji}\n${member}, ваш новый баланс ${m_balance+money}${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinMember],
                                components: [],
                            })
                            .catch(console.error)
                        case 1:
                            await connection
                                .query(`UPDATE money SET money = money-${money} WHERE id = ${member.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`UPDATE money SET money = money+${money*2-fee} WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const EmbedWinAuthor = new EmbedBuilder()
                                .setTitle("Дуель: duel")
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы выиграли ${money}${emoji}\n\n${author}, ваш новый баланс: ${a_balance+money}${emoji}\n${member}, ваш новый баланс ${m_balance-money}${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [EmbedWinAuthor],
                                components: [],
                            })
                            .catch(console.error)
                    }
                });
                collector.on('end', async () => {
                    if (answer == 0){
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

