const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.MessageCreate,
	once: false,
    async execute(message, connection, client, lockedCommands) {
        const author = message.author
        let content = message.content;
        if (!author.bot) {
            if (message.guildId == null) {
                console.log(`${author.username}(${author.id}): ${content}`)
                return
            }
            let params = content.split(" ");
            const numBot = params[0]
            const command = params[1]
            if (numBot !== '!bot4') {
                return
            }
            if (author.id == '432199748699684864') {
                const { default: chalk } = await import('chalk')
                try {
                    if (command == 'dm_say') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        let text = content.slice(content.indexOf(" ", 9)+1)
                        user.send(text)
                        .catch(console.error)
                        console.log(`bot(${m_id}): ${text}`)
                    }
                    if (command == 'roles') {
                        let role = await message.guild.roles.fetch('1111399030266806372')
                        for (var [key, value] of message.guild.members.cache) {
                            if (value.roles.cache.size == 1) {
                                await value.roles.add(role)
                            }
                        }
                    }
                    if (command == 'say') {
                        message.delete()
                        let text = content.slice(content.indexOf(" ")+1)
                        message.channel.send(text)
                        .catch(console.error)
                    }
                    if (command == 'test') {
                        message.channel.send('Bot is ready!')
                        .catch(console.error)
                    }
                    if (command == 'restart') {
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
                        await message.channel.send({
                            content: "Bot restarting :clock2:..."
                        })
                        console.log(`[${time}] Bot restarting...`);
                        client.destroy();
                        process.exit();
                    }
                    if (command == 'sql') {
                        let query = content.slice(content.indexOf(" ")+1)
                        let sqlResult;
                        let money
                        if (query.endsWith("me")) {
                            query =  query.replace("me", author.id);
                        }
                        await connection
                        .query(`${query}`)
                        .then((result) => sqlResult = result)
                        await message.channel.send({
                            content: `${JSON.stringify(sqlResult)}`
                        })
                    }
                    if (command == 'vtimeout') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        user.timeout(1000*60*60*24, 'Advert')
                        const Embed = new EmbedBuilder()
                                .setDescription(`Администратор ***Console*** выдал тайм аут пользователю ${user} на 1 день, причина: ***Advert***`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                embeds: [Embed]
                            })
                            .catch(console.error)
                    }
                    if (command == 'vtimeout1h') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        user.timeout(1000*60*60, 'Advert')
                        const Embed = new EmbedBuilder()
                                .setDescription(`Администратор ***Console*** выдал тайм аут пользователю ${user} на 1 час, причина: ***Advert***`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                content: `${user}`,
                                embeds: [Embed]
                            })
                            .catch(console.error)
                    }
                    if (command == 'vban') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        user.ban({deleteMessageSeconds: 60 * 60 * 24 * 7, reason: 'Advert'})
                        const Embed = new EmbedBuilder()
                                .setDescription(`Администратор ***Console*** забанил пользователя ${user}, причина: ***Advert***`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                content: `${user}`,
                                embeds: [Embed]
                            })
                            .catch(console.error)
                    }
                    if (command == 'fvban') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        const Embed = new EmbedBuilder()
                            .setDescription(`Администратор ***Console*** забанил пользователя ${user}, причина: ***Advert***`)
                            .setColor("#ff0000");
                        await message.channel.send({
                            embeds: [Embed]
                        })
                        .catch(console.error)
                    }
                    if (command == 'changenick') {
                        message.delete()
                        const m_id = params[2]
                        const user =  await message.guild.members.fetch(m_id)
                        let nick = content.slice(content.indexOf(" ", content.indexOf(" ")+1)+1)
                        user.setNickname(nick)
                    }
                    if (command == 'delmsg') {
                        const c_id = params[2]
                        const m_id = params[3]
                        const channel = await message.guild.channels.fetch(c_id)
                        const delMsg =  await channel.messages.fetch(m_id)
                        delMsg.delete()
                    }
                    if (command == 'c_say') {
                        message.delete()
                        const c_id = params[2]
                        const channel =  await message.guild.channels.fetch(c_id)
                        let text = content.slice(content.indexOf(" ", content.indexOf(" ")+1)+1)
                        channel.send(text)
                        .catch(console.error)
                    }
                    if (command == 'lock') {
                        const lockCommand = params[2]
                        lockedCommands.push(lockCommand)
                        const Embed = new EmbedBuilder()
                            .setDescription(`${author}, команда ${lockCommand} заблокирована`)
                            .setColor("#ff0000");
                        await message.channel.send({
                            embeds: [Embed]
                        })
                        .catch(console.error)
                    }
                    if (command == 'unlock') {
                        const unlockCommand = params[2]
                        if (lockedCommands.indexOf(unlockCommand) != -1) {
                            lockedCommands.splice(lockedCommands.indexOf(unlockCommand))
                            const Embed = new EmbedBuilder()
                                .setDescription(`${author}, команда ${unlockCommand} разблокирована`)
                                .setColor("#00ff00");
                            await message.channel.send({
                                embeds: [Embed]
                            })
                            .catch(console.error)
                        } else {
                            const Embed = new EmbedBuilder()
                                .setDescription(`${author}, команда ${unlockCommand} не найдена`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                embeds: [Embed]
                            })
                        }
                    }
                    if (command == 'admin') {
                        let message1
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('adminbot')
                                    .setEmoji('<:bot:950303552516010034>')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('admineconomy')
                                    .setEmoji('<:money:1094233226614165614>')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('adminsql')
                                    .setEmoji('<:icons8100:950303530554630184>')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('adminaccsess')
                                    .setEmoji('<:bot:950303552516010034>')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('adminadmin')
                                    .setEmoji('<:access:950304081447120936>')
                                    .setStyle(2),
                            )
                        const row1 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('adminconsole')
                                    .setEmoji('<:console:950303938354229268>')
                                    .setStyle(2),
                            )
                        const Embed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`\`\`\`ini\n[1] Управление ботом\n[2] Управление экономикой\n[3] Управление SQL\n[4] Управление доступом\n[5] Дейсвия администратора\n[6] Консоль\`\`\``)
                        await message.channel.send({
                            embeds: [Embed],
                            components: [row, row1],
                            fetchReply: true
                        })
                        .then ((send) => {
                            message1 = send
                        })
                        const filter = (ButtonInteraction) => ButtonInteraction.user.id === author.id;

                        const collector = message1.createMessageComponentCollector({ filter, time: 60000 });

                        collector.on('collect', async ButtonInteraction => {
                            if (ButtonInteraction.customId === 'adminbot') {
                                const row = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('ButtonSetAvatar')
                                            .setEmoji('<:bot:950303552516010034>')
                                            .setStyle(2),
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('ButtonSetUsername')
                                            .setEmoji('<:money:1094233226614165614>')
                                            .setStyle(2),
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('ButtonRestart')
                                            .setEmoji('<:icons8100:950303530554630184>')
                                            .setStyle(2),
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('ButtonOff')
                                            .setEmoji('<:bot:950303552516010034>')
                                            .setStyle(2),
                                    )
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('ButtonLeave')
                                            .setEmoji('<:access:950304081447120936>')
                                            .setStyle(2),
                                    )
                            }
                        })
                    }
                    if (command == 'console') {
                        let script = content.slice(content.indexOf(" ")+6)
                        const response = require('child_process').exec(script)
                        console.log(response)
                    }
                    if (command == 'eval') {
                        const script = content.slice(content.indexOf(" ")+6)
                        eval(script)
                    }
                    if (command == 'status') {
                        let Anti_Raid = "```diff\n-Disabled\n```"
                        let Anti_Bot = "```yaml\nEnabed\n```"
                        let Moderation = "```diff\n-Disabled\n```"
                        let Errors = "```ini\n# None\n```"
                        let Warnings = "```ini\n# None\n```"
                        let Console = "```ini\n# Console\n```"
                        let Remote_bot_control = "```fix\nAuto\n```"
                        let sql = () => {
                            try {
                                connection
                                    .query(`SELECT 1+1 AS result`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                return "```yaml\nConnection is established\n```"
                            } catch(err) {
                                return "```diff\n-Connection error\n```"
                            }
                        }
                        let Economy = () => {
                            try {
                                connection
                                    .query(`SELECT 1+1 AS result`, {
                                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                                return "```fix\nEnabled (with restrictions)\n```"
                            } catch(err) {
                                return "```diff\n-Disabled\n```"
                            }
                        }
                        const Embed = new EmbedBuilder()
                            .setTitle("Status:")
                            .setColor(config.colorError)
                            .addFields(
                                {name: 'Anti-Raid:', value: `${Anti_Raid}`, inline: false},
                                {name: 'Anti-Bot:', value: `${Anti_Bot}`, inline: false},
                                {name: 'Moderation:', value: `${Moderation}`, inline: false},
                                {name: 'Economy:', value: `${Economy()}`, inline: false},
                                {name: 'SQL:', value: `${sql()}`, inline: false},
                                {name: 'Errors:', value: `${Errors}`, inline: false},
                                {name: 'Warnings:', value: `${Warnings}`, inline: false},
                                {name: 'Console:', value: `${Console}`, inline: false},
                                {name: 'Remote bot control:', value: `${Remote_bot_control}`, inline: false},
                            )
                        await message.reply({
                            embeds: [Embed],
                        })
                    }
                    if (command == 'perms') {
                        const m_id = params[2]
                        let member = await message.guild.members.fetch(m_id)
                        message.channel.send({
                            content: `${member.permissions.toArray()}`
                        })
                    }
                    if (command == 'ds') {
                        message.delete()
                        const m_id = params[2]
                        const member = await message.guild.members.fetch(m_id)
                        await member.voice.disconnect();
                    }
                    if (command == 'check') {
                        message.delete()
                        const m_id = params[2]
                        const member = await message.guild.members.fetch(m_id)
                        let check = 1;
                        let sqlResult
                        let status
                        let strstatus;
                        let voice = (member) => {
                            if (member.voice.channelId) {
                                return member.voice.channelId
                            } else {
                                return 'not in voice'
                            }
                        }
                        let two = n => (n > 9 ? "" : "0") + n;
                        let format = now =>
                            two(now.getDate()) + "." +
                            two(now.getMonth() + 1) + "." +
                            now.getFullYear() + " " +
                            two(now.getHours()) + ":" +
                            two(now.getMinutes()) + ":" +
                            two(now.getSeconds());
                        while(check) {
                            let now = new Date();
                            let time = format(now)
                            await connection
                                .query(`SELECT bypass1 FROM money WHERE id = ${member.id}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                })
                                .then((result) => sqlResult = result)
                                .catch((err) => {
                                    console.log(`SQL: Error ${err}`)
                                    return
                                })
                            if (!member.presence) {
                                await connection
                                    .query(`INSERT INTO bot (id, status, type, voice, time) VALUES (${member.id}, 'offline', '', '${voice(member)}', '${time}');`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                            } else {
                                status = member.presence.clientStatus;
                                strstatus = ''
                                for (let key in status) {
                                    if (status.hasOwnProperty(key)) {
                                        strstatus += `${key}-${status[key]}`
                                    }
                                }
                                await connection
                                    .query(`INSERT INTO bot (id, status, type, voice, time) VALUES (${member.id}, '${member.presence.status}', '${strstatus}', '${voice(member)}', '${time}');`, {
                                        type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                                    })
                            }
                            check = sqlResult[0].bypass1
                            await wait(30000)
                        }
                    }
                    if (command == 'temp') {
                        const channel = await message.guild.members.fetch('1067676512427446444')
                        console.log(channel.displayAvatarURL({extension:'png', size: 1024}))
                    }
                    if (command == 'remote_bot_control') {
                        await wait(2500)
                        const Embed1 = new EmbedBuilder()
                            .setTitle('[ERROR 3]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                            .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                            .setColor('#ffff00')
                            .setDescription(`\`\`\`fix
AGACS: Guild protection disabled
\`\`\``)
                        const Embed2 = new EmbedBuilder()
                            .setTitle('[ERROR 5]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                            .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                            .setColor(config.colorError)
                            .setDescription(`\`\`\`diff
-AEPS: security check failed in the command stot
\`\`\``)
                        const Embed3 = new EmbedBuilder()
                            .setTitle('[ERROR 11]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                            .setColor(config.colorError)
                            .setDescription(`\`\`\`diff
-ABCS: remote bot control DISABLED!
\`\`\``)
                        const Embed4 = new EmbedBuilder()
                            .setTitle(':satellite:System notification:satellite: ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                            .setColor('#0000ff')
                            .setDescription(`\`\`\`ini
[ABCS: remote bot control enabled!]
\`\`\``)
                        const Embed5 = new EmbedBuilder()
                            .setTitle('[ERROR 11]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                            .setColor('#ffff00')
                            .setDescription(`\`\`\`
ABCS: command stot disabled!
\`\`\``)
                        const Embed6 = new EmbedBuilder()
                        .setTitle('[ERROR 13]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                        .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                        .setColor('#ffff00')
                        .setDescription(`\`\`\`
ABCS: command blocking error!
\`\`\``)
                        /*await message.channel.send({
                            embeds: [Embed2, Embed5],
                        })
                        await wait(1000)*/
                        await message.channel.send({
                            embeds: [Embed4],
                        })
                        await wait(5000)
                        await message.channel.send({
                            embeds: [Embed2],
                        })
                        await wait(1000)
                        await message.channel.send({
                            embeds: [Embed3],
                        })
                    }
                    if (command == 'veref') {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('ButtonVerefGirl')
                                    .setLabel('Девочка')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('ButtonVerefBoy')
                                    .setLabel('Мальчик')
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('ButtonVerefNA')
                                    .setLabel('Не допущен')
                                    .setStyle(2),
                            )
                        const Embed = new EmbedBuilder()
                            .setTitle('Верефикация')
                            .setColor(config.color)
                            .setDescription('Нажмите на соответствующую кнопку ниже, чтобы выбрать нужный гендер для пользователя.')
                        await message.channel.send({
                            embeds: [Embed],
                            components: [row]
                        })
                    }
                    if (command == 'join') {
                        let bot = await message.guild.members.fetch(config.bot_id)
                        let voice = await message.guild.channels.fetch('664208940476661762')
                        const voiceconnection = joinVoiceChannel({
                            channelId: voice.id,
                            guildId: voice.guild.id,
                            adapterCreator: voice.guild.voiceAdapterCreator,
                            selfDeaf: false,
                        });
                        voiceconnection.on(VoiceConnectionStatus.Ready, () => {
                            console.log(voiceconnection);
                        });
                        voiceconnection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                            try {
                                await Promise.race([
                                    entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                                    entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                                ]);
                                // Seems to be reconnecting to a new channel - ignore disconnect
                            } catch (error) {
                                // Seems to be a real disconnect which SHOULDN'T be recovered from
                                connection.destroy();
                            }
                        });
                    }
                    if (command == 'case') {
                        const rowStart = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseProfileOpen')
                                    .setLabel('Открыть кейс с профилями')
                                    .setEmoji(config.emojis.buymoney)
                                    .setStyle(2)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseBuy')
                                    .setLabel('Купить кейсы')
                                    .setEmoji(config.emojis.inventory)
                                    .setStyle(2)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseGet')
                                    .setLabel('Получить подарок')
                                    .setEmoji(config.emojis.openBox)
                                    .setStyle(2)
                            )
                        const Embed = new EmbedBuilder()
                                .setTitle(`Кейсы`)
                                .setColor(config.color)
                                .setDescription(`текст`)
                        await message.channel.send({
                            embeds: [Embed],
                            components: [rowStart]
                        })
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
                    console.log(chalk.hex('#ff0000')(`[${time}] ${command}: ${err}`))
                }
            }
        }
    },
};