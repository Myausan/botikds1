const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clan')
        .setDescription('клан')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("создать клан")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("delete")
                .setDescription("удалить клан")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("invite")
                .setDescription("Пригласть пользователя в клан")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("kick")
                .setDescription("Выгнать пользователя из клана")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("leave")
                .setDescription("Покинуть клан")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("edit")
                .setDescription("Изменить клан")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("profile")
                .setDescription("Посмотрить профиль клана")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("members")
                .setDescription("Посмотреть участников клана")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("shop")
                .setDescription("Посмотреть магазин клана")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("transfer")
                .setDescription("Передать роль главы клана")
                .addUserOption(option =>
                    option
                        .setName("member")
                        .setDescription("Пользователь")
                        .setRequired(true)
                )
        ),
    async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const memberUser = interaction.options.getUser('member');
		const emoji = config.emoji;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembersEconomy}`)
        let member
		let a_balance = 0;
        let a_jailtime = 0;
		let a_baneconomy = 0;
        let a_ghost = 0;
        let a_clanId = 0;
        let a_permLevel = 1;
        let m_balance = 0;
        let m_jailtime = 0;
		let m_baneconomy = 0;
        let m_clanId = 0;
        let m_permLevel = 1;
        let parantId;
        let roleId;
        let clanName = '';
        let clanMaxMembers = 0;
        let clanMembers = 0;
        let clanMoney = 0;
        let clanDescription;
        let status = 'start';
        let title = '';
        let sqlResult;
        let now = Date.now()
        if (memberUser) {
            member = await interaction.guild.members.fetch(memberUser.id)
        }
        switch (subcommand) {
            case 'create': title='Создание клана';break;
            case 'delete': title='Удаление клана';break;
            case 'invite': title='Добавление участника в клан';break;
            case 'kick': title='Удаление частника из клана';break;
            case 'leave': title='Выход из клана';break;
            case 'edit': title='Изменение клана клана';break;
            case 'profile': title='Профиль клана';break;
            case 'members': title='Участники клана';break;
            case 'shop': title='Магазин клана';break;
            case 'transfer': title='Передача роли овнера клана';break;
        }
        if (lockedCommands.includes(interaction.commandName + ' ' + subcommand)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle(title)
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
                .query(`SELECT money.money, money.baneconomy, money.jailtime, money.ghost, clanmembers.member, clanmembers.clanid, clanmembers.permlevel FROM money LEFT JOIN clanmembers ON money.id = clanmembers.member WHERE money.id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => {
                    sqlResult = result
                })
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
            console.log(1)
            a_balance = sqlResult[0].money
            a_baneconomy = sqlResult[0].baneconomy
            a_jailtime = sqlResult[0].jailtime
            a_ghost = sqlResult[0].ghost
            a_clanId = sqlResult[0].clan
            a_permLevel = sqlResult[0].permlevel
            console.log(2)
            if (member) {
                console.log(3)
                await connection
                    .query(`SELECT money.money, money.baneconomy, money.jailtime, money.ghost, clanmembers.member, clanmembers.clanid, clanmembers.permlevel LEFT JOIN clanmembers ON money.id = clanmembers.member WHERE money.id = ${author.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => {
                        sqlResult = result
                    })
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
                m_balance = sqlResult[0].money
                m_baneconomy = sqlResult[0].baneconomy
                m_jailtime = sqlResult[0].jailtime
                m_clanId = sqlResult[0].clan
                m_permLevel = sqlResult[0].permlevel
                console.log(4)
            }
            let checkPerms = (permsMember, permsNeeded) => {
                if (permsMember >= permsNeeded) {
                    return true
                } else {
                    return false
                }
            }
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setThumbnail(author.user.displayAvatarURL())
            if (subcommand === 'create') {
                console.log(5)
                if (a_clanId) {
                    embed
                        .setDescription(`${author}, вы уже состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                await connection
                .query(`SELECT COUNT(clanid) as count FROM clans`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => {
                    sqlResult = result
                })
                .catch((err) => {
                })
                if (sqlResult[0].count > 6) {
                    embed
                        .setDescription(`${author}, подожди, сука, пока будет место`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_balance < 15000) {
                    embed
                        .setDescription(`${author}, у вас недостаточно средств для создания клана. Вам нужно 15000${emoji}`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                const rowAgree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanYes')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanNo')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2),
                    )
                embed
                    .setDescription(`${author}, для создания клана нужно 15000${emoji}. Вы хотите совершить данную операцию?`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowAgree],
                    fetchReply: true,
                })
                .then ((send) => {
                    message = send
                })
                status = 'agree'
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonClanYes' || ButtonInteraction.customId === 'buttonClanNo';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user
                    if (ButtonInteraction.user.id !== author.id) {
                        embed
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                        return
                    }
                    status = 'end'
                    if (ButtonInteraction.customId === 'buttonClanYes') {
                        await connection
                            .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => {
                            sqlResult = result
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                            return
                        })
                        if (sqlResult[0].money < 15000) {
                            await ButtonInteraction.deferUpdate()
                            embed
                                .setDescription(`${author}, операция отклонена!`)
                                .setColor(config.colorError)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            return
                        }
                        await connection
                            .query(`UPDATE money SET money=money-15000 WHERE id = ${author.id}`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        for (let i = 0; i<rowAgree.components.length; i++) {
                            rowAgree.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            embeds: [embed],
                            components: [rowAgree]
                        })
                        const modal = new ModalBuilder()
                            .setCustomId('modalCreateClan')
                            .setTitle(title);
                        const nameInput = new TextInputBuilder()
                            .setCustomId('modalClanNameInput')
                            .setLabel('Введите название клана')
                            .setPlaceholder('Крутой клан')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const colorInput = new TextInputBuilder()
                            .setCustomId('modalClanColorInput')
                            .setLabel('Введите цвет роли клана')
                            .setPlaceholder('#ff0000')
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(7)
                            .setMaxLength(7)
                            .setRequired(true)
                        const descriptionInput = new TextInputBuilder()
                            .setCustomId('modalClanDescriptionInput')
                            .setLabel('Введите Описание клана')
                            .setPlaceholder('Крутой клан!')
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(50)
                            .setRequired(false)
                        const firstActionRow = new ActionRowBuilder().addComponents(nameInput)
                        const secondActionRow = new ActionRowBuilder().addComponents(colorInput)
                        const thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput)
                        modal.addComponents(firstActionRow).addComponents(secondActionRow).addComponents(thirdActionRow)
                        await ButtonInteraction.showModal(modal);
                        await ButtonInteraction.awaitModalSubmit({ time: 300000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            clanName = ModalInteraction.components[0].components[0].value
                            clanColor = ModalInteraction.components[1].components[0].value
                            clanDescription = ModalInteraction.components[2].components[0].value
                            /*await connection
                                .query(`UPDATE money SET money=money-15000 WHERE id = ${author.id}`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })*/
                            await interaction.guild.roles.create({
                                name: clanName,
                                color: clanColor,
                                reason: 'Clan create'
                            })
                            console.log(`INSERT INTO clans (name, clanowner, members, money, description) VALUES ('${clanName}',${author.id} , 20, 0, '${clanDescription}')`)

                            await connection
                                .query(`INSERT INTO clans (name, clanowner, members, money, description) VALUES ('${clanName}',${author.id} , 20, 0, '${clanDescription}')`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            await connection
                                .query(`SELECT clanid FROM clans WHERE clanowner = ${author.id}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            .then((result) => {
                                sqlResult = result
                            })
                            .catch((err) => {
                                console.log(`SQL: Error ${err}`)
                                return
                            })
                            await connection
                                .query(`INSERT INTO clanmembers (member, clanid, permlevel) VALUES (${author.id},${sqlResult[0].clanowner}, 3)`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            embed
                                .setDescription(`${author}, вы успешно создали клан ${clanName}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            return
                            //логи
                        })
                        .catch(async (err) => {
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonClanNo') {
                        await ButtonInteraction.deferUpdate()
                        embed
                            .setDescription(`${author}, операция отменена!`)
                            .setColor(config.color)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                })
                collector.on('end', async () => {
                    if (status == 'agree') {
                        for (let i = 0; i<rowAgree.components.length;i++) {
                            rowAgree.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowAgree]
                        })
                    }
                })
            }
            if (subcommand === 'delete') {
                if (!a_clanId) {
                    embed
                        .setDescription(`${author}, вы не состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_permLevel < 3) {
                    embed
                        .setDescription(`${author}, вы не являетесь главой клана`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                const rowAgree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanYes')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanNo')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2),
                    )
                embed
                    .setDescription(`${author}, уверенны, что хотите удалить клан?`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowAgree],
                    fetchReply: true,
                })
                .then ((send) => {
                    message = send
                })
                status = 'agree'
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonClanYes' || ButtonInteraction.customId === 'buttonClanNo';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user
                    if (ButtonInteraction.user.id === author.id) {
                        embed
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                        return
                    }
                    await ButtonInteraction.deferUpdate()
                    status = 'end'
                    if (ButtonInteraction.customId === 'buttonClanYes') {
                        await connection
                            .query(`DELETE FROM clans WHERE clanid = ${a_clanId}`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        await connection
                            .query(`DELETE FROM clanmembers WHERE clanid = ${a_clanId}`, {
                                type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        embed
                            .setDescription(`${author}, вы успешно удалили клан ${clanName}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                        //логи
                    }
                    if (ButtonInteraction.customId === 'buttonClanNo') {
                        await ButtonInteraction.deferUpdate()
                        embed
                            .setDescription(`${author}, операция отменена!`)
                            .setColor(config.color)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                })
                collector.on('end', async () => {
                    if (status == 'agree') {
                        for (let i = 0; i<rowAgree.components.length;i++) {
                            rowAgree.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            embeds: [embed],
                            components: [rowAgree]
                        })
                    }
                })
            }
            if (subcommand === 'invite') {
                if (!a_clanId) {
                    embed
                        .setDescription(`${author}, вы не состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_permLevel < 2) {
                    embed
                        .setDescription(`${author}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (m_clanId) {
                    embed
                        .setDescription(`${author}, ${member} уже состоит в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                const rowAgree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanYes')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanNo')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2),
                    )
                embed
                    .setDescription(`${member}, ${author} пригласил вас в клан ${clanName}, вы хотите принять приглашение?`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowAgree],
                    fetchReply: true,
                })
                .then ((send) => {
                    message = send
                })
                status = 'agree'
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonClanYes' || ButtonInteraction.customId === 'buttonClanNo';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user
                    if (ButtonInteraction.user.id === member.id) {
                        embed
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                        return
                    }
                    await ButtonInteraction.deferUpdate()
                    status = 'end'
                    if (ButtonInteraction.customId === 'buttonClanYes') {
                        embed
                            .setDescription(`${member}, вы успешно вступили в клан ${clanName}`)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        await connection
                            .query(`INSERT INTO clanmembers (member, clanid, permlevel) VALUES (${member.id}, ${a_clanId}, 1)`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        return
                        //логи
                    }
                    if (ButtonInteraction.customId === 'buttonClanNo') {
                        await ButtonInteraction.deferUpdate()
                        embed
                            .setDescription(`${author}, ${member} отклонил заявку в клан ${clanName}`)
                            .setColor(config.color)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                })
                collector.on('end', async () => {
                    if (status == 'agree') {
                        for (let i = 0; i<rowAgree.components.length;i++) {
                            rowAgree.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            embeds: [embed],
                            components: [rowAgree]
                        })
                    }
                })
            }
            if (subcommand === 'kick') {
                if (!a_clanId) {
                    embed
                        .setDescription(`${author}, вы не состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_permLevel < 2) {
                    embed
                        .setDescription(`${author}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_clanId !== m_clanId) {
                    embed
                        .setDescription(`${author}, ${member} не состоит вашем клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                embed
                    .setDescription(`Пользователь ${member} был исключён из клана ${clanName}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                })
                return
                //логи
            }
            if (subcommand === 'leave') {
                if (!a_clanId) {
                    embed
                        .setDescription(`${author}, вы не состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_permLevel == 3) {
                    embed
                        .setDescription(`${author}, вы являетесь главой клана`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                embed
                    .setDescription(`${author}, вы вышли из клана ${clanName}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                })
            }
            if (subcommand === 'edit') {
                if (!a_clanId) {
                    embed
                        .setDescription(`${author}, вы не состоите в клане`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                if (a_permLevel < 2) {
                    embed
                        .setDescription(`${author}, вы не можете этого делать`)
                        .setColor(config.colorError);
                    await interaction.reply({
                        embeds: [embed]
                    })
                    return
                }
                const rowEditClan = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanEditName')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2)
                            .setDisabled(checkPerms(a_permLevel, 2)),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanEditColor')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2)
                            .setDisabled(checkPerms(a_permLevel, 2)),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanEditDescription')
                            .setEmoji('<:yes:1105184848781520986>')
                            .setStyle(2)
                            .setDisabled(checkPerms(a_permLevel, 2)),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanAddMoney')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2)
                            .setDisabled(checkPerms(a_permLevel, 1)),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonClanEditOwner')
                            .setEmoji('<:no:1105184838442561656>')
                            .setStyle(2)
                            .setDisabled(checkPerms(a_permLevel, 3)),
                    )
                embed
                    .setDescription(`${member}, ${author} пригласил вас в клан ${clanName}, вы хотите принять приглашение?`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [rowEditClan],
                    fetchReply: true,
                })
                .then ((send) => {
                    message = send
                })
                status = 'agree'
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonClanEditName' || ButtonInteraction.customId === 'buttonClanEditColor' || ButtonInteraction.customId === 'buttonClanEditColor' || ButtonInteraction.customId === 'buttonClanEditColor' || ButtonInteraction.customId === 'buttonClanEditColor';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user
                    if (ButtonInteraction.user.id === member.id) {
                        embed
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [embed],
                            ephemeral: true
                        })
                        return
                    }
                    await ButtonInteraction.deferUpdate()
                    status = 'end'
                    if (ButtonInteraction.customId === 'buttonClanEditName') {
                            embed
                                .setDescription(`${author}, вы успешно удалили клан ${clanName}`)
                            await interaction.editReply({
                                embeds: [embed],
                                components: []
                            })
                            return
                            //логи
                    }
                    if (ButtonInteraction.customId === 'buttonClanNo') {
                        await ButtonInteraction.deferUpdate()
                        embed
                            .setDescription(`${author}, операция отменена!`)
                            .setColor(config.color)
                        await interaction.editReply({
                            embeds: [embed],
                            components: []
                        })
                        return
                    }
                })
                collector.on('end', async () => {
                    if (status == 'agree') {
                        for (let i = 0; i<rowAgree.components.length;i++) {
                            rowAgree.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            embeds: [embed],
                            components: [rowAgree]
                        })
                    }
                })
            }
        } catch(err) {
            lockedCommands.push(interaction.commandName)
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