const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('highfive')
		.setDescription('Дать пять')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const member = interaction.options.getUser('member');
		let sqlResult = []
        if (DB.lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Реакции: Пять")
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
                .query(`SELECT ignore1 FROM admin WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            .catch((err) => {
                
            })
            if (sqlResult[0] !== undefined) {
                if (sqlResult[0].ignore1 == 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Реакции: Пять`)
                        .setDescription(`${author}, ${member} не хочет что бы ему двавали пять`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            let rand = Math.floor(Math.random() * 11) + 1;
            let image;
            switch(rand){
                case 1: image = "https://cdn.discordapp.com/attachments/863851280152657950/863872586579443712/tenor_10.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/863851280152657950/863871435104845844/tenor_8.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/863851280152657950/863870920107622430/38913e0df5a752fe3d7a9cecd6c62443e28fc357_hq.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/863851280152657950/863870617455689748/ImpureEntireGreatdane-size_restricted.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/863851280152657950/863858214985662494/high-five-83.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/863851280152657950/863858203388805130/high-five-70.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/864226912653017129/864243294414438440/5_4444444444.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/864226912653017129/864242896017555496/333.gif"; break;
                case 9: image = "https://media.discordapp.net/attachments/863851280152657950/966381663858860082/1EQi.gif"; break;
                case 10: image = "https://media.discordapp.net/attachments/863851280152657950/966381792993087518/192i.gif"; break;
                case 11: image = "https://media.discordapp.net/attachments/863851280152657950/966382602988699658/high-five-86.gif"; break;
                default: image = "https://cdn.discordapp.com/attachments/863851280152657950/863858203388805130/high-five-70.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Пять`)
                    .setDescription(`${author} дал(-a) пять ${member}`)
                    .setImage(image)
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    content: `${member}`
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