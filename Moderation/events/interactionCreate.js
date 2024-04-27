const { Events, EmbedBuilder, AuditLogEvent, Colors } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction, connection) {
        try {
            if (interaction.isButton()) {
                const author = interaction.member
                if (interaction.customId === 'ButtonAwardYes' || interaction.customId === 'ButtonAwardNo') {
                    const commandAuthor = interaction.member;
                    const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logAward}`);
                    const emoji = config.emoji;
                    let ghost = 0;
                    let money;
                    let authorAward;
                    let m_id;
                    let sqlResult;
                    let sqlResult1;
                    await connection
                        .query(`SELECT COUNT(member) as count, author FROM awards WHERE message = ${interaction.message.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    const count = sqlResult[0].count;
                    const author = await interaction.guild.member.fetch(sqlResult[0].author)
                    if (count == 0) {
                        await interaction.reply({
                            content: `${commandAuthor}, произошла ошибка`,
                        })
                        return
                    }
                    await connection
                        .query(`SELECT author, member, money FROM awards WHERE message = ${interaction.message.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                        .then((result) => sqlResult = result)
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    await interaction.reply({
                        content: `${interaction.member}, операция выполняется...`,
                    })
                    for (let i = 0; i < count; i++) {
                        m_id = sqlResult[i].member
                        money = sqlResult[i].money
                        await connection
                            .query(`SELECT money, ghost FROM money WHERE id = ${m_id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                            .then((result) => sqlResult1 = result)
                            .catch(async (err) => {
                                await interaction.reply({
                                    content: `${commandAuthor}, произошла ошибка`,
                                })
                                console.log(`SQL: Error ${err}`)
                                return
                            })
                        if (sqlResult1[0] === undefined) {
                            await connection
                                .query(`INSERT INTO money (id, money) VALUES (${m_id}, ${money});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        } else {
                            await connection
                                .query(`UPDATE money SET money = money+${money} WHERE id = ${m_id});`, {
                                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                        }
                        const Embed = new EmbedBuilder()
                            .setDescription(`${commandAuthor} выдал ${money}${emoji} пользователю <@${m_id}>`)
                            .setColor(`${config.color}`)
                        await logChannel.send({
                            embeds: [Embed],
                        })
                        const LogEmbed = new EmbedBuilder()
                            .setTitle("Award button")
                            .setDescription(`[1] Администратор: ${commandAuthor}(${commandAuthor.id})\n[2] Заявитель: ${author}(${author.id})\n[3] Пользователь: <@${m_id}>(${m_id})\n[4] Сколько: ${money}(${emoji})\n[5] Старый баланс: ${sqlResult1[i].money} ${emoji}\n[6] Старый баланс: ${sqlResult1[i].money+money} ${emoji}`)
                            .setColor("#ff0000")
                            .setFooter({text: `${m_id} • ${interaction.guild.name}`})
                            .setTimestamp()
                        await logChannel.send({
                            embeds: [LogEmbed],
                        })
                    }
                    await connection
                        .query(`DELETE FROM awards WHERE message = ${interaction.message.id});`, {
                            type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    return
                }
                if (interaction.customId === 'ButtonVerefBoy' || interaction.customId === 'ButtonVerefGirl' || interaction.customId === 'ButtonVerefNA') {
                    let msg;
                    const logChannelRoles = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    const Embed = new EmbedBuilder()
                        .setTitle("Выдача гендера")
                        .setDescription(`\`\`\`ini
ведите [ID] пользователя
\`\`\``)
                        .setColor(config.color)
                    await interaction.reply({
                        content: `${interaction.member}`,
                        embeds: [Embed],
                        ephemeral: true,
                        fetchReply: true
                    })
                    .then ((mes) => {
                        msg = mes
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async message => {
                        collector1.stop()
                        await message.delete()
                        .catch((err) => {

                        })
                        let member = await interaction.guild.members.fetch(message.content)
                        if (!member) {
                            message.reply({
                                content: 'пользователь не найден',
                                ephemeral: true,
                            })
                            return
                        }
                        let roleGirl = await interaction.guild.roles.fetch('1065019347698987108')
                        .catch((err) => {

                        })
                        let roleBoy = await interaction.guild.roles.fetch('1065019346377773056')
                        .catch((err) => {

                        })
                        let roleNA = await interaction.guild.roles.fetch('1065022095723089970')
                        .catch((err) => {

                        })
                        if (interaction.customId === 'ButtonVerefGirl') {
                            await member.roles.add(roleGirl)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleGirl}(${roleGirl.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        } else if (interaction.customId === 'ButtonVerefBoy') {
                            await member.roles.add(roleBoy)
                            await member.roles.remove(roleGirl)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleBoy}(${roleBoy.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        } else {
                            await member.roles.add(roleNA)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleGirl)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleNA}(${roleNA.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                    })
                }
            }
        } catch(err) {
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
            console.log(chalk.hex('#ff0000')(`[${time}] Event: interation create ${err}`))
        }
    },
};