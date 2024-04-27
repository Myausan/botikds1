const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pat')
		.setDescription('Погладить по головке')
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
                .setTitle("Реакции: Поглаживание")
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
                        .setTitle(`Реакции: Поглаживание`)
                        .setDescription(`${author}, ${member} не хочет что бы его гладили по головке`)
                        .setColor(config.color);
                    await interaction.reply({
                        embeds: [embed],
                    })
                    return
                }
            }
            let rand = Math.floor(Math.random() * 27);
            let image;
            switch(rand){
                case 1: image = "https://media.giphy.com/media/N0CIxcyPLputW/giphy.gif"; break;
                case 2: image = "https://media.giphy.com/media/uw3fTCTNMbXAk/giphy.gif"; break;
                case 3: image = "https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif"; break;
                case 4: image = "https://media.giphy.com/media/3o6Zt2qh8vSNFH30SQ/giphy.gif"; break;
                case 5: image = "https://media.giphy.com/media/ye7OTQgwmVuVy/giphy.gif"; break;
                case 6: image = "https://media.giphy.com/media/tHJsAxoUjwYgcvZ9rC/giphy.gif"; break;
                case 7: image = "https://media.giphy.com/media/4HP0ddZnNVvKU/giphy.gif"; break;
                case 8: image = "https://media.giphy.com/media/82YkzGpzlJglTVqbDq/giphy.gif"; break;
                case 9: image = "https://media.giphy.com/media/xWZcTvh1cuAaSi7HeI/giphy.gif"; break;
                case 10: image = "https://media.giphy.com/media/109ltuoSQT212w/giphy.gif"; break;
                case 11: image = "https://media.giphy.com/media/ye7OTQgwmVuVy/giphy.gif"; break;
                case 12: image = "https://media.giphy.com/media/xUNd9JmsrWkrYnLcU8/giphy.gif"; break;
                case 13: image = "https://media.giphy.com/media/xUOxeS5JcZPiPgtDDW/giphy.gif"; break;
                case 14: image = "https://media.giphy.com/media/xUPGclJ5wKOJmENxcs/giphy.gif"; break;
                case 15: image = "https://media.giphy.com/media/Lp6T9KxDEgsWA/giphy.gif"; break;
                case 16: image = "https://media.giphy.com/media/f9S2ww0Pjozej5WzJ7/giphy.gif"; break;
                case 17: image = "https://media.giphy.com/media/l1LbUHrJb7GpuOHK0/giphy.gif"; break;
                case 18: image = "https://media.giphy.com/media/3bkihSRyYJBxm/giphy.gif"; break;
                case 19: image = "https://media.giphy.com/media/l2SpWgnCU5bOKngHK/giphy.gif"; break;
                case 20: image = "https://media.giphy.com/media/nXdd5BF0DKImY/giphy.gif"; break;
                case 21: image = "https://media.giphy.com/media/RMdc4Q9X16hVK/giphy.gif"; break;
                case 22: image = "https://media.giphy.com/media/xzf9ilGnMyChW/giphy.gif"; break;
                case 23: image = "https://media.giphy.com/media/tJN1MHDtciqlH1ChDz/giphy.gif"; break;
                case 24: image = "https://media.giphy.com/media/Z7x24IHBcmV7W/giphy.gif"; break;
                case 25: image = "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif"; break;
                case 26: image = "https://media.giphy.com/media/5tmRHwTlHAA9WkVxTU/giphy.gif"; break;
                default: image = "https://tenor.com/0kTa.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Поглаживание`)
                    .setDescription(`${author}, погладил(-a) ${member} по головке`)
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