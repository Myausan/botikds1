const { SlashCommandBuilder , EmbedBuilder, Intents} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bank')
		.setDescription('попытаться выиграть банк'),
	async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
		let balance = 0;
        let transfer = false
        let bank = 1000;
        const emoji = config.emoji;
        let ratio = 0;
        let baneconomy = 0;
        let ghost = 0;
        let sqlResult;
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Казино: bank")
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
                        .setTitle("Казино: bank")
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
                    .setTitle("Казино: bank")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (balance < 10) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Казино: bank")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы не можете поставить 10 ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }

            await connection
                .query(`UPDATE money SET money = money-10, exp=exp+10 WHERE id = ${author.id}`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            transfer = true

            list = ["<:apple1:1197238322968408094>", "<:banan1:1197238325715685406>", "<:cherry1:1197238328186130535>" , "<:diamond1:1197238297831944294>", "<:grape1:1197238299228647495>", "<:lemon1:1197238301791367198>", "<:orange1:1197238308720357466>", "<:pineapple1:1197238312503611402>", " <:seven1:1197238315401883809>", "<:star1:1197238317972988004>", "<:strawberry1:1197238319411646594>"]

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
            for (let i = 0; i < 2; i++){
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
                while(emoji7 == emoji9 && i==0) emoji7 = list[Math.floor(Math.random() * list.length)];
                await interaction.editReply(`${author}\n\n${emoji1}  |   ${emoji2}  |   ${emoji3}\n\n${emoji4}  |   ${emoji5}  |   ${emoji6} _ _  **<━**  \n\n${emoji7}  |    ${emoji8}  |   ${emoji9}`);
            }
            if (emoji4 == emoji5 && emoji5 == emoji6){
                ratio = 1;
            }     
            await connection
                .query(`SELECT bank FROM settings WHERE id = ${config.bot_id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            .then((result) => sqlResult = result)
            bank = sqlResult[0].bank;
            if (ratio == 1) {
                const jackpotEmbed = new EmbedBuilder()
                    .setTitle("**JACKPOT**")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, поздравляю, вы выиграли ${bank}\n\n\\Ваш новый баланс: ${balance+bank} ${emoji}`)
                    .setColor(config.color);
                await interaction.editReply({
                    embeds: [jackpotEmbed]
                })
                await connection
                    .query(`UPDATE money SET money = money+${bank}+10, exp=exp+${bank*2} WHERE id = ${author.id}`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                await connection
                    .query(`UPDATE settings SET bank = 1000 WHERE id = ${config.bot_id}`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                transfer = false
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Bank")
                    .setDescription(`[1] ${author}(${author.id})\n[2] JackPot\n[3] Выпало пользователю: ${emoji4}  |   ${emoji5}  |   ${emoji6}\n[4] Ставка: 10${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance+bank}${emoji}\n[7] Старый банк ${bank}${emoji}\n[8] Новый банк: 1000${emoji}`)
                    .setColor('#0000ff')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
                })
            } else {
                const loseEmbed = new EmbedBuilder()
                    .setTitle("Казино: bank")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы проиграли 10 ${emoji}\n\n\\Ваш новый баланс: ${balance-10}${emoji}\n\\Банк выигрыша: ${bank+5}${emoji}`)
                    .setColor(config.color);
                await interaction.editReply({
                    embeds: [loseEmbed]
                })
                await connection
                    .query(`UPDATE settings SET bank = bank+5 WHERE id = ${config.bot_id}`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                transfer = false
                if (ghost) {
                    return
                }
                const logEmbed = new EmbedBuilder()
                    .setTitle("Bank")
                    .setDescription(`[1] ${author}(${author.id})\n[2] Lose\n[3] Выпало пользователю: ${emoji4}  |   ${emoji5}  |   ${emoji6}\n[4] Ставка: 10${emoji}\n[5] Старый баланс: ${balance}${emoji}\n[6] Новый баланс: ${balance-10}${emoji}\n[7] Старый банк ${bank}${emoji}\n[8] Новый банк: ${bank+5}${emoji}`)
                    .setColor('#ff0000')
                    .setFooter({text: `${author.id} • ${author.guild.name}`})
                    .setTimestamp()
                await logChannel.send({
                    embeds: [logEmbed]
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