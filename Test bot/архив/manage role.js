const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const { get } = require('mongoose');
const wait = require('node:timers/promises').setTimeout;
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rolemanage')
		.setDescription('в разработке')
        .addRoleOption( option => 
            option.setName('role')
            .setDescription('роль')
            .setRequired(true)),
        async execute(interaction, connection, lockedCommands) {
        const author = interaction.member;
		const role = interaction.options.getRole('role');
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logroles}`)
        let name;
        let color;
        let ownerrole;
        let timestamp;
        let cost;
        let buycount;
        let balance
		let baneconomy = 0;
        let sqlResult;
        let message;
        let answer = 0;
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Меню управления ролями")
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
                .query(`SELECT baneconomy, money FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                baneconomy = sqlResult[0].baneconomy
                balance = sqlResult[0].money
            }

            if (baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            await connection
                .query(`SELECT * FROM tmroles WHERE roleid = ${role.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined || sqlResult[0].authorid !== author.id) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('Меню управления ролями')
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, это не ваша роль`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            cost = sqlResult[0].cost
            buycount = sqlResult[0].bought
            timestamp = sqlResult[0].timestamp

            let sell = (cost) => {
                if (cost == 0) {
                    return `Нет`
                } else {
                    return 'Да'
                }
            }
            let costInEmbed = (cost) => {
                if (cost == 0) {
                    return `---`
                } else {
                    return `**${cost}** ${emoji}`
                }
            }
            let two = n => (n > 9 ? "" : "0") + n;
            let format = now =>
                two(now.getDate()) + "." +
                two(now.getMonth() + 1) + "." +
                now.getFullYear() + " " +
                two(now.getHours()) + ":" +
                two(now.getMinutes()) + ":" +
                two(now.getSeconds());
            let now = new Date(role.createdTimestamp);
            let roleCreatedAt = format(now)
            now = new Date(timestamp)
            let roleEndAt = format(now)
            let rightNow = Date.now()
            if (timestamp < rightNow) {
                now = new Date(timestamp+1000*60*60*24*7)
                roleEndAt = format(now)
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditName')
                            .setLabel('изменить название')
                            .setStyle(1)
                            .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditColor')
                            .setLabel('изменить цвет')
                            .setStyle(1)
                            .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditCost')
                            .setLabel('изменить цену')
                            .setStyle(1)
                            .setDisabled(true),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleExtend')
                            .setLabel('продлить роль')
                            .setStyle(1)
                            .setDisabled(true),
                    )
                const Embed = new EmbedBuilder()
                    .setTitle(`Управление ролью ${role.name}`)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Роль: ${role}
                    ID роли: **${role.id}**
                    Цвет: #**${role.color.toString(16)}**
                    Владелец: ${author}
                    
                    Продаётся: **${sell(cost)}**
                    Цена: ${costInEmbed(cost)}
                    Продана раз: **${buycount}**
                    Создана: **${roleCreatedAt}**
                    Будут удалена: **${roleEndAt}**`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [Embed],
                    components: [row],
                })
                return
            }
            const row = new ActionRowBuilder()
                .addComponents(
                new ButtonBuilder()
                        .setCustomId('buttonManageRoleEditName')
                        .setLabel('изменить название')
                        .setStyle(1),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonManageRoleEditColor')
                        .setLabel('изменить цвет')
                        .setStyle(1),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonManageRoleEditCost')
                        .setLabel('изменить цену')
                        .setStyle(1),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonManageRoleExtend')
                        .setLabel('продлить роль')
                        .setStyle(1),
                )
            const Embed = new EmbedBuilder()
                .setTitle(`Управление ролью ${role.name}`)
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`Роль: ${role}
                ID роли: **${role.id}**
                Цвет: #**${role.color.toString(16)}**
                Владелец: ${author}
                
                Продаётся: **${sell(cost)}**
                Цена: ${costInEmbed(cost)}
                Продана раз: **${buycount}**
                Создана: **${roleCreatedAt}**
                Действует до: **${roleEndAt}**`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then ((send) => {
                message = send
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleEditName' || ButtonInteraction.customId === 'buttonManageRoleEditColor' || ButtonInteraction.customId === 'buttonManageRoleEditCost' || ButtonInteraction.customId === 'buttonManageRoleExtend';

            const collector = message.createMessageComponentCollector({filter, time: 60000 });

            collector.on('collect', async ButtonInteraction => {
                if (ButtonInteraction.user.id != author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('Меню управления ролями')
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${ButtonInteraction.user}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                }
                answer++
                let buttonId = ButtonInteraction.customId
                if (buttonId == 'buttonManageRoleEditName') {
                    if (balance < 1000) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${role.name}`)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, у вас недостаточно средств, для изменения роли нужно: 1000 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                        await ButtonInteraction.update({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    const Embed = new EmbedBuilder()
                        .setTitle(`Меню управления ролью ${role.name}`)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription(`${author}, укажите новое название роли`);
                    await ButtonInteraction.update({
                        embeds: [Embed],
                        components: [],
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async messageEditRole => {
                        if (messageEditRole.content.lenght <= 100) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(`Меню управления ролью ${role.name}`)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода названия, маскимальное количество символов: 100`)
                            await messageEditRole.reply({
                                embeds: [errorEmbed],
                            }) 
                            return 
                        }
                        await connection
                            .query(`UPDATE money SET money = money-1000 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        role.edit({
                            name: messageEditRole.content
                        })
                        const Embed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${messageEditRole.content}`)
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы успешно изменили название у роли ${role}`);
                        await interaction.editReply({
                            embeds: [Embed],
                        })
                        collector1.stop()
                    })
                }
                if (buttonId == 'buttonManageRoleEditColor') {
                    if (balance < 1000) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${role.name}`)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, у вас недостаточно средств, для изменения роли нужно: 1000 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                        await ButtonInteraction.update({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    const Embed = new EmbedBuilder()
                        .setTitle(`Меню управления ролью ${role.name}`)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription(`${author}, укажите новый цвет роли`);
                    await ButtonInteraction.update({
                        embeds: [Embed],
                        components: [],
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async messageEditRole => {
                        if (messageEditRole.indexOf('#')!=0 || !(messageEditRole.length == 7) || parseInt(messageEditRole.replace('#',''), 16).toString(16) !== messageEditRole.replace('#','')) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(`Меню управления ролью ${role.name}`)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода цвета, пример ввода цвета: #ff0000`)
                            await messageEditRole.reply({
                                embeds: [errorEmbed],
                            }) 
                            return 
                        }
                        await connection
                            .query(`UPDATE money SET money = money-1000 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        role.edit({
                            color: messageEditRole.content
                        })
                        const Embed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${role.name}`)
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы успешно изменили цвет у роли ${role}`);
                        await interaction.editReply({
                            embeds: [Embed],
                        })
                        collector1.stop()
                    })
                }
                if (buttonId == 'buttonManageRoleEditCost') {
                    const Embed = new EmbedBuilder()
                        .setTitle(`Меню управления ролью ${role.name}`)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription(`${author}, укажите новую цену роли`);
                    await ButtonInteraction.update({
                        embeds: [Embed],
                        components: [],
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async messageEditRole => {
                        if (parseInt(messageEditRole.content) != messageEditRole.content) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(`Меню управления ролью ${role.name}`)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, проверьте правильность ввода стоимости роли, пример ввода: 1000`)
                            await messageEditRole.reply({
                                embeds: [errorEmbed],
                            }) 
                            return 
                        }
                        await connection
                            .query(`UPDATE tmroles SET cost = ${messageEditRole} WHERE roleid = ${role.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        const Embed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${role.name}`)
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы успешно изменили стоимость у роли ${role}`);
                        await interaction.editReply({
                            embeds: [Embed],
                        })
                        collector1.stop()
                    })
                }
                if (buttonId == 'buttonManageRoleExtend') {
                    if (balance < 8000) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(`Меню управления ролью ${role.name}`)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, у вас недостаточно средств, для продления роли нужно: 8000 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                        await ButtonInteraction.update({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    await connection
                        .query(`UPDATE money SET money = money-8000 WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    await connection
                        .query(`UPDATE tmroles SET timestamp = timestamp+${1000*60*60*24*14} WHERE roleid = ${role.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    const Embed = new EmbedBuilder()
                        .setTitle(`Меню управления ролью ${role.name}`)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription(`${author}, вы продлили роль ${role} на 14 дней`);
                    await ButtonInteraction.update({
                        embeds: [Embed],
                        components: [],
                    })
                }
            })
            collector.on('end', async () => {
                if (answer == 1) {
                    return
                } else {
                    const row1 = new ActionRowBuilder()
                        .addComponents(
                        new ButtonBuilder()
                                .setCustomId('buttonManageRoleEditName')
                                .setLabel('изменить название')
                                .setStyle(1)
                                .setDisabled(true),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonManageRoleEditColor')
                                .setLabel('изменить цвет')
                                .setStyle(1)
                                .setDisabled(true),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonManageRoleEditCost')
                                .setLabel('изменить цену')
                                .setStyle(1)
                                .setDisabled(true),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonManageRoleExtend')
                                .setLabel('продлить роль')
                                .setStyle(1)
                                .setDisabled(true),
                        )
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [row1],
                    })
                }
            })
        } catch(err) {
            lockedCommands.push(interaction.commandName)
        }
	}
};