const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const wait = require('node:timers/promises').setTimeout;
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const { timeEnd } = require('node:console');
const { title } = require('node:process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Роль')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Покупка личной роли")
                .addStringOption(option => 
                    option.setName('name')
                    .setDescription('Название роли')
                    .setRequired(true))
                .addStringOption(option => 
                    option.setName('hex')
                    .setDescription('цвет роли')
                    .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("manage")
                .setDescription("Редактировать личную роль")
                .addRoleOption( option => 
                    option.setName('role')
                    .setDescription('роль')
                    .setRequired(true))
        ),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`)
        let title
        let timestamp;
        let cost;
        let buycount;
        let balance = 0;
        let exp = 0;
        let level
		let baneconomy = 0;
        let ghost = 0;
        let sqlResult;
        let message;
        let status = 'start';
        let roleCheck;
        let rolepos
        switch (subcommand) {
            case 'create': title=`Покупка личной роли`;break;
            case 'manage': title=`Меню управления ролью ${role.name}`;break;
        }
        if (DB.lockedCommands.includes(`${interaction.commandName} ${subcommand}`)) {
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
            if (subcommand == 'create') {
                const roleName = interaction.options.getString('name');
                const roleColor = interaction.options.getString('hex').toLowerCase();
                await interaction.guild.roles.fetch('1204484039927537716')
                .then((role) => {
                    rolepos = role.position+1
                })
                .catch((err) => {
                    rolepos = 1
                })
                await connection
                    .query(`SELECT money, exp, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
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
                    exp = sqlResult[0].exp;
                    baneconomy = sqlResult[0].baneconomy
                    ghost = sqlResult[0].ghost
                }
                while ((level+1)*2000 < exp) {
                    level++;
                    exp-=level*2000
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
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    await interaction.reply({
                        embeds: [banEmbed],
                        ephemeral: true
                    }) 
                    return
                }
                if (level < 15) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, для создания роли нужен 15 уровень`);
                    await interaction.reply({
                        embeds: [errorEmbed]
                    })
                    return
                }
                if (balance < 2999 ) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author},  у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`);
                    await interaction.reply({
                        embeds: [errorEmbed]
                    })
                    return
                }
                roleCheck = roleColor.replace('#','')
                while (roleCheck[0] == '0') {
                    roleCheck = roleCheck.substr(1);
                }
                if (roleColor.indexOf('#')!=0 || !(roleColor.length == 7) || parseInt(roleColor.replace('#',''), 16).toString(16) !== roleCheck.toLowerCase()) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, проверьте правильность ввода цвета, пример ввода цвета: #ff0000`)
                    await interaction.reply({
                        embeds: [errorEmbed],
                    }) 
                    return 
                }
                const rowAgree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonbuyroleYes')
                            .setEmoji(config.emojis.yes)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonbuyroleNo')
                            .setEmoji(config.emojis.no)
                            .setStyle(2),
                    )
                const Embed = new EmbedBuilder()
                    .setTitle(title)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.color)
                    .setDescription(`${author}, для покупки роли нужно: 3000 ${emoji}, вы уверены, что хотите совершить данную операцию?`)
                await interaction.reply({
                    embeds: [Embed],
                    components: [rowAgree],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })

                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonbuyroleYes' || ButtonInteraction.customId === 'buttonbuyroleNo';

                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.user;
                    if (ButtonMember.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    status = 'end';
                    await ButtonInteraction.deferUpdate()
                    if (ButtonInteraction.customId === 'buttonbuyroleYes') {
                        await connection
                            .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => sqlResult = result)
                        if (sqlResult[0].money < 2999 ) {
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author},  у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`);
                            await interaction.reply({
                                embeds: [errorEmbed]
                            })
                            return
                        }
                        await connection
                            .query(`UPDATE money SET money = money-3000, exp=exp+3000 WHERE id = ${author.id};`, {
                                type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        role = await author.guild.roles.create({
                            name: roleName,
                            color: roleColor,
                            position: rolepos,
                            reason: 'buyrole'
                        })
                        await author.roles.add(role, 'buy role')
                        .catch((err) => {
                            
                        })
                        await connection
                            .query(`INSERT INTO tmroles (roleid, authorid, timestamp, cost) VALUES (${role.id}, ${author.id}, ${Date.now()+14*24*60*60*1000}, 0);`, {
                                type: QueryTypes.INSERT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, вы успешно купили роль ${role} на 14 дней\n\n\\Ваш новый баланс: ${balance-3000} ${emoji}`)
                            .setColor(roleColor);
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Buyrole")
                            .setDescription(`[1] ${author}(${author.id})\n[2] buy custom role\n[3] Цена: 3000${emoji}\n[4] Старый баланс: ${balance}${emoji} \n[5] Новый баланс: ${balance-3000}${emoji}`)
                            .setColor('#00ff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannel.send({
                            embeds: [logEmbed]
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonbuyroleNo') {
                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, покупка личной роли отменена`)
                            .setColor(config.color);
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                    }
                })
                collector.on('end', async () => {
                    if (status == 'start') {
                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, покупка личной роли отменена`)
                            .setColor(config.color);
                        await interaction.editReply({
                            embeds: [embed],
                            components: [],
                        })
                    }
                })
            }
            if (subcommand == 'manage') {
                const role = interaction.options.getRole('role');
                await connection
                    .query(`SELECT baneconomy, money, ghost FROM money WHERE id = ${author.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        const lockEmbed = new EmbedBuilder()
                            .setTitle("Меню управления ролями")
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
                    baneconomy = sqlResult[0].baneconomy
                    balance = sqlResult[0].money
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
                        .setTitle("Меню управления ролями")
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
                if (sqlResult[0] === undefined || sqlResult[0].authorid != author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Меню управления ролями")
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
                let lockAddMarket = () => {
                    if (cost > 0) {
                        return true
                    } else {
                        return false
                    }
                }
                let lockRemoveMarket = () => {
                    if (cost > 0) {
                        return false
                    } else {
                        return true
                    }
                }
                let lockAddIcon = () => {
                    if (role.icon) {
                        return true
                    } else {
                        return false
                    }
                }
                let lockRemoveIcon = () => {
                    if (role.icon) {
                        return false
                    } else {
                        return true
                    }
                }
                let color = (color) => {
                    while(color.length !=6) {
                        color='0'+color;
                    }
                    return '#'+color
                }
                let two = n => (n > 9 ? "" : "0") + n;
                let format = now =>
                    two(now.getDate()) + "." +
                    two(now.getMonth() + 1) + "." +
                    now.getFullYear() + " " +
                    two(now.getHours()) + ":" +
                    two(now.getMinutes()) + ":" +
                    two(now.getSeconds());
                const rowStart1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleAddMember')
                            .setLabel('Выдать роль')
                            .setEmoji(config.emojis.editName)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleRemoveMember')
                            .setLabel('Снять роль')
                            .setEmoji(config.emojis.editName)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditName')
                            .setLabel('Изменить название')
                            .setEmoji(config.emojis.editName)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditColor')
                            .setLabel('Изменить цвет')
                            .setEmoji(config.emojis.editColor)
                            .setStyle(2),
                    )
                const rowStart2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleAddMerket')
                            .setLabel('Выставить на продажу')
                            .setEmoji(config.emojis.buy)
                            .setDisabled(lockAddMarket())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditCost')
                            .setLabel('Изменить цену')
                            .setEmoji(config.emojis.sell)
                            .setDisabled(lockRemoveMarket())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleRemoveMarket')
                            .setLabel('Снять с продажи')
                            .setEmoji(config.emojis.removeIcon)
                            .setDisabled(lockRemoveMarket())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleExtend')
                            .setLabel('Продлить')
                            .setEmoji(config.emojis.loveTime)
                            .setStyle(2),
                    )
                const rowStart3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleAddIcon')
                            .setLabel('Установить иконку')
                            .setEmoji(config.emojis.editIcon)
                            .setDisabled(lockAddIcon())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleEditIcon')
                            .setLabel('Изменить иконку')
                            .setEmoji(config.emojis.editIcon)
                            .setDisabled(lockRemoveIcon())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleRemoveIcon')
                            .setLabel('Удалить иконку')
                            .setEmoji(config.emojis.removeIcon)
                            .setDisabled(lockRemoveIcon())
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleDelete')
                            .setLabel('Удалить роль')
                            .setEmoji(config.emojis.bin)
                            .setStyle(4),
                    )
                const rowAgree = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleYes')
                            .setEmoji(config.emojis.yes)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleNo')
                            .setEmoji(config.emojis.no)
                            .setStyle(2),
                    )
                const rowAgreeDisabled = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleYes')
                            .setEmoji(config.emojis.yes)
                            .setDisabled(true)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonManageRoleNo')
                            .setEmoji(config.emojis.no)
                            .setDisabled(true)
                            .setStyle(2),
                    )
                let now1 = new Date(role.createdTimestamp);
                let roleCreatedAt = format(now1)
                now1 = new Date(timestamp)
                let roleEndAt = format(now1)
                let rightNow = Date.now()
                if (timestamp < rightNow) {
                    status = 'end';
                    for (let i = 0; i<rowStart1.components.length;i++) {
                        rowStart1.components[i].setDisabled(true)
                    }
                    for (let i = 0; i<rowStart2.components.length;i++) {
                        rowStart2.components[i].setDisabled(true)
                    }
                    for (let i = 0; i<rowStart3.components.length;i++) {
                        rowStart3.components[i].setDisabled(true)
                    }
                    now1 = new Date(timestamp+1000*60*60*24*7)
                    roleEndAt = format(now1)
                    const Embed = new EmbedBuilder()
                        .setTitle(title)
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`Роль: ${role}
    ID роли: **${role.id}**
    Цвет: **${color(role.color.toString(16))}**
    Владелец: ${author}

    Продаётся: **${sell(cost)}**
    Цена: ${costInEmbed(cost)}
    Продана раз: **${buycount}**
    Создана: **${roleCreatedAt}**
    Будут удалена: **${roleEndAt}**`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [Embed],
                        components: [rowStart1, rowStart2, rowStart3],
                    })
                    return
                }
                const Embed = new EmbedBuilder()
                    .setTitle(title)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Роль: ${role}
    ID роли: **${role.id}**
    Цвет: **${color(role.color.toString(16))}**
    Владелец: ${author}

    Продаётся: **${sell(cost)}**
    Цена: ${costInEmbed(cost)}
    Продана раз: **${buycount}**
    Создана: **${roleCreatedAt}**
    Действует до: **${roleEndAt}**`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [Embed],
                    components: [rowStart1, rowStart2, rowStart3],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                for (let i = 0; i<rowStart1.components.length;i++) {
                    rowStart1.components[i].setDisabled(true)
                }
                for (let i = 0; i<rowStart2.components.length;i++) {
                    rowStart2.components[i].setDisabled(true)
                }
                for (let i = 0; i<rowStart3.components.length;i++) {
                    rowStart3.components[i].setDisabled(true)
                }
                // edit name - 280
                // edit color - 439
                // extend - 598
                // delete role - 705
                // edit cost - 781
                // remove from market = 890
                // edit icon - 912
                // remove icon - 1025
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleEditName' || ButtonInteraction.customId === 'buttonManageRoleEditColor' || ButtonInteraction.customId === 'buttonManageRoleExtend' || ButtonInteraction.customId === 'buttonManageRoleDelete' || ButtonInteraction.customId === 'buttonManageRoleEditCost' || ButtonInteraction.customId === 'buttonManageRoleRemoveMarket' || ButtonInteraction.customId === 'buttonManageRoleEditIcon' || ButtonInteraction.customId === 'buttonManageRoleRemoveIcon';

                const collector = message.createMessageComponentCollector({filter, time: 60000 });

                collector.on('collect', async ButtonInteraction => {
                    if (ButtonInteraction.user.id != author.id) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Меню управления ролями")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                            .setColor(config.colorError);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    let buttonId = ButtonInteraction.customId
                    if (buttonId == 'buttonManageRoleAddMember') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalManageRoleAddMember')
                            .setTitle('Выдать роль');
                        const RoleNameInput = new TextInputBuilder()
                            .setCustomId('modalManageRoleAddMemberInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleAddMember';
                        for (let i = 0; i<rowStart1.components.length;i++) {
                            rowStart1.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart2.components.length;i++) {
                            rowStart2.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart3.components.length;i++) {
                            rowStart3.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowStart1, rowStart2, rowStart3],
                        })
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            let MemberIdInput = ModalInteraction.components[0].components[0].value;
                            const member = await interaction.guild.members.fetch(MemberIdInput)
                            if (!member) {
                                Embed
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, пользователь не найден`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            if (member.roles.cache.has(role.id)) { 
                                Embed
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, у пользователя${member} уже есть эта роль`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            await member.roles.add(role)
                            const Embed = new EmbedBuilder()
                                .setTitle(title)
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы выдали роль ${role} пользователю ${member}`);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            if (ghost) {
                                return
                            }/////////////////////////логи
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Role manage")
                                .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 500${emoji}\n[4] Старое название: ${role.name}\n[5] Новый название: ${RoleNameInput}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-500}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed]
                            })
                            return
                        })
                        .catch(async err => {

                        })
                    }
                    if (buttonId == 'buttonManageRoleRemoveMember') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalManageRoleRemoveMember')
                            .setTitle('Снять роль');
                        const RoleNameInput = new TextInputBuilder()
                            .setCustomId('modalManageRoleRemoveMemberInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleRemoveMember';
                        for (let i = 0; i<rowStart1.components.length;i++) {
                            rowStart1.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart2.components.length;i++) {
                            rowStart2.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart3.components.length;i++) {
                            rowStart3.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowStart1, rowStart2, rowStart3],
                        })
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            let MemberIdInput = ModalInteraction.components[0].components[0].value;
                            const member = await interaction.guild.members.fetch(MemberIdInput)
                            if (!member) {
                                Embed
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, пользователь не найден`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            if (!member.roles.cache.has(role.id)) { 
                                Embed
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, у пользователя ${member} нет этой роли`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            await connection
                                .query(`SELECT * FROM tmmembers WHERE id = ${author.id} AND roleid = ${role.id}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            if (sqlResult[0]) {
                                Embed
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, у пользователь ${member} купил эту роль на торговой площадке`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            await member.roles.remove(role)
                            const Embed = new EmbedBuilder()
                                .setTitle(title)
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы сняли роль ${role} у пользователя ${member}`);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            if (ghost) {
                                return
                            }//////////////////логи
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Role manage")
                                .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 500${emoji}\n[4] Старое название: ${role.name}\n[5] Новый название: ${RoleNameInput}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-500}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed]
                            })
                            return
                        })
                        .catch(async err => {

                        })
                    }
                    if (buttonId == 'buttonManageRoleEditName') {
                        status = 'time';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, для изменения роли нужно: 500 ${emoji}, вы уверены, что хотите совершить данную операцию?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree]
                        })
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            collector.stop();
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                await connection
                                    .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                    .then((result) => sqlResult = result)
                                if (sqlResult[0].money < 499) {
                                    status = 'end'
                                    const errorEmbed = new EmbedBuilder()
                                        .setTitle(title)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.colorError)
                                        .setDescription(`${author}, у вас недостаточно средств, для изменения роли нужно: 500 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                                    await ButtonInteraction.update({
                                        embeds: [errorEmbed],
                                        components: []
                                    })
                                    return
                                }
                                const modal = new ModalBuilder()
                                    .setCustomId('modalManageRoleEditName')
                                    .setTitle('Изменение названия роли');
                                const RoleNameInput = new TextInputBuilder()
                                    .setCustomId('modalManageRoleEditNameInput')
                                    .setLabel('Введите новое название роли')
                                    .setPlaceholder('Крутая роль!')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                                const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                                modal.addComponents(firstActionRow)
                                await ButtonInteraction.showModal(modal);
                                const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleEditName';
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled],
                                })
                                ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                                .then(async ModalInteraction => {
                                    await connection
                                        .query(`UPDATE money SET money = money-500 WHERE id = ${author.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                        })
                                    let RoleNameInput = ModalInteraction.components[0].components[0].value;
                                    role.edit({
                                        name: RoleNameInput
                                    })
                                    const Embed = new EmbedBuilder()
                                        .setTitle(`Меню управления ролью ${RoleNameInput}`)
                                        .setColor(config.color)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setDescription(`${author}, вы успешно изменили название у роли ${role}`);
                                    await interaction.editReply({
                                        embeds: [Embed],
                                        components: []
                                    })
                                    if (ghost) {
                                        return
                                    }
                                    const logEmbed = new EmbedBuilder()
                                        .setTitle("Role manage")
                                        .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 500${emoji}\n[4] Старое название: ${role.name}\n[5] Новый название: ${RoleNameInput}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-500}${emoji}`)
                                        .setColor('#ffff00')
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp()
                                    await logChannel.send({
                                        embeds: [logEmbed]
                                    })
                                    return
                                })
                                .catch(async err => {

                                })
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: []
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status == 'time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                    if (buttonId == 'buttonManageRoleEditColor') {
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, для изменения роли нужно: 500 ${emoji}, вы уверены, что хотите совершить данную операцию?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree]
                        })
                        status = 'time';
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 360000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            collector.stop()
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                await connection
                                    .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                    .then((result) => sqlResult = result)
                                if (sqlResult[0].money < 499) {
                                    status = 'end'
                                    const errorEmbed = new EmbedBuilder()
                                        .setTitle(title)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.colorError)
                                        .setDescription(`${author}, у вас недостаточно средств, для изменения роли нужно: 500 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                                    await ButtonInteraction.update({
                                        embeds: [errorEmbed],
                                        components: []
                                    })
                                    return
                                }
                                const modal = new ModalBuilder()
                                    .setCustomId('modalManageRoleEditColor')
                                    .setTitle('Изменение названия роли');
                                const RoleColorInput = new TextInputBuilder()
                                    .setCustomId('modalManageRoleEditColorInput')
                                    .setLabel('Введите новый цвет роли')
                                    .setPlaceholder('#ff0000')
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(true)
                                const firstActionRow = new ActionRowBuilder().addComponents(RoleColorInput)
                                modal.addComponents(firstActionRow)
                                await ButtonInteraction.showModal(modal);
                                const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleEditColor';
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled],
                                })
                                ButtonInteraction.awaitModalSubmit({ filter, time: 60000 })
                                .then(async ModalInteraction => {
                                    await connection
                                        .query(`UPDATE money SET money = money-500 WHERE id = ${author.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                        })
                                    let RoleColorInput = ModalInteraction.components[0].components[0].value;
                                    role.edit({
                                        color: RoleColorInput
                                    })
                                    const Embed = new EmbedBuilder()
                                        .setTitle(title)
                                        .setColor(config.color)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setDescription(`${author}, вы успешно изменили цвет у роли ${role}`);
                                    await interaction.editReply({
                                        embeds: [Embed],
                                        components: []
                                    })
                                    if (ghost) {
                                        return
                                    }
                                    const logEmbed = new EmbedBuilder()
                                        .setTitle("Role manage")
                                        .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 500${emoji}\n[4] Старый цвет: ${parseInt(role.color.toString(), 16)}\n[5] Новый цвет: ${parseInt(RoleNameInput, 16)}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-500}${emoji}`)
                                        .setColor('#ffff00')
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp()
                                    await logChannel.send({
                                        embeds: [logEmbed]
                                    })
                                    return
                                })
                                .catch(async err => {
                                })
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: []
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status =='time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                    if (buttonId == 'buttonManageRoleExtend') {
                        status = 'time';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, для продления роли нужно: 1500 ${emoji}, вы уверены, что хотите совершить данную операцию?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree]
                        })
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                await connection
                                    .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                    .then((result) => sqlResult = result)
                                if (sqlResult[0].money < 1499) {
                                    status = 'end';
                                    const errorEmbed = new EmbedBuilder()
                                        .setTitle(title)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setColor(config.colorError)
                                        .setDescription(`${author}, у вас недостаточно средств, для продления роли нужно: 1500 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                                    await ButtonInteraction.update({
                                        embeds: [errorEmbed],
                                        components: []
                                    })
                                    return
                                }
                                await connection
                                    .query(`UPDATE money SET money = money-1500 WHERE id = ${author.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                await connection
                                    .query(`UPDATE tmroles SET timestamp = timestamp+${1000*60*60*24*14} WHERE roleid = ${role.id};`, {
                                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, вы продлили роль ${role} на 14 дней`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: [],
                                })
                                if (ghost) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                    .setTitle("Role manage")
                                    .setDescription(`[1] ${author}(${author.id})\n[2] Extend custom role\n[3] Цена: 1500${emoji}\n[4] Старый timestamp: ${timestamp}\n[5] Новый timestamp: ${timestamp+1000*60*60*24*14}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-1500}${emoji}`)
                                    .setColor('#ffff00')
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp()
                                await logChannel.send({
                                    embeds: [logEmbed]
                                })
                                return 
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: []
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status =='time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                    if (buttonId == 'buttonManageRoleDelete') {
                        status = 'time';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, уверены, что хотите удалить роль?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree]
                        })
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                role.delete()
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, вы удалили свою роль`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                                await connection
                                    .query(`DELETE FROM tmroles WHERE roleid = ${role.id}`, {
                                        type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                if (ghost) {
                                    return
                                }
                                const LogEmbed = new EmbedBuilder()
                                    .setTitle("**Role deleted**")
                                    .setDescription(`[1] Роль: ${role.name}(${role.id})\n[2] Role delete\n[3] Удалена пользователем: ${author}(${author.id})\n[4] Причина: Delete\n[5] Будет удалена: ${timestamp}\n[6] Куплена раз: ${bought}`)
                                    .setColor("#ff0000")
                                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                                    .setTimestamp()
                                await logChannel.send({
                                    embeds: [LogEmbed]
                                })
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: []
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status =='time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                    if (buttonId == 'buttonManageRoleAddMerket') {
                        status = 'end';
                        const modal = new ModalBuilder()
                            .setCustomId('modalManageRoleAddMarket')
                            .setTitle('Изменение стоимости роли');
                        const RoleCostInput = new TextInputBuilder()
                            .setCustomId('modalManageRoleAddMarketInput')
                            .setLabel('Введите цену роли')
                            .setPlaceholder('500')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(RoleCostInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        for (let i = 0; i<rowStart1.components.length;i++) {
                            rowStart1.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart2.components.length;i++) {
                            rowStart2.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart3.components.length;i++) {
                            rowStart3.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowStart1, rowStart2, rowStart3],
                        })
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleAddMarket';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            let RoleCostInput = ModalInteraction.components[0].components[0].value;
                            if ((parseInt(RoleCostInput) === NaN) || parseInt(RoleCostInput) != RoleCostInput) {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author}, проверьте правильность ввода стоимости роли`);
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            if ((parseInt(RoleCostInput) < 100) || parseInt(RoleCostInput) > 5000) {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author}, стоимость роли должна быть в диапазоне 100-5000 ${emoji}`);
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            const Embed = new EmbedBuilder()
                                .setTitle(title)
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы выставили роль ${role} на продажу, цена роли: ${RoleCostInput} ${emoji}`);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE tmroles SET cost = ${RoleCostInput} WHERE roleid = ${role.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Role manage")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Update custom role\n[3] Цена: 0${emoji}\n[4] Старая цена: ${cost} ${emoji}\n[5] Новая цена: ${RoleCostInput} ${emoji}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed]
                            })
                            return
                        })
                        .catch(async err => {
                        })
                    }
                    if (buttonId == 'buttonManageRoleEditCost') {
                        status = 'end';
                        const modal = new ModalBuilder()
                            .setCustomId('modalManageRoleEditCost')
                            .setTitle('Изменение стоимости роли');
                        const RoleCostInput = new TextInputBuilder()
                            .setCustomId('modalManageRoleEditCostInput')
                            .setLabel('Введите новую цену роли')
                            .setPlaceholder('500')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(RoleCostInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        for (let i = 0; i<rowStart1.components.length;i++) {
                            rowStart1.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart2.components.length;i++) {
                            rowStart2.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart3.components.length;i++) {
                            rowStart3.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowStart1, rowStart2, rowStart3],
                        })
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalManageRoleEditCost';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            let RoleCostInput = ModalInteraction.components[0].components[0].value;
                            if ((parseInt(RoleCostInput) === NaN) || parseInt(RoleCostInput) != RoleCostInput) {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author}, проверьте правильность ввода стоимости роли`);
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            if ((parseInt(RoleCostInput) < 100) || parseInt(RoleCostInput) > 5000) {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author}, стоимость роли должна быть в диапазоне 100-5000 ${emoji}`);
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                return
                            }
                            const Embed = new EmbedBuilder()
                                .setTitle(title)
                                .setColor(config.color)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setDescription(`${author}, вы успешно изменили цену у роли ${role}. Новая цена роли: ${RoleCostInput} ${emoji}`);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE tmroles SET cost = ${RoleCostInput} WHERE roleid = ${role.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                            if (ghost) {
                                return
                            }
                            const logEmbed = new EmbedBuilder()
                                .setTitle("Role manage")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Update custom role\n[3] Цена: 0${emoji}\n[4] Старая цена: ${cost} ${emoji}\n[5] Новая цена: ${RoleCostInput} ${emoji}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance}${emoji}`)
                                .setColor('#ffff00')
                                .setFooter({text: `${author.id} • ${author.guild.name}`})
                                .setTimestamp()
                            await logChannel.send({
                                embeds: [logEmbed]
                            })
                            return
                        })
                        .catch(async err => {
                        })
                    }
                    if (buttonId == 'buttonManageRoleRemoveMarket') {
                        status = 'end';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor(config.color)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setDescription(`${author}, убрали роль ${role} с торговой площадке`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: []
                        })
                        if (ghost) {
                            return
                        }
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Role manage")
                            .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 0${emoji}\n[4] Старая цена: ${cost} ${emoji}\n[5] Новая цена: 0 ${emoji}\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance}${emoji}`)
                            .setColor('#ffff00')
                            .setFooter({text: `${author.id} • ${author.guild.name}`})
                            .setTimestamp()
                        await logChannel.send({
                            embeds: [logEmbed]
                        })
                        return
                    }
                    if (buttonId == 'buttonManageRoleEditIcon' || buttonId == 'buttonManageRoleAddIcon') {
                        if (balance < 1500) {
                            status = 'end';
                            const errorEmbed = new EmbedBuilder()
                                .setTitle(title)
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.colorError)
                                .setDescription(`${author}, у вас недостаточно средств, для изменения роли нужно: 1500 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                            await ButtonInteraction.update({
                                embeds: [errorEmbed],
                                components: []
                            })
                            return
                        }
                        status = 'time';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.color)
                            .setDescription(`${author}, для изменения роли нужно: 1500 ${emoji}, вы уверены, что хотите совершить данную операцию?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree],
                        })
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, отправьте в чат иконку, которую вы хотите установить`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: [],
                                })
                                collector1.stop()
                                const filter = messageEditRoleImage => messageEditRoleImage.author.id === author.id;

                                const collector2 = interaction.channel.createMessageCollector({filter, time: 60000 });

                                collector2.on('collect', async messageEditRoleImage => {
                                    collector2.stop()
                                    if (messageEditRoleImage.attachments.size != 1) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setTitle(title)
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.colorError)
                                            .setDescription(`${author}, вам нужно прикрепить 1 файл`)
                                        await messageEditRoleImage.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        }) 
                                        return 
                                    }
                                    let image;
                                    for (let [key, value] of messageEditRoleImage.attachments) {
                                        image = value.attachment
                                    }
                                    if (image.size > 256*1024) {
                                        const errorEmbed = new EmbedBuilder()
                                            .setTitle(title)
                                            .setThumbnail(author.user.displayAvatarURL())
                                            .setColor(config.colorError)
                                            .setDescription(`${author}, вам нужно прикрепить 1 файл, с размером не более 256 Кб`)
                                        await messageEditRoleImage.reply({
                                            embeds: [errorEmbed],
                                            ephemeral: true
                                        }) 
                                        return 
                                    }
                                    messageEditRoleImage.delete()
                                    await connection
                                        .query(`UPDATE money SET money = money-1500 WHERE id = ${author.id};`, {
                                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                        })
                                    role.setIcon(image)
                                    const Embed = new EmbedBuilder()
                                        .setTitle(title)
                                        .setColor(config.color)
                                        .setThumbnail(author.user.displayAvatarURL())
                                        .setDescription(`${author}, вы успешно установили иконку на роль ${role}`);
                                    await interaction.editReply({
                                        embeds: [Embed],
                                    })
                                    if (ghost) {
                                        return
                                    }
                                    const logEmbed = new EmbedBuilder()
                                        .setTitle("Role manage")
                                        .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 1500${emoji}\n[4] Старая иконка: ---\n[5] Новая иконка: ---\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance-1500}${emoji}`)
                                        .setColor('#ffff00')
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp()
                                    await logChannel.send({
                                        embeds: [logEmbed],
                                        files: [
                                            {
                                                attachment: image, name: 'test.png', description: 'desc'
                                            }
                                        ]
                                    })
                                })
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status =='time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                    if (buttonId == 'buttonManageRoleRemoveIcon') {
                        status = 'time';
                        const Embed = new EmbedBuilder()
                            .setTitle(title)
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, уверенны, что хотите удалить иконку роли?`);
                        await ButtonInteraction.update({
                            embeds: [Embed],
                            components: [rowAgree]
                        })
                        const filter =  ButtonInteraction => ButtonInteraction.customId === 'buttonManageRoleYes' || ButtonInteraction.customId === 'buttonManageRoleNo';

                        const collector1 = message.createMessageComponentCollector({filter, time: 60000 });

                        collector1.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.user.id != author.id) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle("Меню управления ролями")
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
                                    .setColor(config.colorError);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            status = 'end';
                            if (ButtonInteraction.customId === 'buttonManageRoleYes') {
                                role.setIcon()
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.color)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setDescription(`${author}, вы удалили иконку на роли ${role}`);
                                await interaction.editReply({
                                    embeds: [Embed],
                                })
                                if (ghost) {
                                    return
                                }
                                const logEmbed = new EmbedBuilder()
                                        .setTitle("Role manage")
                                        .setDescription(`[1] ${author}(${author.id})\n[2] update custom role\n[3] Цена: 0${emoji}\n[4] Старая иконка: ---\n[5] Новая иконка: удалена\n[6] Старый баланс: ${balance}${emoji} \n[7] Новый баланс: ${balance}${emoji}`)
                                        .setColor('#ffff00')
                                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                                        .setTimestamp()
                                    await logChannel.send({
                                        embeds: [logEmbed]
                                    })
                            } else {
                                const Embed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setThumbnail(author.user.displayAvatarURL())
                                    .setColor(config.color)
                                    .setDescription(`${author}, операция отменена!`);
                                await ButtonInteraction.update({
                                    embeds: [Embed],
                                    components: [row]
                                })
                            }
                        })
                        collector1.on('end', async () => {
                            if (status =='time') {
                                await ButtonInteraction.editReply({
                                    embeds: [Embed],
                                    components: [rowAgreeDisabled]
                                })
                            }
                        })
                    }
                })
                collector.on('end', async () => {
                    if (status == 'start') {
                        for (let i = 0; i<rowStart1.components.length;i++) {
                            rowStart1.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart2.components.length;i++) {
                            rowStart2.components[i].setDisabled(true)
                        }
                        for (let i = 0; i<rowStart3.components.length;i++) {
                            rowStart3.components[i].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowStart1, rowStart2, rowStart3],
                        })
                    }
                })
            }
        } catch(err) {
            if (err.code != 10062) {
				DB.lockedCommands.push(`${interaction.commandName} ${subcommand}`)
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