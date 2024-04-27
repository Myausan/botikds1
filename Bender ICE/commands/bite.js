const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bite')
		.setDescription('Укусить')
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
                .setTitle("Реакции: Кусь")
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
                        .setTitle(`Реакции: Кусь`)
                        .setDescription(`${author}, ${member} не хочет что бы его кусали`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            let rand = Math.floor(Math.random() * 19) + 1;
            let image;
            switch(rand){
                case 1: image = "https://cdn.discordapp.com/attachments/863874118084722768/863878095937077258/original_4.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/863874118084722768/863878015330287616/Omake_Gif_Anime_-_Kizumonogatari_-_Episode_3_BD_-_Shinobu_Feeds.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/863874118084722768/863877163596644402/701f5017dd78bfa59cd7b3141a28388217bc7f4er1-320-180_00.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/863874118084722768/863876394601021460/13b771fb50b707ea120cd27938c32974258f63e7r1-500-250_hq.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/863874118084722768/863876177855643688/7a1dbcccf762f878ca2b8ee9569e3c8521159392r1-500-270_hq.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875963753201695/tenor_13.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875689924526090/5960889a4839da2e048e273f8e2b3f50c10860a5_hq.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875646559354880/5c3c743ca9a235e25e49b300a41b9e61041c4cef_hq.gif"; break;
                case 9: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875599431761920/tenor_12.gif"; break;
                case 10: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875551622070302/639c95b3a42222dd30e83977a5ee2b69652b3afbr1-600-340_hq.gif"; break;
                default: image = "https://cdn.discordapp.com/attachments/863874118084722768/863875551622070302/639c95b3a42222dd30e83977a5ee2b69652b3afbr1-600-340_hq.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Кусь`)
                    .setDescription(`${author}, укусил(-а) ${member}`)
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