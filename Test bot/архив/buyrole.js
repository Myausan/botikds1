const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buyrole')
		.setDescription('купить кастомную роль')
		.addStringOption(option => 
			option.setName('name')
			.setDescription('Название роли')
			.setRequired(true))
        .addStringOption(option => 
            option.setName('hex')
            .setDescription('цвет роли')
            .setRequired(true)),
        async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const roleName = interaction.options.getString('name');
        const roleColor = interaction.options.getString('hex').toLowerCase();
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`)
        let sqlResult
        let roleCheck;
        let rolepos
        let role;
		let balance = 0;
		let baneconomy = 0;
        let jailtime = 0;
        let ghost = 0;
        let answer = 0;
        let message;
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Покупка личной роли")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            await interaction.guild.roles.fetch('1204484039927537716')
            .then((role) => {
                rolepos = role.position+1
            })
            .catch((err) => {
                rolepos = 1
            })
            await connection
                .query(`SELECT money, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Покупка личной роли")
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
                    .setTitle("Покупка личной роли")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (balance < 2999 ) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Покупка личной роли")
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
                    .setTitle("Покупка личной роли")
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
                .setTitle("Покупка личной роли")
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
                answer++;
                await ButtonInteraction.deferUpdate()
                if (ButtonInteraction.customId === 'buttonbuyroleYes') {
                    await connection
                        .query(`SELECT money FROM money WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                    if (sqlResult[0].money < 2999 ) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle("Покупка личной роли")
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
                        .setTitle("Покупка личной роли")
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
                        .setTitle("Покупка личной роли")
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
                if (answer == 0) {
                    const embed = new EmbedBuilder()
                        .setTitle("Покупка личной роли")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, покупка личной роли отменена`)
                        .setColor(config.color);
                    await interaction.editReply({
                        embeds: [embed],
                        components: [],
                    })
                }
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