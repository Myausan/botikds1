const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('br')
		.setDescription('сыграть в казино')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('сколько')
			.setRequired(true)),
        async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const money = interaction.options.getInteger('money');
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
        const emoji = config.emoji;
		let balance = 0;
        let chanceStart = 2000;
        let chance = 2000;
        let ghost = 0;
        let ratio = -1;
        let sqlResult;
		let baneconomy = 0;
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Казино: br")
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
                .query(`SELECT money, chance, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Казино: br")
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
                chanceStart = sqlResult[0].chance
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
                    .setTitle("Казино: br")
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
                    .setTitle("Казино: br")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, минимальная ставка в казино: 50 ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Казино: br")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }

            chance = Math.floor(chanceStart-money/10)
            if (chance < 100) {
                chance = 100
            }
            let generate = Math.floor(Math.random() * 10000) + 1
            if (chance > generate) {
                number = Math.floor(Math.random() * (101 - 80)) + 81;
            } else {
                number = Math.floor(Math.random() * 80) + 1;
            }
            if (money > 2001 && number > 99) {
                number = 82
            } 
            if (number > 79) ratio = 1;
            if (number > 94) ratio = 2;
            if (number > 99) ratio = 10;
            let exp = (ratio) => {
                if (ratio == -1) {
                    return money
                } else {
                    return money*ratio*2
                }
            }
            let chance1 = (ratio) => {
                if (ratio != -1) {
                    return Math.ceil(money*ratio*(-1.1))
                } else {
                    return money
                }
            }
            await connection
                .query(`UPDATE money SET money = money+${money}*${ratio}, chance = chance+${chance1(ratio)}, exp=exp+${exp(ratio)} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            if (ratio == -1) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle("Казино: br")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, выпало ${number}, вы проиграли ${money} ${emoji}\n\n\\Ваш новый баланс: ${balance-money} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [loseEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Br")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Lose\n [3] Выпало: ${number}\n[4] Ставка: ${money}${emoji}\n[5] Старый баланс: ${balance}${emoji} \n[6] Новый баланс: ${balance-money}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
            } else {
                const winEmbed = new EmbedBuilder()
                    .setTitle("Казино: br")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, выпало ${number}, вы выиграли ${money*ratio} ${emoji}\n\n\\Ваш новый баланс: ${balance+money*ratio} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [winEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed1 = new EmbedBuilder()
                    .setTitle("Br")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Win\n[3] Выпало: ${number}\n[4] Ставка: ${money}${emoji}\n[5] Старый баланс: ${balance}${emoji} \n[6] Новый баланс: ${balance+money*ratio}${emoji}`)
                    .setColor('#00ff00')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed1]
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