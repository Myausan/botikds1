const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const wait = require('node:timers/promises').setTimeout;
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slot')
		.setDescription('сыграть в слоты')
		.addIntegerOption(option => 
			option.setName('money')
			.setDescription('сколько')
			.setRequired(true)),
        async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const money = interaction.options.getInteger('money');
        const emoji = config.emoji;
		let balance = 0;
        let chance = 2000;
        let chanceStart = 2000;
        let jailtime = 0;
        let ratio = -1;
		let baneconomy = 0;
        let ghost = 0;
        let sqlResult;
        let now = Date.now()
        let win = false;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Казино: slot")
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
                        .setTitle("Казино: slot")
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
                jailtime = sqlResult[0].jailtime
                baneconomy = sqlResult[0].baneconomy;
                ghost = sqlResult[0].ghost;
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
                    .setTitle("Игра: Казино: slot")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
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
                    .setTitle("Казино: slot")
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
                    .setTitle("Казино: slot")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 50`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (balance < money){
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Казино: slot")
                    .setColor(config.colorError)
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете поставить ${money} ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }

            await connection
                .query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })

            list = [":seven:",":tangerine:",":pear:",":gem:",":watermelon:",":grapes:",":banana:",":cherries:",":coin:",":lemon:",":blueberries:" ]
            chance = Math.floor(chanceStart-money/10)
            if (chance < 100) {
                chance = 100
            }
            let generate = Math.floor(Math.random() * 10000) + 1
            if (chance > generate) {
                win = true
            } else {
                win = false
            }
            let chance1 = (ratio) => {
                if (ratio != -1) {
                    return Math.ceil(money*ratio*(-1.1))
                } else {
                    return money
                }
            }
            let emoji1 = list[Math.floor(Math.random() * list.length)];
            let emoji2 = list[Math.floor(Math.random() * list.length)];
            let emoji3 = list[Math.floor(Math.random() * list.length)];
            let emoji4 = list[Math.floor(Math.random() * list.length)];
            let emoji5 = list[Math.floor(Math.random() * list.length)];
            let emoji6 = list[Math.floor(Math.random() * list.length)];
            let emoji7 = list[Math.floor(Math.random() * list.length)];
            let emoji8 = list[Math.floor(Math.random() * list.length)];
            let emoji9 = list[Math.floor(Math.random() * list.length)];
            await interaction.reply(`${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`);
            for (let i = 0; i < 3; i++){
                await wait(1000);
                emoji1 = emoji4;
                emoji2 = emoji5;
                emoji3 = emoji6;
                emoji4 = emoji7;
                emoji5 = emoji8;
                emoji6 = emoji9;
                emoji7 = list[Math.floor(Math.random() * list.length)];
                emoji8 = list[Math.floor(Math.random() * list.length)];
                emoji9 = list[Math.floor(Math.random() * list.length)];
                if (i == 1) {
                    if (win) {
                        let temp = Math.floor(Math.random() * 3)
                        if (temp == 0) {
                            emoji7 = emoji8
                        } else if (temp == 1) {
                            emoji7 = emoji9
                        } else {
                            emoji8 = emoji9
                        }
                        while (money > 2000 && emoji4 == emoji5 && emoji5 == emoji6) {
                            emoji4 = list[Math.floor(Math.random() * list.length)];
                        }
                    }
                }
                await interaction.editReply(`${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`);
            }
            if (emoji4 == emoji5 || emoji5 == emoji6 || emoji4 == emoji6) {
                ratio = 1;
            }
            if (emoji4 == emoji5 && emoji5 == emoji6){
                ratio = 10;
            }
            let exp = (ratio) => {
                if (ratio == 0) {
                    return Math.floor(money/2)
                } else {
                    return Math.ceil(money*(ratio)*(-1.1))
                }
            }
            if (ratio == 1 || ratio == 10) {
                await connection
                    .query(`UPDATE money SET money = money+${money}*(${ratio}+1), chance = chance+${chance1(ratio)} WHERE id = ${author.id};`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            }
            if (ratio == 10) {
                const jackpotEmbed = new EmbedBuilder()
                    .setTitle("**JACKPOT**")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, поздравляю, вы выиграли ${money*10} ${emoji}\n\n\\Ваш новый баланс: ${balance+money*10} ${emoji}`)
                    .setColor(config.color);
                await interaction.editReply({
                    content: `${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`,
                    embeds: [jackpotEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Slot")
                    .setDescription(`[1] ${author}(${author.id})\n[2] JackPot\n[3] Выпало пользователю: ${emoji4}  |   ${emoji5}  |   ${emoji6}\n[4] Ставка: ${money}${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance+money*10}${emoji}`)
                    .setColor('#0000ff')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
                return
                }
            if (ratio == 1) {
                const winEmbed = new EmbedBuilder()
                    .setTitle("Казино: slot")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы выиграли ${money} ${emoji}\n\n\\Ваш новый баланс: ${balance+money}${emoji}`)
                    .setColor(config.color);
                await interaction.editReply({
                    content: `${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`,
                    embeds: [winEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed1 = new EmbedBuilder()
                    .setTitle("Slot")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Win\n[3] Выпало пользователю: ${emoji4}  |   ${emoji5}  |   ${emoji6}\n[4] Ставка: ${money}${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance+money}${emoji}`)
                    .setColor('#00ff00')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed1]
                })
                return
                }
            if (ratio == -1) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle("Казино: slot")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы проиграли ${money} ${emoji}\n\n\\Ваш новый баланс: ${balance-money}${emoji}`)
                    .setColor(config.color);
                await interaction.editReply({
                    content: `${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`,
                    embeds: [loseEmbed]
                })
                if (ghost) {
                    return
                }
                const logEmbed2 = new EmbedBuilder()
                    .setTitle("Slot")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Lose\n[3] Выпало пользователю: ${emoji4}  |   ${emoji5}  |   ${emoji6}\n[4] Ставка: ${money}${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance-money}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed2]
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