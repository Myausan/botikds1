const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('game')
		.setDescription('сыграть в покер')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('сколько')
			.setRequired(true)),
        async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const money = interaction.options.getInteger('money');
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
		let balance = 0;
        let chanceStart = 2000;
        let chance = 2000;
        let jailtime = 0;
        let ratio = -1;
		let baneconomy = 0;
        let ghost = 0;
        let sqlResult;
        let now = Date.now()
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Казино: game")
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
                .query(`SELECT money, chance, jailtime, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Казино: game")
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
                chanceStart = sqlResult[0].chance;
                jailtime = sqlResult[0].jailtime;
                baneconomy = sqlResult[0].baneconomy;
                ghost = sqlResult[0].ghost;
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
                    .setTitle("Казино: game")
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
                    .setTitle("Казино: game")
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
                    .setTitle("Казино: game")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы указали слишком мальнькое значение, минимальное: 50`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Казино: game")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            let number_bot = 0;
            let number_member = 0;
            chance = Math.floor(chanceStart-money/10)
            if (chance < 100) {
                chance = 100
            }
            if (chance > Math.floor(Math.random() * 10000) + 1) {
                number_bot = Math.floor(Math.random() * 21) + 1; 
                number_member = Math.floor(Math.random() * (21 - number_bot)) + number_bot + 1
            } else {
                number_member = Math.floor(Math.random() * 20) + 1; 
                number_bot = Math.floor(Math.random() * (21 - number_member)) + number_member + 1
            }
            if (number_bot > number_member) {
                ratio = -1;
            }
            if (number_bot == number_member) {
                ratio = 0;
            }
            if (number_bot < number_member) {
                ratio = 1;
            }
            let chance1 = (ratio) => {
                if (ratio != -1) {
                    return Math.ceil(money*ratio*(-1.1))
                } else {
                    return money
                }
            }
            await connection
                .query(`UPDATE money SET money = money+${money}*${ratio}, chance = chance+${chance1(ratio)} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            if (ratio == -1) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle("Казино: game")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Вы проиграли! Желаю удачи в следующий раз!

<:dot:1105184828707577886> Ставка: ${money} ${emoji}
<:dot:1105184828707577886> Стоимость ваших карт: **${number_member}**
<:dot:1105184828707577886> Стоимость карт бота: **${number_bot}**
                    
Ваш новый баланс: ${balance-money} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [loseEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Game")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Lose\n[3] Выпало пользователю: ${number_member}\n[4] Выпало боту: ${number_bot}\n[5] Ставка: ${money}${emoji}\n[6] Старый баланс: ${balance}${emoji}\n[7] Новый баланс: ${balance-money}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
                return
            } else if (ratio == 0) {
                const drawEmbed = new EmbedBuilder()
                    .setTitle("Казино: game")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Ничья! Вы **ОБА** получили **ОДИНАКОВЫЕ** карты!

<:dot:1105184828707577886> Ставка: ${money} ${emoji}
<:dot:1105184828707577886> Стоимость ваших карт: **${number_member}**
<:dot:1105184828707577886> Стоимость карт бота: **${number_bot}**

Ваш новый баланс: ${balance} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [drawEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Game")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Drow\n[3] Выпало пользователю: ${number_member}\n[4] Выпало боту: ${number_bot}\n[5] Ставка: ${money}${emoji}\n[6] Старый баланс: ${balance}${emoji}\n[7] Новый баланс: ${balance}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
                return
            } else {
                const winEmbed = new EmbedBuilder()
                    .setTitle("Казино: game")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`Вы выиграли!
                    
<:dot:1105184828707577886> Ставка: ${money} ${emoji}
<:dot:1105184828707577886> Стоимость ваших карт: **${number_member}**
<:dot:1105184828707577886> Стоимость карт бота: **${number_bot}**

Ваш новый баланс: ${balance+money} ${emoji}`)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [winEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Game")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Win\n[3] Выпало пользователю: ${number_member}\n[4] Выпало боту: ${number_bot}\n[5] Ставка: ${money}${emoji}\n[6] Старый баланс: ${balance}${emoji}\n[7] Новый баланс: ${balance+money}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
                return
            }
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