const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('punch')
		.setDescription('Ударить')
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
                .setTitle("Реакции: Удар")
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
                .query(`SELECT admin.ignore FROM admin WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            .catch((err) => {
                
            })
            if (sqlResult[0] !== undefined) {
                if (sqlResult[0].ignore == 1) {
                    const embed = new EmbedBuilder()
                        .setTitle(`Реакции: Удар`)
                        .setDescription(`${author}, ${member} не хочет что бы его били`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            let rand = Math.floor(Math.random() * 17) + 1;
            let image;
            switch(rand){
                case 1: image = "https://cdn.discordapp.com/attachments/863874175193841685/863879033963282442/1466605321_tumblr_o6vl2drsqu1tndn6wo1_540.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878945954988062/MiserlyKindlyAustraliansilkyterrier-size_restricted.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878845207674900/original_5.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878773178105856/7006e1fcc35a76621d70b2bdf543b1cd.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878726080659466/orig.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878638557331516/1466975973_06dae6d9ec74a8a4523ea1b0e8af80ee2e412ad9_hq.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/863874175193841685/863878349587873813/original.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/863874175193841685/863877741467664394/OK6W_koKDTOqqqLDbIoPAl79rO2aMYDV1Nj2R_YmGJg.gif"; break;
                case 9: image = "https://cdn.discordapp.com/attachments/863874175193841685/863877352702345236/ad3b8d7527663533b4b270cda242214cbff81f3b_hq.gif"; break;
                case 10: image = "https://cdn.discordapp.com/attachments/863874175193841685/863877062129090570/tenor.gif"; break;
                case 11: image = "https://cdn.discordapp.com/attachments/863874175193841685/863876942657617931/1476530268_giphy.gif"; break;
                case 12: image = "https://cdn.discordapp.com/attachments/863874175193841685/863876698332332043/a9913922a762646695981a3b6c991aca7585f85b_hq.gif"; break;
                case 13: image = "https://media.discordapp.net/attachments/863874175193841685/958501859037970492/46478457.gif"; break;
                case 14: image = "https://media.discordapp.net/attachments/863874175193841685/958502096699813918/funny-anime-gif-48.gif"; break;
                case 15: image = "https://media.discordapp.net/attachments/863874175193841685/958501859037970492/46478457.gif"; break;
                case 16: image = "https://media.discordapp.net/attachments/863874175193841685/958501859377696788/B7sk.gif"; break;
                case 17: image = "https://media.discordapp.net/attachments/863874175193841685/958502096699813918/funny-anime-gif-48.gif"; break;
                default: image = "https://cdn.discordapp.com/attachments/863874175193841685/863876698332332043/a9913922a762646695981a3b6c991aca7585f85b_hq.gif"; break;
            }
            const embed = new EmbedBuilder()
                .setTitle(`Реакции: Удар`)
                .setDescription(`${author} ударил(-a) ${member}`)
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