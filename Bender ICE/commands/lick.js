const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lick')
		.setDescription('Лизнуть')
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
                .setTitle("Реакции: Лизь")
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
                        .setTitle(`Реакции: Лизь`)
                        .setDescription(`${author}, ${member} не хочет что бы его лизали`)
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
                case 1: image = "https://cdn.discordapp.com/attachments/863851430011600936/863877632675676210/original_3.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/863851430011600936/863877294926200842/tenor_14.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/863851430011600936/863872695078092840/2ac88e757c8b69796e4df067e379b5f0.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/863851430011600936/863872446326374440/3jRPs1q.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/863851430011600936/863872128247791646/original_1.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/863851430011600936/863871989970501652/36c554aa3bc6b52963f134cf48dfb06422a7367dr1-896-504_hq.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/863851430011600936/863870826796285972/EfcLDDAkyqgrgvC9Vy7AEHYyVUz584qX74hF8c9D1BZqedpWh6L1sUXhVJW45LgFZhcP9esieEY59ESfSB2Uu386qJ2jw.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/863851430011600936/863870316663799828/tenor_4.gif"; break;
                case 9: image = "https://media.discordapp.net/attachments/863851430011600936/958501197029974076/cute-anime.gif"; break;
                case 10: image = "https://cdn.discordapp.com/attachments/863851430011600936/958501197503922216/anime-lick_1.gif"; break;
                case 11: image = "https://media.discordapp.net/attachments/863851430011600936/863870213799542784/5zdzFcBcrbnYLs3CUyho0LS9PhEvwBr4zMDJ8p-wuIfg9LyGOMTNzIuk5qR514bTUC1OgmF43Ua3Dge6NL9r7ULGcYLsFCtCF1V8.gif"; break;
                default: image = "https://media.discordapp.net/attachments/863851430011600936/863870213799542784/5zdzFcBcrbnYLs3CUyho0LS9PhEvwBr4zMDJ8p-wuIfg9LyGOMTNzIuk5qR514bTUC1OgmF43Ua3Dge6NL9r7ULGcYLsFCtCF1V8.gif"; break;
            }
            const embed = new EmbedBuilder()
                .setTitle(`Реакции: Лизь`)
                .setDescription(`${author} лизнул(-a) ${member}`)
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