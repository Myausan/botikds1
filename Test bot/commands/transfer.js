const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('transfer')
		.setDescription('перевести деньги')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true))
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('сколько')
			.setRequired(true)),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const member = interaction.options.getUser('member');
        const money = interaction.options.getInteger('money');
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
        let fee = Math.ceil(money/25)
		let a_balance = 0;
        let m_balance = 0;
		let a_baneconomy = 0;
		let m_baneconomy = 0;
        let ghost = 0;
        let sqlResult
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Передать валюту")
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
                .query(`SELECT money, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Передать валюту")
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
                a_baneconomy = sqlResult[0].baneconomy;
                ghost = sqlResult[0].ghost
            }
            await connection
                .query(`SELECT money, baneconomy FROM money WHERE id = ${member.id}`, {
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
                    .setTitle("Передать валюту")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (m_baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Передать валюту")
                    .setDescription(`${author}, вы не можете передать валюту ${member}`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }if (author.id == member.id) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Передать валюту")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${member}, вы переложили ${money} ${emoji} из кармана в карман`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (money < 50) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Передать валюту")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${member}, вы указали слишком мальнькое значение, минимальное: 50`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (a_balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Передать валюту")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${member}, вы не можете передать ${money} ${emoji}\n\n\\Ваш баланс: ${a_balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }

            await connection
                .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            await connection
                .query(`UPDATE money SET money = money+${money-fee} WHERE id = ${member.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            const Embed = new EmbedBuilder()
                .setTitle("Передать валюту")
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`${author} перевёл(-а) ${money} ${emoji} пользователю ${member}

${config.emojis.dot} комиссия составила ${fee} ${emoji}

${author}, ваш баланс: ${a_balance-money} ${emoji}
${member}, ваш баланс: ${m_balance+money-fee} ${emoji}`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed]
            })
            const logEmbed = new EmbedBuilder()
                .setTitle("Transfer")
                .setDescription(`[1] ${author}(${author.id})\n[2] Tansfer\n[3] Старый баланс: ${a_balance}${emoji}\n[4] Новый баланс: ${a_balance-money}${emoji}\n[5] Сколько: ${money}${emoji}\n[6] Комиссия: ${fee} ${emoji}\n[7] Пользователю: ${member}\n[8] Старый баланс: ${m_balance}${emoji}\n[9] Новый баланс: ${m_balance+money}${emoji}`)
                .setColor('#ffff00')
                .setFooter({text: `${author.id} • ${author.guild.name}`})
                .setTimestamp()
            await logChannel.send({
                embeds: [logEmbed]
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