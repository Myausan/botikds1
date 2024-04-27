const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('marry')
		.setDescription('Пожениться')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true)),
	async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
		const memberUser = interaction.options.getUser('member');
        const member = await interaction.guild.members.fetch(memberUser.id)
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembersEconomy}`)
		let a_balance = 0;
        let a_jailtime = 0;
		let a_baneconomy = 0;
		let m_baneconomy = 0;
        let a_ghost = 0;
        let answer = 0;
        let voice;
        let love_create;
        let love_time;
        let sqlResult;
        let now = Date.now()
        if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Пожениться")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
        }
        try {
            if (author.id === member.id) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете предложить ${member} вступить в брак`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                })
                return
            }
            await connection
                .query(`SELECT love_money FROM marry WHERE partner = ${author.id} OR partner1 = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] !== undefined) { 
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы уже состоите в браке`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            await connection
                .query(`SELECT love_money FROM marry WHERE partner = ${member.id} OR partner1 = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] !== undefined) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, ${member} уже состоит в браке`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            await connection
                .query(`SELECT money, jailtime, baneconomy, ghost FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                a_balance = sqlResult[0].money;
                a_jailtime = sqlResult[0].jailtime;
                a_baneconomy = sqlResult[0].baneconomy;
                a_ghost = sqlResult[0].ghost;
            }
            await connection
                .query(`SELECT baneconomy FROM money WHERE id = ${member.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                    .query(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`, {
                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
            } else {
                m_baneconomy = sqlResult[0].baneconomy
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
                    .setTitle("Пожениться")
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }
            if (m_baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете предложить ${member} вступить в брак`)
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
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author}, вы находитесь в тюрьме, вам осталось сидеть ${formatTime(a_jailtime - Date.now())}`)
                await interaction.reply({
                    embeds: [errorEmbed],
                }) 
                return
            }
            if (a_balance < 2500) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${member}, что бы вступить в брак, вам нужно купить кольца, их стоимость 2500${emoji}\n\nВаш баланс: ${a_balance}${emoji}`);
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if ((author.roles.cache.has('1065019347698987108') && member.roles.cache.has('1065019347698987108')) || (author.roles.cache.has('1065019346377773056') && member.roles.cache.has('1065019346377773056'))) {
                const banEmbed = new EmbedBuilder()
                    .setTitle("Пожениться")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, вы не можете предложить ${member} вступить в брак`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                }) 
                return
            }
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMarryYes')
                        .setEmoji(config.emojis.yes)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMarryNo')
                        .setEmoji(config.emojis.no)
                        .setStyle(2),
                )
            const Embed = new EmbedBuilder()
                .setTitle("Пожениться")
                .setThumbnail(author.user.displayAvatarURL())
                .setColor(config.color)
                .setDescription(`${author}, для покупки колец нужно 2500 ${emoji}, вы уверены что хотите совершить данную операцию?`)
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then ((send) => {
                message = send
            })

            const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonMarryYes' || ButtonInteraction.customId === 'buttonMarryNo';

            const collector = message.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async ButtonInteraction => {
                let ButtonMember = ButtonInteraction.user;
                if (ButtonMember.id != author.id && ButtonMember.id != config.owner_id) {
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
                collector.stop()
                if (ButtonInteraction.customId === 'buttonMarryYes') {
                    await connection
                        .query(`UPDATE money SET money = money-2500 WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('AgreeMarry')
                                .setEmoji(config.emojis.loveCreate)
                                .setLabel('Да. Я согласна. Клянусь любить…')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('DisagreeMarry')
                                .setLabel('Нет…')
                                .setStyle(2),
                        )
                    
                
                    let two = n => (n > 9 ? "" : "0") + n;
                    let format = now =>
                        two(now.getDate()) + "." +
                        two(now.getMonth() + 1) + "." +
                        now.getFullYear();
                    let now = new Date();
                    let created = format(now)
                    const MarryEmbed = new EmbedBuilder()
                        .setTitle("Пожениться")
                        .setThumbnail(author.user.displayAvatarURL())
                        .setDescription(`Уважаемые дамы и господа! ${author} и ${member}!
От лица ${author} и ${member} я рад приветствовать всех вас и благодарю за то, что вы собрались здесь разделить с нами этот счастливый момент!
Сегодня, ${created}, мы собрались в этом прекрасном, тихом, величественном дискорде, на дивном и спокойном сервере ${interaction.guild.name}, вдали от суеты и шума в голосовых каналов, чтобы соединить сердца двух влюбленных, решивших идти рука об руку, по нескончаемой дороге жизни.
Вступление в брак это сугубо личный поступок. В этой связи, ${author} и ${member} обращаюсь к вам.
${member}, согласны ли вы, любить и быть любимой, в добром здравии и в болезни, в радости и печали, не слыша шума медных труб, через огонь и воду, до конца времен, взять в законные мужья ${author}…`)
                        .setColor(config.color);
                    await ButtonInteraction.update({
                        content: `${member}`,
                        embeds: [MarryEmbed],
                        components: [row]
                    })

                    const filter = ButtonInteraction => (ButtonInteraction.customId === 'AgreeMarry' || ButtonInteraction.customId === 'DisagreeMarry');

                    const collector1 = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

                    collector1.on('collect', async ButtonInteraction => {
                        let ButtonMember = ButtonInteraction.user;
                        if (ButtonMember.id != member.id) {
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
                        if (ButtonInteraction.customId == 'AgreeMarry') {
                            const disagreeEmbed = new EmbedBuilder()
                                .setTitle("Пожениться")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`Властью, данной мне вами, объявляю вас Мужем и Женой! Теперь, ${member} и ${author}, вы по праву можете ставить парные аватарки. Поздравьте друг друга! В знак объединения прошу скрепить Ваш союз поцелуем.`);
                            await ButtonInteraction.update({
                                embeds: [disagreeEmbed],
                                components: []
                            })
                            const category = await interaction.guild.channels.fetch(config.loveCategoryId)
                            await interaction.guild.channels
                                .create({
                                    type: ChannelType.GuildVoice,
                                    name: `${author.user.username}❤️${member.user.username}`,
                                    userLimit: 2,
                                    parent: category,
                                    permissionOverwrites: [
                                        {
                                            id: interaction.guild.roles.everyone,
                                            deny: [PermissionFlagsBits.Connect]
                                        },
                                        {
                                            id: author.id,
                                            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel]
                                        },
                                        {
                                            id: member.id,
                                            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel]
                                        }
                                    ],
                                })
                            .then((voiceCreated) => {
                                voice = voiceCreated;
                            })
                            love_create = Date.now();
                            love_time = Date.now()+14*24*60*60*1000;
                            let man;
                            let girl;
                            if (author.roles.cache.has('1065019347698987108') || author.roles.cache.has('1065019346377773056')) {
                                if (author.roles.cache.has('1065019347698987108')) {
                                    girl = author
                                    man = member
                                } else {
                                    girl = member
                                    man = author
                                }
                            } else if (member.roles.cache.has('1065019347698987108') || member.roles.cache.has('1065019346377773056')) {
                                if (member.roles.cache.has('1065019347698987108')) {
                                    girl = member
                                    man = author
                                } else {
                                    girl = author
                                    man = member
                                }
                            } else {
                                girl = member
                                man = author
                            }
                            await connection
                                .query(`INSERT INTO marry (partner, partner1, love_money, loveroom_id, love_create, love_time) VALUES (${man.id}, ${girl.id}, 0, ${voice.id}, ${love_create}, ${love_time});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            if (a_ghost) {
                                return
                            }
                            const EmbedLog = new EmbedBuilder()
                                .setTitle("Marry")
                                .setColor('#00ff00')
                                .setDescription(`[1] ${author} ${author.id}
[2] ${member} (${member.id}
[3] Marry
[4] Создана: ${love_create}
[5] Действует до: ${love_time}
[6] ${voice}`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();;
                            await logChannel.send({
                                embeds: [EmbedLog],
                            })
                            return
                        }
                        if (ButtonInteraction.customId === 'DisagreeMarry') {
                            const disagreeEmbed = new EmbedBuilder()
                                .setTitle("Пожениться")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`${author}, ${member} не захотела выйти за вас замуж`);
                            await ButtonInteraction.update({
                                embeds: [disagreeEmbed],
                                components: []
                            })
                            await connection
                                .query(`UPDATE money SET money = money+2500 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            return
                        }
                    })
                    collector1.on('end', async () => {
                        if (answer < 2) {
                            await connection
                                .query(`UPDATE money SET money = money+2500 WHERE id = ${author.id};`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            const Embed = new EmbedBuilder()
                                .setTitle("Пожениться")
                                .setThumbnail(author.user.displayAvatarURL())
                                .setColor(config.color)
                                .setDescription(`${author}, ${member} проигнорировала ваше предложение`);
                            await interaction.editReply({
                                embeds: [Embed],
                                components: [],
                            })
                            return
                        }
                    })
                }
                if (ButtonInteraction.customId === 'buttonMarryNo') {
                    const disagreeEmbed = new EmbedBuilder()
                        .setTitle("Пожениться")
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
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMarryYes')
                                .setEmoji(config.emojis.yes)
                                .setDisabled(true)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMarryNo')
                                .setEmoji(config.emojis.no)
                                .setDisabled(true)
                                .setStyle(2),
                        )
                    await interaction.editReply({
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