const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('посмотреть топ по валюте'),
    async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        let bank = 0;
        let position = 1;
        let sqlResult;
        let baneconomy = 0;
        let member1
        let member2
        let member3
        let member4
        let member5
        let member6
        let member7
        let member8
        let member9
        let member10
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("ТОП-10 учстников по количеству валюты")
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
                .query(`SELECT bank, baneconomy FROM money WHERE id = ${author.id};`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("ТОП-10 учстников по количеству валюты")
                        .setDescription(`${author}, Команда временно заблокирована`)
                        .setColor(config.colorError);
                    interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                })
            try {
                bank = sqlResult[0].bank;
                baneconomy = sqlResult[0].baneconomy
            } catch {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            }

            await connection
                .query(`SELECT COUNT(id) as count FROM money WHERE bank>${bank};`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            position = sqlResult[0].count + 1;
            await connection
                .query(`SELECT id FROM money ORDER BY bank DESC LIMIT 10;`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            /*member1 = await author.guild.members.fetch(sqlResult[0].id)
            .catch((member1) => member1 = `<@${sqlResult[0].id}>`)
            member2 = await author.guild.members.fetch(sqlResult[1].id)
            .catch((member2) => member2 = `<@${sqlResult[1].id}>`)
            member3 = await author.guild.members.fetch(sqlResult[2].id)
            .catch((member3) => member3 = `<@${sqlResult[2].id}>`)
            member4 = await author.guild.members.fetch(sqlResult[3].id)
            .catch((member4) => member4 = `<@${sqlResult[3].id}>`)
            member5 = await author.guild.members.fetch(sqlResult[4].id)
            .catch((member5) => member5 = `<@${sqlResult[4].id}>`)
            member6 = await author.guild.members.fetch(sqlResult[5].id)
            .catch((member6) => member6 = `<@${sqlResult[5].id}>`)
            member7 = await author.guild.members.fetch(sqlResult[6].id)
            .catch((member7) => member7 = `<@${sqlResult[6].id}>`)
            member8 = await author.guild.members.fetch(sqlResult[7].id)
            .catch((member8) => member8 = `<@${sqlResult[7].id}>`)
            member9 = await author.guild.members.fetch(sqlResult[8].id)
            .catch((member9) => member9 = `<@${sqlResult[8].id}>`)
            member10 = await author.guild.members.fetch(sqlResult[9].id)
            .catch((member10) => member10 = `<@${sqlResult[9].id}>`)*/
            member1 = `<@${sqlResult[0].id}>`
            member2 = `<@${sqlResult[1].id}>`
            member3 = `<@${sqlResult[2].id}>`
            member4 = `<@${sqlResult[3].id}>`
            member5 = `<@${sqlResult[4].id}>`
            member6 = `<@${sqlResult[5].id}>`
            member7 = `<@${sqlResult[6].id}>`
            member8 = `<@${sqlResult[7].id}>`
            member9 = `<@${sqlResult[8].id}>`
            member10 = `<@${sqlResult[9].id}>`
            await connection
                .query(`SELECT bank FROM money ORDER BY bank DESC LIMIT 10;`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            let bank1 = sqlResult[0].bank;
            let bank2 = sqlResult[1].bank;
            let bank3 = sqlResult[2].bank;
            let bank4 = sqlResult[3].bank;
            let bank5 = sqlResult[4].bank;
            let bank6 = sqlResult[5].bank;
            let bank7 = sqlResult[6].bank;
            let bank8 = sqlResult[7].bank;
            let bank9 = sqlResult[8].bank;
            let bank10 = sqlResult[9].bank;

            const embed = new EmbedBuilder()
                .setTitle("ТОП-10 участников по количеству валюты")
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`[1] ${member1} - ${bank1} ${emoji}
                [2] ${member2} - ${bank2} ${emoji}
                [3] ${member3} - ${bank3} ${emoji}
                [4] ${member4} - ${bank4} ${emoji}
                [5] ${member5} - ${bank5} ${emoji}
                [6] ${member6} - ${bank6} ${emoji}
                [7] ${member7} - ${bank7} ${emoji}
                [8] ${member8} - ${bank8} ${emoji}
                [9] ${member9} - ${bank9} ${emoji}
                [10] ${member10} - ${bank10} ${emoji}
                
                ●─────────────────────────────────────●
                
                [${position}] ${author} - ${bank} ${emoji}`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [embed]
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