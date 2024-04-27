const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kiss')
		.setDescription('Поцеловать')
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
                .setTitle("Реакции: Поцелуй")
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
                        .setTitle(`Реакции: Поцелуй`)
                        .setDescription(`${author}, ${member} не хочет что бы его целовали`)
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
                case 1: image = "https://media.discordapp.net/attachments/863851364080943135/863857307795849246/gif-anime-kisses-35.gif"; break;
                case 2: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857311578456125/anime-gif-kiss-5.gif"; break;
                case 3: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857314422587452/d653178492f95ad97011052d36549dcb.gif"; break;
                case 4: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857323792793620/0aa018392fb26279fcda707494eaec4b.gif"; break;
                case 5: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857324355223572/gif-anime-kisses-16.gif"; break;
                case 6: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857336144494683/tumblr_mqbdbaYoat1rkz39eo1_500.gif"; break;
                case 7: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857343963463691/FalseFarawayClam-small.gif"; break;
                case 8: image = "https://cdn.discordapp.com/attachments/863851364080943135/863857359239512074/tenor.gif"; break;
                case 9: image = "https://media.discordapp.net/attachments/863851364080943135/958501011121643590/22d1db6014be2c75d2cbd1b69f43b94a.gif"; break;
                case 10: image = "https://media.discordapp.net/attachments/863851364080943135/958501011348131890/C3GK.gif"; break;
                case 11: image = "https://media.discordapp.net/attachments/863851364080943135/958501011620782080/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f3753305a57304f594134615951773d3d2d34372e313636333033316364633962613562663731323337353730313335372e676.gif"; break;
                case 12: image = "https://media.discordapp.net/attachments/863851364080943135/964517724296466492/pKwOitS.gif"; break;
                case 13: image = "https://media.discordapp.net/attachments/863851364080943135/964517742910799912/Ui0Gy9z.gif"; break;
                case 14: image = "https://media.discordapp.net/attachments/863851364080943135/966376903554523297/89a9090eff4ff6105887c8690003415e.gif"; break;
                case 15: image = "https://media.discordapp.net/attachments/863851364080943135/966376917190185040/65fcf2cd194588abef217d5b9514f911.gif"; break;
                case 16: image = "https://media.discordapp.net/attachments/863851364080943135/966376946047025223/69fb4b69e9b66342adcab3a0065ac579.gif"; break;
                case 17: image = "https://media.discordapp.net/attachments/863851364080943135/966377518334607430/9a165624e759893ebe7c3d14b64f00d1.gif"; break;
                case 18: image = "https://media.discordapp.net/attachments/863851364080943135/966377532976934972/badcb0749843229e142414cac394b9a7.gif"; break;
                case 19: image = "https://media.discordapp.net/attachments/863851364080943135/966377748568358932/189f0c46c59826885b0053a8355d79bf.gif"; break;
                default: image = "https://media.discordapp.net/attachments/863851364080943135/863857307795849246/gif-anime-kisses-35.gif"; break;
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Реакции: Поцелуй`)
                    .setDescription(`${author}, поцеловал(-а) ${member}`)
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