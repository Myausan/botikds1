const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timely')
		.setDescription('Получить награду'),
    async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logWorkTimely}`)
        let timelyCooldown = 0;
        let currentTimestamp = Date.now();
        let money;
		let balance = 0;
        let ratio = 1;
        let ghost = 0;
        let bypass = 0;
        let sqlResult
        //let list = ["<:timely1:1096881968924332154>","<:timely2:1096881982316757213>","<:timely3:1096881995486871573>","<:timely4:1096882006941520002>","<:timely5:1096882020900159629>"]
		let baneconomy = 0;
        let now = Date.now()
        if (DB.lockedCommands.includes(interaction.commandName)) {
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
                .query(`SELECT money, baneconomy, timely, bypass1, ghost FROM money WHERE id = ${author.id}`, {
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
            if ((timelyCooldown > currentTimestamp) && (bypass !== 1)) {
                let time = timelyCooldown - currentTimestamp
                let sec = Math.floor(time/1000%60);
                let min = Math.floor(time/1000/60%60);
                let hours = Math.floor(time/1000/60/60%24);
                let result = `${hours}h ${min}m ${sec}s`;
                const cooldownEmbed = new EmbedBuilder()
                    .setTitle("Ежедневная награда")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, использовать timely можно раз в 12 часов\n\n\\Возвращайтесь <t:${Math.floor(timelyCooldown/1000)}:R>`)
                    .setColor(config.colorError)
                interaction.reply({
                    embeds: [cooldownEmbed]
                })
                return
            }
            const embed = new EmbedBuilder()
                .setTitle("Ежедневная награда")
                .setColor(config.color)
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`${author}, вы использовали свою ежедневную награду и заработали 50 ${emoji}\n\n\\Ваш баланс: ${balance+50}${emoji}`);
            await interaction.reply({
                embeds: [embed]
            });
            await connection
                .query(`UPDATE money SET money = money+${50}, timely = ${Date.now()+1000*60*60*12}, exp=exp+50 WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            if (ghost) {
                return
            }
            const logEmbed1 = new EmbedBuilder()
                .setTitle("Timely")
                .setDescription(`[1] ${author}(${author.id})\n[2] Timely\n[3] Сколько: ${50}${emoji}\n[4] Старый баланс: ${balance}${emoji}\n[5] Новый баланс: ${balance+50}${emoji}`)
                .setColor('#ff0000')
                .setFooter({text: `${author.id} • ${author.guild.name}`})
                .setTimestamp()
            await logChannel.send({
                embeds: [logEmbed1]
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