const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('withdraw')
		.setDescription('снять деньги из банка')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('сколько')
			.setRequired(true)),
		async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const money = interaction.options.getInteger('money');
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logTransfer}`)
		let balance = 0;
		let bank = 0;
		let jailtime = 0;
		let baneconomy = 0;
		let ghost = 0;
		let sqlResult;
		let now = Date.now()
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Снять валюту из банка")
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
				.query(`SELECT money, bank, jailtime, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => sqlResult = result)
				.catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Снять валюту из банка")
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
				bank = sqlResult[0].bank
				balance = sqlResult[0].money;
				jailtime = sqlResult[0].jailtime
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
					.setTitle("Снять валюту из банка")
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
                    .setTitle("Снять валюту из банка")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
			if (money < 50) {
				const errorEmbed = new EmbedBuilder()
					.setTitle("Снять валюту из банка")
					.setColor(config.colorError)
					.setThumbnail(author.user.displayAvatarURL())
					.setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 50`);
				await interaction.reply({
					embeds: [errorEmbed]
				})
				return
			}
			if (bank < money){
				const errorEmbed = new EmbedBuilder()
					.setTitle("Снять валюту из банка")
					.setColor(config.colorError)
					.setThumbnail(author.user.displayAvatarURL())
					.setDescription(`${author}, вы не можете снять ${money} ${emoji}\n\n\\Ваш баланс: ${bank} ${emoji}`);
				await interaction.reply({
					embeds: [errorEmbed]
				})
				return
			}

			await connection
				.query(`UPDATE money SET bank = bank-${money}, money = money+${money} WHERE id = ${author.id};`, {
					type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
			const embed = new EmbedBuilder()
				.setTitle("Снять валюту из банка")
				.setThumbnail(author.user.displayAvatarURL())
				.setDescription(`${author}, вы перевели ${money} в ${emoji}

Теперь у вас на счету:`)
				.addFields(
					{name: `${emoji} Койны:ᅠᅠ`, value: `\`\`\`${balance+money}\`\`\``, inline: true},
					{name: `${config.emojianim} Биткойны:`, value: `\`\`\`${bank-money}\`\`\``, inline: true}
				)
				.setColor(config.color);
			await interaction.reply({
				embeds: [embed]
			})
			if (ghost) {
                return
            }
			const logEmbed = new EmbedBuilder()
				.setTitle("Withdraw")
				.setDescription(`[1] ${author}(${author.id})\n[2] Withdraw\n[3] Старый баланс: ${balance}${emoji}\n[4] Новый баланс: ${balance+money}${emoji}\n[5] Сколько: ${money}${emoji} \n[6] Старый банк: ${bank}${emoji}\n[7] Новый банк: ${bank-money}${emoji}`)
				.setColor('#ff0000')
				.setFooter({text: `${author.id} • ${author.guild.name}`})
				.setTimestamp()
			await logChannel.send({
				embeds: [logEmbed]
			})
		} catch(err) {
			if (err.code != 10062) {
				lockedCommands.push(interaction.commandName)
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