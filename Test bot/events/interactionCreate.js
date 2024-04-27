const { Events, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction, connection) {
        const { default: chalk } = await import('chalk')
        try {
            if (interaction.isButton()) {
                const admin = interaction.member;
                const author = interaction.member;
                if (interaction.isButton()) {
                    if (interaction.customId === 'buttonMafiaClose' || interaction.customId === 'buttonCloseClose' ) {
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
                if (interaction.customId === 'ButtonAwardYes' || interaction.customId === 'ButtonAwardNo') {
                    await interaction.deferUpdate();
                    const commandAuthor = interaction.member;
                    const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logAward}`);
                    const Payroll = await interaction.guild.channels.cache.find(channel1 => channel1.name === `991686914472149143`);
                    const emoji = config.emoji;
                    let ghost = 0;
                    let bank;
                    let authorAward;
                    let money
                    let m_id;
                    let sqlResult;
                    let sqlResult1;
                    if (commandAuthor.id != '432199748699684864' && commandAuthor.id != '636680188213592085') {
                        return
                    }
                    let mems = Array.from(interaction.message.mentions.users.values())
                    if (interaction.customId === 'ButtonAwardNo') {
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("Award")
                            .setDescription(`${author}, Заявка отклонена`)
                            .setColor("#ff0000")
                            .setTimestamp()
                        await interaction.message.edit({
                            embeds: [LogEmbed],
                            components: []
                        })
                        await connection
                            .query(`DELETE from awards WHERE message = ${interaction.message.id}`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        return
                    }
                    await connection
                        .query(`SELECT COUNT(member) as count FROM awards WHERE message = ${interaction.message.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    const count = sqlResult[0].count;
                    if (count == 0) {
                        await interaction.message.edit({
                            content: `${commandAuthor}, произошла ошибка`,
                        })
                        return
                    }
                    await connection
                        .query(`SELECT author, member, money FROM awards WHERE message = ${interaction.message.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    const author = await interaction.guild.members.fetch(sqlResult[0].author)
                    await interaction.message.edit({
                        content: `${interaction.member}, операция выполняется...`,
                        embeds: [],
                        components: []
                    })
                    for (let i = 0; i < count; i++) {
                        m_id = sqlResult[i].member
                        money = sqlResult[i].money
                        await connection
                            .query(`SELECT bank, ghost FROM money WHERE id = ${m_id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => sqlResult = result)
                            .catch(async (err) => {
                                await interaction.reply({
                                    content: `${commandAuthor}, произошла ошибка`,
                                })
                                console.log(`SQL: Error ${err}`)
                                return
                            })
                        if (sqlResult[0] === undefined) {
                            await connection
                                .query(`INSERT INTO money (id, bank) VALUES (${m_id}, ${money});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            await connection
                                .query(`UPDATE money SET bank = bank+${money} WHERE id = ${m_id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        }
                        const Embed = new EmbedBuilder()
                            .setDescription(`${commandAuthor} выдал ${money}${emoji} пользователю <@${m_id}>`)
                            .setColor(`${config.color}`)
                        await interaction.channel.send({
                            embeds: [Embed],
                        })
                        if (!sqlResult[0].ghost) {
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("Award button")
                                .setDescription(`[1] Администратор: ${admin}(${admin.id})\n[2] Заявитель: ${author}(${author.id})\n[3] Пользователь: <@${m_id}>(${m_id})\n[4] Сколько: ${money}(${emoji})\n[5] Старый баланс: ${sqlResult1[i].bank} ${emoji}\n[6] Старый баланс: ${sqlResult1[i].bank+money} ${emoji}`)
                                .setColor("#ff0000")
                                .setFooter({text: `${m_id} • ${interaction.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [LogEmbed],
                            })
                        }
                    }
                    const embed = new EmbedBuilder()
                        .setTitle("Выдача валюты")
                        .setDescription(`${author}, всем выдано ${money}${emoji}!`)
                        .setColor(config.color);
                    interaction.channel.send({
                        embeds: [embed],
                    })
                    await connection
                        .query(`DELETE FROM awards WHERE message = ${interaction.message.id};`, {
                            type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    return
                }
                if (interaction.customId === 'buttonEventClose') {
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
                if (interaction.customId === 'ButtonVerefBoy' || interaction.customId === 'ButtonVerefGirl' || interaction.customId === 'ButtonVerefNA') {
                    let msg;
                    const logChannelRoles = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    const Embed = new EmbedBuilder()
                        .setTitle("Выдача гендера")
                        .setDescription(`\`\`\`ini
ведите [ID] пользователя
\`\`\``)
                        .setColor(config.color)
                    await interaction.reply({
                        content: `${interaction.member}`,
                        embeds: [Embed],
                        ephemeral: true,
                        fetchReply: true
                    })
                    .then ((mes) => {
                        msg = mes
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async message => {
                        collector1.stop()
                        await message.delete()
                        .catch((err) => {

                        })
                        let member = await interaction.guild.members.fetch(message.content)
                        if (!member) {
                            await message.reply({
                                content: 'пользователь не найден',
                                ephemeral: true,
                            })
                            return
                        }
                        let roleGirl = await interaction.guild.roles.fetch('1111399415836585984')
                        .catch((err) => {

                        })
                        let roleBoy = await interaction.guild.roles.fetch('1111399030266806372')
                        .catch((err) => {

                        })
                        let roleNA = await interaction.guild.roles.fetch('1111399549995589724')
                        .catch((err) => {

                        })
                        if (interaction.customId === 'ButtonVerefNA') {
                            await member.roles.add(roleNA)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleGirl)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleNA}(${roleNA.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                        if (member.user.createdTimestamp > Date.now()-1000*60*60*24*5) {
                            const embed = new EmbedBuilder()
                                .setTitle("Внимание!")
                                .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                                .setDescription(`\`\`\`ini
Данный аккаунт создан менее [5 дней] назад, верефикация невозможна
\`\`\``)
                                .setColor(config.colorError)
                            await message.reply({
                                embeds: [embed],
                                ephemeral: true,
                            })
                            return
                        }
                        if (interaction.customId === 'ButtonVerefGirl') {
                            await member.roles.add(roleGirl)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleGirl}(${roleGirl.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        } else if (interaction.customId === 'ButtonVerefBoy') {
                            await member.roles.add(roleBoy)
                            await member.roles.remove(roleGirl)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleBoy}(${roleBoy.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                    })
                }
                if (interaction.customId === 'buttonEventClose') {
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
                if (interaction.customId === 'buttonCaseProfileOpen') {
                    let sqlResult
                    let balance = 0;
                    let ghost = 0;
                    let baneconomy = 0;
                    let jailtime = 0;
                    let casesProfile = 0;
                    let title = 'Открыть кейс'
                    let now = Date.now()
                    await connection
                        .query(`SELECT money, jailtime, baneconomy, cases, ghost FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle(title)
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
                        baneconomy = sqlResult[0].baneconomy
                        jailtime = sqlResult[0].jailtime
                        casesProfile = sqlResult[0].cases
                        ghost = sqlResult[0].ghost
                    }
                    if (baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle(title)
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
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                        await interaction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    await connection
                        .query(`UPDATE money SET cases = cases - 1 WHERE id = ${author.id}`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    let number = Math.floor(Math.random() * 100)+1;
                    if (number > 0 && number <= 41) {
                        rare = "common";
                    }
                    if (number > 41 && number <= 71) {
                        rare = "rare";
                    }
                    if (number > 71 && number <= 91) {
                        rare = "epic";
                    }
                    if (number > 91 && number <= 98) {
                        rare = "legendary";
                    }
                    if (number > 98 && number <=100) {
                        rare = "mythical";
                    }
                    let profile = config.profiles[rare][Math.floor(Math.random() * config.profiles[rare].length)]
                    const Embed = new EmbedBuilder()
                        .setDescription('Открываем кейс...')
                        .setImage(profile.caseURL)
                    await interaction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                    await wait(5000)
                    Embed
                        .setDescription(`Вам выпал профиль: **${profile.name}**`)
                        .setImage(profile.afterURL)
                    await interaction.editReply({
                        embeds: [Embed]
                    })
                    await connection
                        .query(`INSERT INTO profiles (id, profile, count) VALUES (${author.id}, '${profile.name}', 1) ON DUPLICATE KEY UPDATE count=count+1;`, {
                            type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    if (!ghost) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle(`Открытие кейса`)
                            .setColor('#0000ff')
                            .setDescription(`[1] ${author}(${author.id})
[2] Выпало: ${profile.name}
[3] Редкость: ${rare}
[3] Количество кейсов: ${casesProfile-1}`)
                        await logChannelCasino.send({
                            embeds: [logEmbed],
                        })
                    }
                }
                if (interaction.customId === 'buttonCaseBuy') {
                    let balance = 0;
                    let title = 'Купить кейсы'
                    const modal = new ModalBuilder()
                        .setCustomId('modalCaseProfileBuy')
                        .setTitle('Купить кейсы');
                    const input = new TextInputBuilder()
                        .setCustomId('modalCaseProfileBuyInput')
                        .setLabel('Введите количество')
                        .setPlaceholder('1')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(input)
                    modal.addComponents(firstActionRow)
                    await interaction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalCaseProfileBuy';
                    interaction.awaitModalSubmit({filter, time: 300000 })
                    .then(async ModalInteraction => {
                        let countInput = ModalInteraction.components[0].components[0].value
                        let count = parseInt(countInput)
                        if (!count || count < 1) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, введите корректное значение`);
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await connection
                            .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => balance = result[0].money ?? 0)
                        if (count*250 > balance) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, у вас недостаточно средств, нужно ${count*250} ${config.emoji}\n\nВаш баланс: ${balance}${config.emoji}`);
                            await ModalInteraction.reply({
                                embeds: [errorEmbed],
                                ephemeral: true
                            })
                            return
                        }
                        await connection
                            .query(`UPDATE money SET cases = cases + ${count}, money = money - ${count*250} WHERE id = ${author.id}`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы успешно купили ${count} кейсов с профилями\n\nВаш новый баланс: ${balance-count*250}${config.emoji}`)
                            .setColor(config.color);
                        await ModalInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                        if (!ghost) {
                            const logEmbed = new EmbedBuilder()
                                .setTitle(`Покупка кейсов`)
                                .setColor('#00ff00')
                                .setDescription(`[1] ${author}(${author.id})
[2] Кейсов: ${count}
[3] Старый баланс: ${balance}
[4] Новый баланс: ${balance-count*250}`)
                            await logChannelCasino.send({
                                embeds: [logEmbed],
                            })
                        }
                        return
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                }
                if (interaction.customId === 'buttonCaseGet') {
                    let sqlResult
                    let baneconomy = 0;
                    let jailtime = 0;
                    let casesProfile = 0;
                    let caseTime = 0;
                    let currentTimestamp = Date.now();
                    let bypass = 0
                    let title = 'Ежедневная награда'
                    await connection
                        .query(`SELECT money, jailtime, baneconomy, cases, casetime FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            const lockEmbed = new EmbedBuilder()
                                .setTitle(title)
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
                        baneconomy = sqlResult[0].baneconomy
                        jailtime = sqlResult[0].jailtime
                        casesProfile = sqlResult[0].cases
                        caseTime = sqlResult[0].casetime
                    }
                    if (baneconomy == 1) {
                        const banEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                            .setColor(config.colorError);
                        await interaction.reply({
                            embeds: [banEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (jailtime > currentTimestamp) {
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
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                        await interaction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if ((caseTime > currentTimestamp) && (bypass !== 1)) {
                        let time = caseTime - currentTimestamp
                        let sec = Math.floor(time/1000%60);
                        let min = Math.floor(time/1000/60%60);
                        let hours = Math.floor(time/1000/60/60%24);
                        let result = `${hours}h ${min}m ${sec}s`;
                        const cooldownEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, забирать бесплатный кейс можно раз в 24 часа\n\n\\Вы cможете использовать ещё раз через ${result}`)
                            .setColor(config.colorError)
                        interaction.reply({
                            embeds: [cooldownEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    await connection
                        .query(`UPDATE money SET cases = cases + 1, casetime = ${Date.now()+1000*60*60*24} WHERE id = ${author.id}`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const Embed = new EmbedBuilder()
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription('Вы получили бесплатный кейс')
                    await interaction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                    if (!ghost) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle(`Получение кейсов`)
                            .setColor('#0000ff')
                            .setDescription(`[1] ${author}(${author.id})
[2] Кейсов: ${1}
[3] Старый баланс: ${balance}
[4] Новый баланс: ${balance}`)
                        await logChannelCasino.send({
                            embeds: [logEmbed],
                        })
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