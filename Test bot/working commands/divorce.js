const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('divorce')
		.setDescription('Развестись'),
	async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const money = interaction.options.getInteger('money');
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
		let a_balance = 0;
		let a_baneconomy = 0;
        let a_jailtime = 0;
        let a_ghost = 0;
        let partner = 0;
        let partner1 = 0;
        let love_background = 1;
        let love_money = 0;
        let love_time = 0;
        let love_online = 0;
        let answer = 0;
        let member;
        let voiceId;
        let sqlResult;
        let now = Date.now()
        try {
            if (lockedCommands.includes(interaction.commandName)) {
                const lockEmbed = new EmbedBuilder()
                    .setTitle("Расторжение брака")
                    .setDescription(`${author}, Команда временно заблокирована`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [lockEmbed],
                    ephemeral: true
                }) 
                return
            }
            await connection
                .query(`SELECT money.money, money.baneconomy, money.jailtime, money.ghost, marry.partner, marry.partner1, marry.love_background, marry.love_money, marry.love_time, marry.love_create, marry.love_online, marry.loveroom_id FROM money LEFT JOIN marry ON money.id = marry.partner OR money.id = marry.partner1 WHERE money.id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) { 
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Расторжение брака")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, не состоите в браке`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            } else {
                if (author.id == sqlResult[0].partner) {
                    let m_id = sqlResult[0].partner1
                    member = await interaction.guild.members.fetch(m_id)
                } else {
                    let m_id = sqlResult[0].partner
                    member = await interaction.guild.members.fetch(m_id)
                }
                partner = sqlResult[0].partner;
                partner1 = sqlResult[0].partner1;
                love_background = sqlResult[0].love_background;
                love_money = sqlResult[0].love_money;
                love_time = sqlResult[0].love_time;
                love_online = sqlResult[0].love_online;
                voiceId = sqlResult[0].loveroom_id;
                a_baneconomy = sqlResult[0].baneconomy;
                a_jailtime = sqlResult[0].jailtime;
                a_ghost = sqlResult[0].ghost;
            }
            if (a_baneconomy == 1) {
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
                console.log(chalk.hex('#ff0000')(`[${time}] Command ${interaction.commandName}: User ${author.displayName} blacklisted`))
                const banEmbed = new EmbedBuilder()
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (a_jailtime > now) {
                let formatTime = (time) => {
                    let m = Math.floor(time/1000/60%60);
                    let h = Math.floor(time/1000/60/60%24);
                    let d = Math.floor(time/1000/60/60/24);
                    let result = '';
                    if ((d % 10 == 1) && d != 11) {
                        result += `${d} день `
                    } else {
                        if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
                            result += `${d} дня `
                        } else {
                            result += `${d} дней `
                        }
                    }
                    if ((h % 10 == 1) && h != 11) {
                        result += `${h} час `
                    } else {
                        if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
                            result += `${h} часа `
                        } else {
                            result += `${h} часов `
                        }
                    }
                    if ((m % 10 == 1) && m != 11) {
                        result += `${m} минута`
                    } else {
                        if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
                            result += `${m} минуты`
                        } else {
                            result += `${m} минут`
                        }
                    }
                    return result
                }
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Расторжение брака")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(a_jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                })
                return
            }
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonDivorceYes')
                        .setEmoji(config.emojis.yes)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonDivorceNo')
                        .setEmoji(config.emojis.no)
                        .setStyle(2),
                )
            const Embed = new EmbedBuilder()
                .setTitle("Расторжение брака")
                .setThumbnail(author.user.displayAvatarURL())
                .setColor(config.colorError)
                .setDescription(`${author}, вы уверены что хотите рассторгнуть брак?`)
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then ((send) => {
                message = send
            })

            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonDivorceYes' || ButtonInteraction.customId === 'buttonDivorceNo';

            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async ButtonInteraction => {
                let ButtonMember = ButtonInteraction.user;
                if (ButtonMember.id != author.id) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.colorError)
                        .setDescription(`${ButtonMember}, вы не можете этого сделать`);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                answer++;
                if (ButtonInteraction.customId === 'buttonDivorceYes') {
                    let timestamp = sqlResult[0].love_create;
                    let d = Math.floor((Date.now()-timestamp)/1000/60/60/24)
                    const DivorceEmbed = new EmbedBuilder()
                        .setTitle("Расторжение брака")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`${author}, вы рассторгли брак с ${member}, ваш союз продлился ${d} дней`)
                        .setColor(config.color);
                    await ButtonInteraction.update({
                        embeds: [DivorceEmbed],
                        components: []
                    })
                    await connection
                        .query(`DELETE FROM marry WHERE partner = ${author.id} OR partner1 = ${author.id}`, {
                            type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    await interaction.guild.channels.fetch(voiceId)
                    .then(async (voice) => {
                        await voice.delete()
                    })
                    .catch((err) => {

                    })
                    if (a_ghost) {
                        return
                    }
                    const EmbedLog = new EmbedBuilder()
                        .setTitle("Divorce")
                        .setColor('#ff0000')
                        .setDescription(`[1] <@${partner}> (${partner})
[2] <@${partner1}> (${partner1})
[3] Divorce(by ${author})
[4] Баланс пары: ${love_money} ${emoji}
[5] Действует до: ${love_time}
[6] ID фона: ${love_background}
[7] Совместный онлайн: ${love_online}`)
                        .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                        .setTimestamp();
                    await logChannel.send({
                        embeds: [EmbedLog],
                    })

                }
                if (ButtonInteraction.customId === 'buttonDivorceNo') {
                    const disagreeEmbed = new EmbedBuilder()
                        .setTitle("Расторжение брака")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.color)
                        .setDescription(`${author}, операция отменена`);
                    await ButtonInteraction.update({
                        embeds: [disagreeEmbed],
                        components: []
                    })
                    return
                }
            })
            collector.on('end', async () => {
                if (answer < 1) {
                    for (let i = 0; i<row.components.length;i++) {
						row.components[i].setDisabled(true)
					}
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [row],
                    })
                }
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