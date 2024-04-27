const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timely')
		.setDescription('получить ежедневную награду'),
    async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logWorkTimely}`)
        let timelyCooldown = 0;
        let currentTimestamp = Date.now();
        let money;
		let balance = 0;
        let jailtime = 0;
        let ratio = 1;
        let ghost = 0;
        let bypass = 0;
        let sqlResult
        let list = ["<:timely1:1096881968924332154>","<:timely2:1096881982316757213>","<:timely3:1096881995486871573>","<:timely4:1096882006941520002>","<:timely5:1096882020900159629>"]
		let baneconomy = 0;
        let now = Date.now()
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Ежедневная награда")
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
                .query(`SELECT money, jailtime, baneconomy, timely, bypass1, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Ежедневная награда")
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
                jailtime = sqlResult[0].jailtime
                baneconomy = sqlResult[0].baneconomy
                timelyCooldown = sqlResult[0].timely
                bypass = sqlResult[0].bypass1
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
                    .setTitle("Ежедневная награда")
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
                    .setTitle("Ежедневная награда")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            if ((timelyCooldown > currentTimestamp) && (bypass !== 1)) {
                let time = timelyCooldown - currentTimestamp
                let sec = Math.floor(time/1000%60);
                let min = Math.floor(time/1000/60%60);
                let hours = Math.floor(time/1000/60/60%24);
                let result = `${hours}h ${min}m ${sec}s`;
                const cooldownEmbed = new EmbedBuilder()
                    .setTitle("Ежедневная награда")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, использовать timely можно раз в 24 часа\n\n\\Вы cможете использовать ещё раз через ${result}`)
                    .setColor(config.colorError)
                interaction.reply({
                    embeds: [cooldownEmbed]
                })
                return
            }
            let text = (timely1, timely2, timely3, timely4, timely5) => {
                let tmp = config.emojis
                let temp = `${tmp.ramka11+tmp.up+tmp.upt+tmp.up+tmp.upt+tmp.up+tmp.upt+tmp.up+tmp.upt+tmp.up+tmp.ramka12}\n${tmp.ramkaleft+timely1+tmp.middle+timely2+tmp.middle+timely3+tmp.middle+timely4+tmp.middle+timely5+tmp.ramkaright}\n${tmp.ramka21+tmp.down+tmp.downt+tmp.down+tmp.downt+tmp.down+tmp.downt+tmp.down+tmp.downt+tmp.down+tmp.ramka22}`
                return temp
            }
            await connection
                .query(`UPDATE money SET timely = ${Date.now()+1000*60*60*24} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            let number = Math.floor(Math.random() * 100)+1; //avg = 202,25
            if (number > 0 && number <= 74) {
                money = Math.floor(Math.random() * (100 - 50) + 50);
                ratio = 1;
            }
            if (number > 74 && number <= 84) {
                money = Math.floor(Math.random() * (200 - 100) + 100);
                ratio = 2;
            }
            if (number > 84 && number <= 94) {
                money = Math.floor(Math.random() * (400 - 200) + 200);
                ratio = 3;
            }
            if (number > 94 && number <= 99) {
                money = Math.floor(Math.random() * (800 - 400) + 400);
                ratio = 4;
            }
            if (number > 99 && number <=100) {
                money = Math.floor(Math.random() * (2500 - 800) + 800);
                ratio = 5;
            }
            let emoji1 = list[Math.floor(Math.random() * 5)];
            let emoji2 = list[Math.floor(Math.random() * 5)];
            let emoji3 = list[Math.floor(Math.random() * 5)];
            let emoji4 = list[Math.floor(Math.random() * 5)];
            let emoji5 = list[Math.floor(Math.random() * 5)];
            await interaction.reply(text(emoji1, emoji2, emoji3, emoji4, emoji5));
            for (let i = 0; i<Math.floor(Math.random() * 5)+4; i++){
                await wait(1000);
                emoji1 = emoji2;
                emoji2 = emoji3;
                emoji3 = emoji4;
                emoji4 = emoji5;
                emoji5 = list[Math.floor(Math.random() * 5)];
                await interaction.editReply(text(emoji1, emoji2, emoji3, emoji4, emoji5));
            }
            await wait(1000);
            emoji1 = emoji2;
            emoji2 = emoji3;
            emoji3 = emoji4;
            emoji4 = emoji5;
            emoji5 = list[ratio-1];
            await interaction.editReply(text(emoji1, emoji2, emoji3, emoji4, emoji5));
            await wait(1000);
            emoji1 = emoji2;
            emoji2 = emoji3;
            emoji3 = emoji4;
            emoji4 = emoji5;
            emoji5 = list[Math.floor(Math.random() * 5)];
            await interaction.editReply(text(emoji1, emoji2, emoji3, emoji4, emoji5));
            await wait(1000);
            emoji1 = emoji2;
            emoji2 = emoji3;
            emoji3 = emoji4;
            emoji4 = emoji5;
            emoji5 = list[Math.floor(Math.random() * 5)];
            embed = new EmbedBuilder()
                .setTitle("Ежедневная награда")
                .setColor(config.color)
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`${author}, вы использовали свою ежедневную награду и заработали ${money} ${emoji}\n\n\\Ваш баланс: ${balance+money}${emoji}`);
            await interaction.editReply({
                content: text(emoji1, emoji2, emoji3, emoji4, emoji5),
                embeds: [embed]
            });
            await connection
                .query(`UPDATE money SET money = money+${money} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            if (ghost) {
                return
            }
            const logEmbed1 = new EmbedBuilder()
                .setTitle("Timely")
                .setDescription(`[1] ${author}(${author.id})\n[2] Выпало пользователю: ${emoji3}\n[3] Сколько: ${money}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+money}${emoji}`)
                .setColor('#ff0000')
                .setFooter({text: `${author.id} • ${author.guild.name}`})
                .setTimestamp()
            await logChannel.send({
                embeds: [logEmbed1]
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