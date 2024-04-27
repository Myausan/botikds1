const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('promocode')
		.setDescription('активировать промокод')
		.addStringOption(option => 
			option.setName('promocode')
			.setDescription('Промокод')
			.setRequired(true)),
        async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const promocode = interaction.options.getString('promocode');
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logAward}`)
        let sqlResult
        let roleCheck;
        let rolepos
        let role;
		let balance = 0;
		let baneconomy = 0;
        let ghost = 0;
        let message;
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Активация промокода")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            console
            await connection
                .query(`SELECT money, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Активация промокода")
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
                baneconomy = sqlResult[0].baneconomy;
                ghost = sqlResult[0].ghost
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
                    .setTitle("Активация промокода")
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            await connection
                .query(`SELECT type, value FROM promocodes WHERE promocode = '${promocode}'`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
                const lockEmbed = new EmbedBuilder()
                    .setTitle("Активация промокода")
                    .setDescription(`${author}, Команда временно заблокирована`)
                    .setColor(config.colorError);
                interaction.reply({
                    embeds: [lockEmbed],
                    ephemeral: true
                }) 
                return
            })
            if (sqlResult[0] === undefined) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Активация промокода")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.color)
                    .setDescription(`${author}, такого промокода не существует`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            } else {
                type = sqlResult[0].type;
                value = sqlResult[0].value;
            }
            if (type == 'customrole') {
                const modal = new ModalBuilder()
                    .setCustomId('modalPromocodeCreateRole')
                    .setTitle('Активация промокода');
                const RoleNameInput = new TextInputBuilder()
                    .setCustomId('modalPromocodeNameInput')
                    .setLabel('Введите название роли')
                    .setPlaceholder('Крутая роль!')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const RoleColorInput = new TextInputBuilder()
                    .setCustomId('modalPromocodeColorInput')
                    .setLabel('Введите цвет роли')
                    .setPlaceholder('Крутая роль!')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                const secondActionRow = new ActionRowBuilder().addComponents(RoleColorInput)
                modal.addComponents(firstActionRow).addComponents(secondActionRow)
                await interaction.showModal(modal);
                const filter = (ModalInteraction) => ModalInteraction.customId === 'modalPromocodeCreateRole';
                interaction.awaitModalSubmit({ filter, time: 360000 })
                .then(async ModalInteraction => {
                    await ModalInteraction.deferReply()
                    let RoleNameInput = ModalInteraction.components[0].components[0].value;
                    let RoleColorInput = ModalInteraction.components[1].components[0].value;
                    await interaction.guild.roles.fetch('1065022119710302208')
                    .then((role) => {
                        rolepos = role.position+1
                    })
                    .catch((err) => {
                        rolepos = 1
                    })
                    roleCheck = RoleColorInput.replace('#','')
                    while (roleCheck[0] == '0') {
                        roleCheck = roleCheck.substr(1);
                        console.log(roleCheck)
                    }
                    if (RoleColorInput.indexOf('#')!=0 || !(RoleColorInput.length == 7) || parseInt(RoleColorInput.replace('#',''), 16).toString(16) !== roleCheck.toLowerCase()) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Активация промокода")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, проверьте правильность ввода цвета, пример ввода цвета: #ff0000`)
                        await ModalInteraction.editReply({
                            embeds: [errorEmbed],
                        }) 
                        return 
                    }
                    await connection
                        .query(`SELECT * FROM promocodes WHERE promocode = '${promocode}';`, {
                            type: QueryTypes.SELECT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => {
                        sqlResult = result
                    })
                    if (sqlResult[0].promocode == null) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Активация промокода")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, промокод уже активирован`)
                        await ModalInteraction.editReply({
                            embeds: [errorEmbed],
                        }) 
                        return 
                    }
                    await connection
                        .query(`DELETE FROM promocodes WHERE promocode = '${promocode}'`, {
                            type: QueryTypes.DELETE,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    role = await author.guild.roles.create({
                        name: RoleNameInput,
                        color: RoleColorInput,
                        position: rolepos,
                        reason: 'activate promocode'
                    })
                    author.roles.add(role, 'activate promocode')
                    await connection
                        .query(`INSERT INTO tmroles (roleid, authorid, timestamp, cost) VALUES (${role.id}, ${author.id}, ${Date.now()+value*24*60*60*1000}, 0);`, {
                            type: QueryTypes.INSERT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    const embed = new EmbedBuilder()
                        .setTitle("Активация промокода")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы успешно активировали роль ${role} на ${value} дней`)
                        .setColor(RoleColorInput);
                    await ModalInteraction.editReply({
                        embeds: [embed],
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed = new EmbedBuilder()
                        .setTitle("Activate promocode")
                        .setDescription(`[1] ${author}(${author.id})\n[2] create custom role\n[3] Цена: 0${emoji}\n[4] Старый баланс: ${balance}${emoji} \n[5] Новый баланс: ${balance}${emoji}`)
                        .setColor('#00ff00')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed]
                    })
                })
                .catch((err) => {

                })
            }
            if (type == 'money') {
                await connection
                    .query(`SELECT * FROM promocodes WHERE promocode = '${promocode}';`, {
                        type: QueryTypes.SELECT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                .then((result) => {
                    sqlResult = result
                })
                if (sqlResult[0].promocode == null) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle("Активация промокода")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, промокод уже активирован`)
                    await interaction.reply({
                        embeds: [errorEmbed],
                    }) 
                    return 
                }
                await connection
                    .query(`DELETE FROM promocodes WHERE promocode = '${promocode}'`, {
                        type: QueryTypes.DELETE,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                await connection
                    .query(`INSERT INTO money (id, money) VALUES (${author.id}, money) ON DUPLICATE KEY UPDATE money=money+${value};`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                const embed = new EmbedBuilder()
                    .setTitle("Активация промокода")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы успешно активировали промокод на ${value} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Activate promocode")
                    .setDescription(`[1] ${author}(${author.id})\n[2] money\n[3] Количество: ${value}${emoji}\n[4] Старый баланс: ${balance}${emoji} \n[5] Новый баланс: ${balance}${emoji}`)
                    .setColor('#00ff00')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
            }
            return
            if (type == 'customrole') {
                const modal = new ModalBuilder()
                    .setCustomId('modalPromocodeCreateRole')
                    .setTitle('Изменение стоимости роли');
                const RoleNameInput = new TextInputBuilder()
                    .setCustomId('modalPromocodeNameInput')
                    .setLabel('Введите название роли')
                    .setPlaceholder('Крутая роль!')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const RoleColorInput = new TextInputBuilder()
                    .setCustomId('modalPromocodeColorInput')
                    .setLabel('Введите цвет роли')
                    .setPlaceholder('Крутая роль!')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                const secondActionRow = new ActionRowBuilder().addComponents(RoleColorInput)
                modal.addComponents(firstActionRow).addComponents(secondActionRow)
                await interaction.showModal(modal);
                const filter = (ModalInteraction) => ModalInteraction.customId === 'modalPromocodeCreateRole';
                interaction.awaitModalSubmit({ filter, time: 360000 })
                .then(async ModalInteraction => {
                    await ModalInteraction.deferReply()
                    let RoleNameInput = ModalInteraction.components[0].components[0].value;
                    let RoleColorInput = ModalInteraction.components[1].components[0].value;
                    await interaction.guild.roles.fetch('1065022119710302208')
                    .then((role) => {
                        rolepos = role.position+1
                    })
                    .catch((err) => {
                        rolepos = 1
                    })
                    roleCheck = RoleColorInput.replace('#','')
                    while (roleCheck[0] == '0') {
                        roleCheck = roleCheck.substr(1);
                        console.log(roleCheck)
                    }
                    if (RoleColorInput.indexOf('#')!=0 || !(RoleColorInput.length == 7) || parseInt(RoleColorInput.replace('#',''), 16).toString(16) !== roleCheck.toLowerCase()) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Активация промокода")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, проверьте правильность ввода цвета, пример ввода цвета: #ff0000`)
                        await ModalInteraction.editReply({
                            embeds: [errorEmbed],
                        }) 
                        return 
                    }
                    await connection
                        .query(`SELECT * FROM promocodes WHERE promocode = '${promocode}';`, {
                            type: QueryTypes.SELECT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => {
                        sqlResult = result
                    })
                    if (sqlResult[0].promocode == null) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Активация промокода")
                            .setThumbnail(author.user.displayAvatarURL())
                            .setColor(config.colorError)
                            .setDescription(`${author}, промокод уже активирован`)
                        await ModalInteraction.editReply({
                            embeds: [errorEmbed],
                        }) 
                        return 
                    }
                    await connection
                        .query(`DELETE FROM promocodes WHERE promocode = '${promocode}'`, {
                            type: QueryTypes.DELETE,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    role = await author.guild.roles.create({
                        name: RoleNameInput,
                        color: RoleColorInput,
                        position: rolepos,
                        reason: 'activate promocode'
                    })
                    author.roles.add(role, 'activate promocode')
                    await connection
                        .query(`INSERT INTO tmroles (roleid, authorid, timestamp, cost) VALUES (${role.id}, ${author.id}, ${Date.now()+value*24*60*60*1000}, 0);`, {
                            type: QueryTypes.INSERT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    const embed = new EmbedBuilder()
                        .setTitle("Активация промокода")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы успешно активировали роль ${role} на ${value} дней`)
                        .setColor(RoleColorInput);
                    await ModalInteraction.editReply({
                        embeds: [embed],
                    })
                    if (ghost) {
                        return
                    }
                    const logEmbed = new EmbedBuilder()
                        .setTitle("Activate promocode")
                        .setDescription(`[1] ${author}(${author.id})\n[2] create custom role\n[3] Цена: 0${emoji}\n[4] Старый баланс: ${balance}${emoji} \n[5] Новый баланс: ${balance}${emoji}`)
                        .setColor('#00ff00')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed]
                    })
                })
                .catch((err) => {

                })
            }




            if (balance < 9999 ) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Активация промокода")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            roleCheck = roleColor.replace('#','')
            while (roleCheck[0] == '0') {
                roleCheck = roleCheck.substr(1);
            }
            if (roleColor.indexOf('#')!=0 || !(roleColor.length == 7) || parseInt(roleColor.replace('#',''), 16).toString(16) !== roleCheck) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Активация промокода")
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
                        .setLabel('да')
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonbuyroleNo')
                        .setLabel('нет')
                        .setStyle(2),
                )

            const Embed = new EmbedBuilder()
                .setTitle("Активация промокода")
                .setThumbnail(author.user.displayAvatarURL())
                .setColor(config.colorError)
                .setDescription(`${author}, для изменения роли нужно: 1000 ${emoji}, вы уверены, что хотите совершить данную операцию?`)
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
                if (ButtonInteraction.customId === 'buttonbuyroleYes') {
                    await connection
                        .query(`UPDATE money SET money = money-10000 WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    role = await author.guild.roles.create({
                        name: roleName,
                        color: roleColor,
                        position: rolepos,
                        reason: 'buyrole'
                    })
                    author.roles.add(role, 'buy role')
                    .then((tempRole) => role = tempRole)
                    await connection
                        .query(`INSERT INTO tmroles (roleid, authorid, timestamp, cost) VALUES (${role.id}, ${author.id}, ${Date.now()+14*24*60*60*1000}, 0);`, {
                            type: QueryTypes.INSERT,  //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    const embed = new EmbedBuilder()
                        .setTitle("Активация промокода")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы успешно купили роль ${role} на 14 дней\n\n\\Ваш новый баланс: ${balance-10000} ${emoji}`)
                        .setColor(roleColor);
                    await ButtonInteraction.update({
                        embeds: [embed],
                        components: [],
                    })
                    const logEmbed = new EmbedBuilder()
                        .setTitle("Buyrole")
                        .setDescription(`[1] ${author}(${author.id})\n[2] buy custom role\n[3] Цена: 10000${emoji}\n[4] Старый баланс: ${balance}${emoji} \n[5] Новый баланс: ${balance-10000}${emoji}`)
                        .setColor('#00ff00')
                        .setFooter({text: `${author.id} • ${author.guild.name}`})
                        .setTimestamp()
                    await logChannel.send({
                        embeds: [logEmbed]
                    })
                }
                if (ButtonInteraction.customId === 'buttonbuyroleNo') {
                    const embed = new EmbedBuilder()
                        .setTitle("Активация промокода")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, Активация промокода отменена`)
                        .setColor(config.color);
                    await ButtonInteraction.update({
                        embeds: [embed],
                        components: [],
                    })
                }
            })
            collector.on('end', async () => {
                const embed = new EmbedBuilder()
                    .setTitle("Активация промокода")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, Активация промокода отменена`)
                    .setColor(config.color);
                await interaction.editReply({
                    embeds: [embed],
                    components: [],
                })
            })
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