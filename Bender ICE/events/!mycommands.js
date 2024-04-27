const { Events, EmbedBuilder, AuditLogEvent, ActionRowBuilder, ButtonBuilder, PermissionsBitField, IntentsBitField } = require('discord.js');
const {joinVoiceChannel, join} = require('@discordjs/voice')
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	name: Events.MessageCreate,
	once: false,
    async execute(message, connection, client, lockedCommands) {
        let content = message.content;
        if (!message.author.bot) {
            if (message.guildId == null) {
                console.log(`${message.author.username}(${message.author.id}): ${content}`)
                return
            }
            if (message.author.id == '432199748699684864') {
                const author = await message.guild.members.fetch(message.author.id)
                let params = content.split(" ");
                const command = params[0]
                try {
                    if (command == '!temp') {
                        const guild = message.guild
                        let member = await guild.members.fetch('959103322814550027')
                        let user = member.user
                        await user.createDM()
                        let messages = await member.user.dmChannel.messages.fetch()
                        for (var [key, value] of messages) {
                            console.log(value.content)
                        }
                    }
                    if (command == '!dm_say') {
                        message.delete()
                        const m_id = params[1]
                        const user =  await message.guild.members.fetch(m_id)
                        let text = content.slice(content.indexOf(" ", 9)+1)
                        await user.send(text)
                        .catch(console.error)
                        console.log(`bot(${m_id}): ${text}`)
                    }
                    if (command == '!say') {
                        message.delete()
                        let text = content.slice(content.indexOf(" ")+1)
                        message.channel.send(text)
                        .catch(console.error)
                    }
                    if (command == '!test') {
                        message.channel.send('Bot is ready!')
                        .catch(console.error)
                    }
                    if (command == '!restart') {
                        await message.channel.send({
                            content: "Bot restarting :clock2:..."
                        })
                        console.log("Bot restarting");
                        client.destroy();
                        process.exit();
                    }
                    if (command == '!sql') {
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
                    if (command == '!vtimeout') {
                        message.delete()
                        const m_id = params[1]
                        const user =  await message.guild.members.fetch(m_id)
                        user.timeout(1000*60*60*24*7, 'Advert')
                        const Embed = new EmbedBuilder()
                                .setDescription(`Администратор ***Console*** выдал тайм аут пользователю ${user} на 7 дней, причина: ***Advert***`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                embeds: [Embed]
                            })
                            .catch(console.error)
                    }
                    if (command == '!vtimeout1d') {
                        message.delete()
                        const m_id = params[1]
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
                    if (command == '!vtimeout1h') {
                        message.delete()
                        const m_id = params[1]
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
                    if (command == '!vban') {
                        message.delete()
                        const m_id = params[1]
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
                    if (command == '!fvban') {
                        message.delete()
                        const m_id = params[1]
                        const user =  await message.guild.members.fetch(m_id)
                        const Embed = new EmbedBuilder()
                            .setDescription(`Администратор ***Console*** забанил пользователя ${user}, причина: ***Advert***`)
                            .setColor("#ff0000");
                        await message.channel.send({
                            embeds: [Embed]
                        })
                        .catch(console.error)
                    }
                    if (command == '!changenick') {
                        message.delete()
                        const m_id = params[1]
                        const user =  await message.guild.members.fetch(m_id)
                        let nick = content.slice(content.indexOf(" ", content.indexOf(" ")+1)+1)
                        user.setNickname(nick)
                    }
                    if (command == '!delmsg') {
                        const c_id = params[1]
                        const m_id = params[2]
                        const channel = await message.guild.channels.fetch(c_id)
                        const delMsg =  await channel.messages.fetch(m_id)
                        delMsg.delete()
                    }
                    if (command == '!c_say') {
                        message.delete()
                        const c_id = params[1]
                        const channel =  await message.guild.channels.fetch(c_id)
                        let text = content.slice(content.indexOf(" ", content.indexOf(" ")+1)+1)
                        channel.send(text)
                        .catch(console.error)
                    }
                    if (command == '!lock') {
                        const lockCommand = params[1]
                        lockedCommands.push(lockCommand)
                        const Embed = new EmbedBuilder()
                            .setDescription(`${author}, команда ${lockCommand} заблокирована`)
                            .setColor("#ff0000");
                        await message.channel.send({
                            embeds: [Embed]
                        })
                        .catch(console.error)
                    }
                    if (command == '!unlock') {
                        const unlockCommand = params[1]
                        if (lockedCommands.indexOf(unlockCommand) != -1) {
                            lockedCommands.splice(lockedCommands.indexOf(unlockCommand))
                            const Embed = new EmbedBuilder()
                                .setDescription(`${author}, команда ${unlockCommand} разблокирована`)
                                .setColor("#ff0000");
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
                    if (command == '!admin') {
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
                                const rowBotManage = new ActionRowBuilder()
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
                    if (command == '!console') {
                        let script = content.slice(content.indexOf(" ")+1)
                        const response = require('child_process').exec(script)
                        console.log(response)
                    }
                    if (command == '!eval') {
                        const script = content.slice(content.indexOf(" ")+1)
                        eval(script)
                    }
                    if (command == '!status') {
                        let bot2 = "```yaml\nBot works normal\n```"
                        let bot3 = "```yaml\nBot works normal```"
                        let support = "```yaml\nBot works normal\n```"
                        let Anti_crash = "```fix\nActive, level:2\n```"//"```diff\n-Not found\n```"
                        let Moderation = "```yaml\nEnable\n```"
                        let Errors = "```ini\n# None\n```"
                        let Warnings = "```ini\n# Some commands locked\n```"
                        let Console = "```ini\n[Ready]\n```"
                        let Remote_bot_control = "```diff\n-Disabled\n```"
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
                                {name: 'Trust & Safety:', value: `${Anti_Raid}`, inline: false},
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
                    if (command == '!perms') {
                        const m_id = params[1]
                        let member = await message.guild.members.fetch(m_id)
                        message.channel.send({
                            content: `${member.permissions.toArray()}`
                        })
                    }
                    if (command == '!join') {
                        const c_id = params[1]
                        const voiceChannel = await message.guild.channels.fetch(c_id)
                        const connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: voiceChannel.guild.id,
                            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                        });
                        const connect = await voiceChannel.join()
                    }
                    if (command == '!ds') {
                        message.delete()
                        const m_id = params[1]
                        const member = await message.guild.members.fetch(m_id)
                        await member.voice.disconnect();
                    }
                    if (command == '!t') {
                        message.delete()
                        const m_id = params[1]
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
                    if (command == '!remote_bot_control') {
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
-AEPS: security check failed in the command: ***blackmarket***
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
ABCS: command blackmarket disabled!
\`\`\``)
                        const Embed6 = new EmbedBuilder()
                        .setTitle('[ERROR 13]ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠ')
                        .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                        .setColor('#ffff00')
                        .setDescription(`\`\`\`
ABCS: command blocking error!
\`\`\``)
                        await message.channel.send({
                            embeds: [Embed2, Embed5],
                        })
                        await wait(1000)
                        await message.channel.send({
                            embeds: [Embed4],
                        })
                        await wait(5000)
                        await message.channel.send({
                            embeds: [Embed6],
                        })
                        await wait(1000)
                        await message.channel.send({
                            embeds: [Embed3],
                        })
                    }
                    if (command == '!temp') {
                        let member = await message.guild.members.fetch('959103322814550027')
                        console.log(member.user.dmChannel.message.cache)
                    }
                    if (command == '!veref') {
                        message.delete();
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
                    if (command == '!embed1') {
                        message.delete();
                        message.channel.send({
                            "embeds": [
                                {
                                  "title": "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Команды",
                                  "description": "**Привет! В данном канале ты сможешь ознакомиться с предназначением команд ботов на нашем сервере.**",
                                  "color": 13858812,
                                  "footer": {
                                    "text": "EMPIRE Bots",
                                    "icon_url": "https://cdn.discordapp.com/attachments/761278978760769587/1110271547270238328/0212-3-1--unscreen.gif"
                                  },
                                  "image": {
                                    "url": "https://media.discordapp.net/attachments/1079508001288888350/1125203585106448485/23.gif"
                                  }
                                },
                              ],
                        })
                    }
                    if (command == '!return') {
                        message.delete()
                        const action = params[1]
                        const Embed = new EmbedBuilder()
                                .setDescription(`${author}, ${action} действий возвращено`)
                                .setColor("#ff0000");
                            await message.channel.send({
                                embeds: [Embed]
                            })
                            .catch(console.error)
                    }
                    if (command == '!msgs') {
                        message.delete()
                        const m_id = params[1]
                        const member = await message.guild.members.fetch(m_id)
                        await member.user.createDM()
                        const messages = member.user.dmChannel.messages
                        console.log(messages.cache)
                        for (msg in messages) {
                            console.log(`${msg.author.username}: ${msg.content}`)
                        }
                    }
                    if (command == '!msgs1') {
                        message.delete()
                        const m_id = params[1]
                        const member = await message.guild.members.fetch(m_id)
                        await member.user.createDM()
                    }
                    if (command == '!case') {
                        const rowStart = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseProfileOpen')
                                    .setLabel('Открыть кейс с профилями')
                                    .setEmoji(config.emojis.openBox)
                                    .setStyle(2)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseBuy')
                                    .setLabel('Купить кейсы')
                                    .setEmoji(config.emojis.buyTokenBoxes)
                                    .setStyle(2)
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCaseGet')
                                    .setLabel('Получить подарок')
                                    .setEmoji(config.emojis.ticketBoxes)
                                    .setStyle(2)
                            )
                        const Embed = new EmbedBuilder()
                                .setTitle(`Кейсы`)
                                .setColor(config.color)
                                .setDescription(`> Приветствуем вас, наши дорогие пользователи! Как мы вам и обещали, наша команда приготовила для вас новогоднее обновление, которое порадует каждого пользователя!\n\n***Представляем вашему вниманию канал, в котором вы сможете выиграть \nㅤㅤㅤㅤㅤㅤㅤㅤㅤ красивые и атмосферные профиля!***\n\n\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ**ВОЗМОЖНОСТИ**\n\n<a:23:1060596818519523338> **Стоимость кейса: 250 **${config.emoji}\n<a:23:1060596818519523338> **Удобный интерфейс.**\n<a:23:1060596818519523338> **Красивые и ламповые профиля!**\n\n<a:blue_mark:1171073112104775783> *На время новогоднего обновления, у вас есть возможность каждый день\nㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤполучать 1 бесплатный кейс.* <a:blue_mark:1171073112104775783>`)
                                .addFields({name: `ОПИСАНИЕ:`, value: `<a:23:1060596818519523338> Для покупки кейса, нажмите на — **Купить кейс** ${config.emojis.buyTokenBoxes}\n\n<a:23:1060596818519523338> Для открытия кейса, нажмите на — **Открыть кейс** ${config.emojis.openBox}\n\n<a:23:1060596818519523338> Для получение бесплатного подарка, нажмите на — **Получить подарок** ${config.emojis.ticketBoxes}`, inline: false},)
                        await message.channel.send({
                            embeds: [Embed],
                            components: [rowStart]
                        })
                    }
                    if (command == '!vsex') {
                        let member1 = params[1]
                        let member2 = params[2]
                        let rand = Math.floor(Math.random() * 9) + 1;
                        let image;
                        switch(rand){
                            case 1: image = "https://cdn.discordapp.com/attachments/863851334612811786/863869582531493908/detail.gif"; break;
                            case 2: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868443400732692/Warasono-Fumika-Koe-De-Oshigoto-Hentai-GIF-1.gif"; break;
                            case 3: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868253255237652/11.gif"; break;
                            case 4: image = "https://cdn.discordapp.com/attachments/863851334612811786/863868249086099506/tumblr_nf56mzl9Zb1smtpyco1_1280.gif"; break;
                            case 5: image = "https://cdn.discordapp.com/attachments/863851334612811786/863862068238745640/1.gif"; break;
                            case 6: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855431217709106/tenor_3.gif"; break;
                            case 7: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855338850615368/tenor_5.gif"; break;
                            case 8: image = "https://media.discordapp.net/attachments/863851334612811786/966380983530188840/18494486-0.gif"; break;
                            case 9: image = "https://media.discordapp.net/attachments/863851334612811786/966380987044995102/cb1ae03f8d8f.gif"; break;
                            default: image = "https://cdn.discordapp.com/attachments/863851334612811786/863855338850615368/tenor_5.gif"; break;
                        }
                        const Embed = new EmbedBuilder()
                            .setDescription(`${member1} и ${member2} занялись сексом!`)
                            .setImage(image)
                            .setColor(config.color);
                        await message.chennel.send({
                            embeds: [Embed],
                            content: `${member2}`,
                        })
                    }
                } catch(err) {
                    console.log(`${command} \n ${err}`)
                }
            }
        }
    },
};