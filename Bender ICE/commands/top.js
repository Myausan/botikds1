const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('top')
		.setDescription('посмотреть топ по валюте'),
    async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
        let money = 0;
        let position = 1;
        let sqlResult;
        let sqlResult1;
        let description = ``;
        if (DB.lockedCommands.includes(interaction.commandName)) {
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
                .query(`SELECT money FROM money WHERE id = ${author.id};`, {
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
                money = sqlResult[0].money;
            } catch {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            }
            await connection
                .query(`SELECT COUNT(id) as count FROM money WHERE money>${money};`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            position = sqlResult[0].count + 1;
            await connection
                .query(`SELECT id FROM money ORDER BY money DESC LIMIT 10;`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult = result)
            await connection
                .query(`SELECT money FROM money ORDER BY money DESC LIMIT 10;`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
                .then((result) => sqlResult1 = result)
            for (let i = 0; i < 10; i++) description += `[${i+1}] <@${sqlResult[i].id}> - ${sqlResult1[i].money} ${emoji}\n`
            description += `\n●─────────────────────────────────────●\n[${position}] ${author} - ${money} ${emoji}`
            const embed = new EmbedBuilder()
                .setTitle("ТОП-10 участников по количеству валюты")
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(description)
                .setColor(config.color);
            await interaction.reply({
                embeds: [embed]
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