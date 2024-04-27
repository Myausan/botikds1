const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nom')
		.setDescription('Дать вкусняшку')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
        async execute(interaction, connection, DB) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const member = interaction.options.getUser('member');
		let sqlResult = []
        if (DB.lockedCommands.includes(interaction.commandName) || true) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Реакции: Дать вкусняшку")
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
                        .setTitle(`Реакции: Дать вкусняшку`)
                        .setDescription(`${author}, ${member} не хочет что бы ему давали вкусняшку`)
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
                case 1: image = "https://media1.tenor.com/images/e58eb2794ff1a12315665c28d5bc3f5e/tenor.gif?itemid=10195705"; break;
                case 2: image = "https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif"; break;
                case 3: image = "https://media.giphy.com/media/NNeyoSjPTDfhe/giphy.gif"; break;
                case 4: image = "https://media.giphy.com/media/lXiRKBj0SAA0EWvbG/giphy.gif"; break;
                case 5: image = "https://media.giphy.com/media/JdPmb95rKeDn2/giphy.gif"; break;
                case 6: image = "https://media.giphy.com/media/v65rDtklV9l6g/giphy.gif"; break;
                case 7: image = "https://media.giphy.com/media/3oriNNVbupqrZnV60w/giphy.gif"; break;
                case 8: image = "https://media.giphy.com/media/E0Gvg0GoPxetq/giphy.gif"; break;
                case 9: image = "https://media.giphy.com/media/sqbxK8itWs41i/giphy.gif"; break;
                case 10: image = "https://media.giphy.com/media/86veYex1cweAM/giphy.gif"; break;
                case 11: image = "https://media.giphy.com/media/12cK9uaR36d2JW/giphy.gif"; break;
                case 12: image = "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif"; break;
                case 13: image = "https://media.giphy.com/media/ZQN9jsRWp1M76/giphy.gif"; break;
                case 14: image = "https://media.giphy.com/media/DjczAlIcyK1Co/giphy.gif"; break;
                case 15: image = "https://media.giphy.com/media/NIZKr6XAQWhJC/giphy.gif"; break;
                case 16: image = "https://media.giphy.com/media/q3kYEKHyiU4kU/giphy.gif"; break;
                case 17: image = "https://media.giphy.com/media/yziFo5qYAOgY8/giphy.gif"; break;
                case 18: image = "https://media.giphy.com/media/VXP04aclCaUfe/giphy.gif"; break;
                case 19: image = "https://media.giphy.com/media/eMpDBxxTzKety/giphy.gif"; break;
                case 20: image = "https://media.giphy.com/media/xUn3BVBcUR7sr0NwRi/giphy.gif"; break;
                case 21: image = "https://media.giphy.com/media/juG2hdQUFo06Y/giphy.gif"; break;
                case 22: image = "https://media.giphy.com/media/W3aMIkoBgE61w0QrcK/giphy.gif"; break;
                case 23: image = "https://media.giphy.com/media/3o6gb7f68lH8gEalRC/giphy.gif"; break;
                case 24: image = "https://media.giphy.com/media/INiX4cFXcrWCs/giphy.gif"; break;
                case 25: image = "https://media.giphy.com/media/xqHZqKYUjcJXO/giphy.gif"; break;
                case 26: image = "https://media.giphy.com/media/ewIf1wn19GpeMggjsi/giphy.gif"; break;
                case 27: image = "https://media.giphy.com/media/f3FaFVYni4JofX4ooV/giphy.gif"; break;
                case 28: image = "https://media.giphy.com/media/TGqhg8CXipgzK8UEdr/giphy.gif"; break;
                case 29: image = "https://media.giphy.com/media/14aBJO7py75MD6/giphy.gif"; break;
                case 30: image = "https://media.giphy.com/media/QFPoctlgZ5s0E/giphy.gif"; break;
                case 31: image = "https://media.giphy.com/media/C4gbG94zAjyYE/giphy.gif"; break;
                case 32: image = "https://media.giphy.com/media/EGauSkKQZuXxS/giphy.gif"; break;
                case 33: image = "https://media.giphy.com/media/aD1fI3UUWC4/giphy.gif"; break;
                case 34: image = "https://media.giphy.com/media/PHZ7v9tfQu0o0/giphy.gif"; break;
                case 35: image = "https://media.giphy.com/media/HaC1WdpkL3W00/giphy.gif"; break;
                case 36: image = "https://media.giphy.com/media/3bqtLDeiDtwhq/giphy.gif"; break;
                case 37: image = "https://media.giphy.com/media/LIqFOpO9Qh0uA/giphy.gif"; break;
                case 38: image = "https://media.giphy.com/media/lrr9rHuoJOE0w/giphy.gif"; break;
                case 39: image = "https://media.giphy.com/media/JUwliZWcyDmTQZ7m9L/giphy.gif"; break;
                case 40: image = "https://media.giphy.com/media/2z0vIXgRbRrb2/giphy.gif"; break;
                default: image = "https://media.giphy.com/media/5rl0mNvX5kEEw/giphy.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Дать вкусняшку`)
                    .setDescription(`${author}, обнял(-а) ${member}`)
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