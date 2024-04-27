const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slap')
		.setDescription('Дать пощёчину')
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
                .setTitle("Реакции: Пощёчина")
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
                        .setTitle(`Реакции: Пощёчина`)
                        .setDescription(`${author}, ${member} не хочет что бы ему давали пощёчину`)
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
                case 1: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238611595956294/anime-slap.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238611994443887/anime-slap2.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238612590014504/anime-slap3.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238613059768381/anime-slap4.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238613395333170/giphy.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/935749534984839188/939238613781213264/WpWp.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/935749534984839188/939239159263002624/bae46fdd0fca38a4f9e02ecc4480b62f.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/935749534984839188/939239160185774150/uwHDm3r.gif"; break;
                case 9: image = "https://cdn.discordapp.com/attachments/935749534984839188/939239160538079292/9GxTsgl.gif"; break;
                case 10: image = "https://cdn.discordapp.com/attachments/935749534984839188/939239160848470106/w66ZqGR.gif"; break;
                case 11: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240009477812225/anime-slap11.gif"; break;
                case 12: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240009968525322/12.gif"; break;
                case 13: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240010404737074/13.gif"; break;
                case 14: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240011084206130/14.gif"; break;
                case 15: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240011822407680/15.gif"; break;
                case 16: image = "https://media.discordapp.net/attachments/935749534984839188/958502053779484792/181223_3375.gif"; break;
                case 17: image = "https://media.discordapp.net/attachments/935749534984839188/958502054278627398/171022_9663.gif"; break;
                case 18: image = "https://media.discordapp.net/attachments/935749534984839188/958502054689644544/171122_7086.gif"; break;
                case 19: image = "https://media.discordapp.net/attachments/935749534984839188/958503967401312256/190112_1885.gif"; break;
                default: image = "https://cdn.discordapp.com/attachments/935749534984839188/939240011822407680/15.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Пощёчина`)
                    .setDescription(`${author}, дал(-а) пощёчину ${member}`)
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