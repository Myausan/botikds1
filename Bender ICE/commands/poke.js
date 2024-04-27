const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('poke')
		.setDescription('Тыкнуть')
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
                .setTitle("Реакции: Тык")
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
                        .setTitle(`Реакции: Тык`)
                        .setDescription(`${author}, ${member} не хочет что бы его тыкали`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            let rand = Math.floor(Math.random() * 40) + 1;
            let image;
            switch(rand){
                case 1: image = "https://media.giphy.com/media/pWd3gD577gOqs/giphy.gif"; break;
                case 2: image = "https://media.giphy.com/media/aZSMD7CpgU4Za/giphy.gif"; break;
                case 3: image = "https://media.giphy.com/media/BlS0XPVcic57W/giphy.gif"; break;
                case 4: image = "https://media.giphy.com/media/Vfie0DJryAde8/giphy.gif"; break;
                case 5: image = "https://media.giphy.com/media/JoKkwGW6JIBWM/giphy.gif"; break;
                case 6: image = "https://media.giphy.com/media/o3IbyBnospKkU/giphy.gif"; break;
                case 7: image = "https://media.giphy.com/media/3zaA92vwSuQJq/giphy.gif"; break;
                case 8: image = "https://media.giphy.com/media/JRnHKio3OQIVv95NVY/giphy.gif"; break;
                case 9: image = "https://media.giphy.com/media/l0HlPZNjOrM4pnxzG/giphy.gif"; break;
                case 10: image = "https://media.giphy.com/media/3orif6jnjL7QlvR9UA/giphy.gif"; break;
                case 11: image = "https://media.giphy.com/media/UDggMpEqief7y/giphy.gif"; break;
                case 12: image = "https://media.giphy.com/media/1Bh3kuNSGCkPi0oUtI/giphy.gif"; break;
                case 13: image = "https://media.giphy.com/media/FdinyvXRa8zekBkcdK/giphy.gif"; break;
                case 14: image = "https://media.giphy.com/media/1XhrnHFhshhoeOaGSR/giphy.gif"; break;
                case 15: image = "https://media.giphy.com/media/8PBC5GXof1G7iODApJ/giphy.gif"; break;
                case 16: image = "https://media.giphy.com/media/LXTQN2kRbaqAw/giphy.gif"; break;
                case 17: image = "https://media.giphy.com/media/xUPGcjApKnCSLeQrfi/giphy.gif"; break;
                case 18: image = "https://media.giphy.com/media/zsE1QiT8Zm1Wg/giphy.gif"; break;
                case 19: image = "https://media.giphy.com/media/10pg4tgpLGdcC4/giphy.gif"; break;
                case 20: image = "https://media.giphy.com/media/1AiIyeBbD8oA05MCIU/giphy.gif"; break;
                case 21: image = "https://media.giphy.com/media/xULW8tnNBucTL1yoA8/giphy.gif"; break;
                case 22: image = "https://media.giphy.com/media/jlexBJv8ehdWE/giphy.gif"; break;
                case 23: image = "https://media.giphy.com/media/7JEyLsy8NVNnT1wt6l/giphy.gif"; break;
                case 24: image = "https://media.giphy.com/media/l0HlMVCSlzFhxLfmU/giphy.gif"; break;
                case 25: image = "https://media.giphy.com/media/xT1R9CK0mcHJgxzD2M/giphy.gif"; break;
                case 26: image = "https://media.giphy.com/media/JXnMHkAO7z6Ew/giphy.gif"; break;
                case 27: image = "https://media.giphy.com/media/Yr6XgrBrPXXAhCYFFA/giphy.gif"; break;
                case 28: image = "https://media.giphy.com/media/X1ln7toM8iy4g/giphy.gif"; break;
                case 29: image = "https://media.giphy.com/media/XHAi45MIM73CA06Cbj/giphy.gif"; break;
                case 30: image = "https://media.giphy.com/media/3ov9k3aKRHYf1LxLrO/giphy.gif"; break;
                case 31: image = "https://media.giphy.com/media/3oz8xQdijtg2bSujh6/giphy.gif"; break;
                case 32: image = "https://media.giphy.com/media/3o6ozmDOhwbINOc932/giphy.gif"; break;
                case 33: image = "https://media.giphy.com/media/35C97VkXrgmJGtm4GS/giphy.gif"; break;
                case 34: image = "https://media.giphy.com/media/xT5LMrBXZgmFgmjsY0/giphy.gif"; break;
                case 35: image = "https://media.giphy.com/media/KmR9tOrIOGXsY/giphy.gif"; break;
                case 36: image = "https://media.giphy.com/media/PkR8gPgc2mDlrMSgtu/giphy.gif"; break;
                case 37: image = "https://media.giphy.com/media/1qj4UkkkbfyayG16MU/giphy.gif"; break;
                case 38: image = "https://media.giphy.com/media/3x5nIjlszTBQs/giphy.gif"; break;
                case 39: image = "https://media.giphy.com/media/RMl2RIcGjdv4GSH1G8/giphy.gif"; break;
                case 40: image = "https://media.giphy.com/media/26Ff76MRumM9ItvUY/giphy.gif"; break;
                default: image = "https://media.giphy.com/media/l4FGAlu2EhnrKZCeI/giphy.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Тык`)
                    .setDescription(`${author}, тыкнул(-a) ${member}`)
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