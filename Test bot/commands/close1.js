const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require('discord.js');
const { $selectMenu, $sendMessage, $row } = require("discord.js-basic")
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { emit } = require('node:process');
const { aiplatform } = require('googleapis/build/src/apis/aiplatform');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close1')
        .setDescription('a')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создание клоуза")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription("Отменить создание клоуза")
        ),
	async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const CloseChannel = await interaction.guild.channels.fetch(config.eventChannel)
        let closetime
        let block
        let bypass1;
        let sqlResult
        let title = 'Создание клоуза'
        let message
        let message1
        let logs
        let category
        let channelControl
        let closeName
        let closeText
        let ready = false;
        let members = []
        let ghost = 1
        let timeEmbed
        let timestampInput
        let closeId = 0;
        let status = 'start';
        let statusText = 'Не активен'
        let timeText = 'Не указано'
        let infoChannel
        let mainChannel
        let messageInfo
        let messageControlClose
        let closeObject = {}
        let two = n => (n > 9 ? "" : "0") + n;
        let format = now =>
            two(now.getDate()) + "." +
            two(now.getMonth() + 1) + "." +
            now.getFullYear() + " " +
            two(now.getHours()) + ":" +
            two(now.getMinutes()) + ":" +
            two(now.getSeconds());
        let time = timestamp => {
            return String(two(timestamp.getHours())) + ":" + String(two(timestamp.getMinutes()))
        }
        let getMember = (member) => {
            if (member) return `<@${member}>`
            return 'Ожидание'
        }
        let membersList = (list) => {
            const text = `${config.emojis.number1} ${config.emojis.dot} ${getMember(list[0])}
${config.emojis.number2} ${config.emojis.dot} ${getMember(list[1])}
${config.emojis.number3} ${config.emojis.dot} ${getMember(list[2])}
${config.emojis.number4} ${config.emojis.dot} ${getMember(list[3])}
${config.emojis.number5} ${config.emojis.dot} ${getMember(list[4])}`
            return text
        }
        let players = (count) => {
            if (count > 4) {
                return `Для начала игры необходимо ещё ${count} игроков!`
            }
            if (count > 1) {
                return `Для начала игры необходимо ещё ${count} игрока!`
            }
            if (count == 1) {
                return `Для начала игры необходимо ещё ${count} игрок!`
            }
            return `Клоуз скоро начнётся!`
        }
        let setClose = (timestamp) => {
            if (closeName === 'CS 2') {
                closeText = {
                    "content": null,
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤCS2",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«CS2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nТрёхмерным многопользовательским шутером от первого лица, в котором игроки распределяются по двум командам и сражаются друг против друга.\n```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Dead by Daylight') {
                closeText = {
                    "content": null,
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤDead by Daylight",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Dead by Daylight»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nDead by Daylight — это многопользовательская игра в жанре ужасов в режиме 4 против 1, где один игрок берёт на себя роль жестокого Убийцы, а четыре других игрока являются Выжившими, пытающимися сбежать от убийцы.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Dota 2') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤDota 2",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Dota 2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nDota 2 — компьютерная многопользовательская командная игра жанра стратегия в реальном времени с элементами компьютерной ролевой игры, реализация известной карты DotA для игры Warcraft III в отдельном клиенте. В игре участвуют две команды по пять человек. Одна команда играет за светлую сторону, другая — за темную.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Fortnite') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤFortnite",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Fortnite»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nFortnite — это кооперативная песочница на выживание, основными механиками которой являются исследование, сбор ресурсов, строительство укрепленных зданий и борьба с волнами наступающих зомби.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Rocket League') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤRocket League",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Rocket League»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nRocket League — аркадная гоночная игра в жанре футбола, разработанная и изданная компанией Psyonix для Windows, PlayStation 4.\n```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Valorant') {
                closeText = {
                    "content": null,
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤValorant",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Valorant»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nValorant - это многопользовательский шутер от создателей League of Legends, в котором игроков ждут противостояния команд в формате 5х5 игроков.\n```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Rainbow Six') {
                closeText = {
                    "content": null,
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤTom Clancy's Rainbow Six: Siege",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Tom Clancy's Rainbow Six: Siege»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nTom Clancy's Rainbow Six: Siege - это очередная часть знаменитого тактического шутера от первого лица, сценарий которого построен на историях реальных контртеррористических операций по всему миру.\n```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Overwatch 2') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤOverwatch 2",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Overwatch 2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOverwatch 2 — бесплатная командная игра в ярком мире будущего, каждый матч которой представляет собой поистине потрясающий бой 5 на 5.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'OSU') {
                closeText = {
                    "content": null,
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤOSU",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«OSU»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOSU — музыкальная ритм-игра, созданная в 2007 году Дином «peppy» Гербертом.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Minecraft') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤMinecraft",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Minecraft»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nMinecraft - это инди-игра в жанре песочницы с элементами выживания и открытым миром.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'League of Legends') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤLeague of Legends",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«League of Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nLeague of Legends – это стратегическая кооперативная игра, в которой две команды из пяти могущественных чемпионов сражаются друг с другом, пытаясь уничтожить вражескую базу.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Genshin Impact') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤGenshin Impact",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Genshin Impact»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\n«Геншин» — ролевая приключенческая онлайн-игра в открытом мире. Это значит, что игрок управляет персонажем, который может со старта отправиться в любой уголок игрового мира. Здесь можно играть с другими людьми — но только с их разрешения. В игре нет уровней и других условностей, которые бы постоянно ограничивали.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Brawlhalla') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤBrawlhalla",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Brawlhalla»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nBrawlhalla — Эпический платформенный файтинг, в который можно играть как в одиночку, так и при участии до 8 игроков.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Apex Legends') {
                closeText = {
                    "content": null,
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤApex Legends",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Apex Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nApex Legends — это бесплатный геройский шутер с невероятным выбором легендарных персонажей, эффектных способностей и предметов, которые можно заработать.\n```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150" + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75" + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160606557629861968/af42a3bdbae36568.gif?ex=65354616&is=6522d116&hm=83d80084ad59a1d08fbe3e394de885e04659a2589f731d43dc1bfae33f188bdd&=&width=375&height=150"
                        }
                    }],
                }
                ready = true
            }
        } 
        let createClose = async (Embed) => {
            if (DB.events[closeId].status == 'Отменён') {
                return
            }
            Embed.setDescription(`Ведущий: ${author}
Клоуз: ${closeName}
Время: ${timeText}
Статус: Клоуз создан`)
            await interaction.editReply({
                embeds: [Embed],
                components: []
            })
            await interaction.guild.channels.create({
                name: closeName,
                type: ChannelType.GuildCategory,
                position: 5,
                permissionOverwrites: [
                    {
                        id: config.roleCloseBan,
                        deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: author.id,
                        allow: [PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ManageMessages],
                    }
                ]
            })
            .then(channel => category = channel)
            .catch(err => console.log(err))
            DB.events[closeId].category = category.id;
            await interaction.guild.channels.create({
                name: 'управление_клоузом',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: author.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                    }
                ]
            })
            .then(channel => channelControl = channel)
            .catch(err => console.log(err))
            let teams = [[], []];
            if (closeName == 'CS 2' || closeName == 'Valorant' || closeName == 'Dota 2') {
                await interaction.guild.channels.create({
                    name: 'Информация',
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: config.roleCloseBan,
                            deny: [PermissionFlagsBits.ViewChannel],
                        }
                    ]
                })
                .then(channel => infoChannel = channel)
                .catch(err => console.log(err))
                await interaction.guild.channels.create({
                    name: closeName,
                    type: ChannelType.GuildText,
                    parent: category.id
                })
                .then(channel => mainChannel = channel)
                .catch(err => console.log(err))
                await interaction.guild.channels.create({
                    name: 'Общий сбор',
                    type: ChannelType.GuildVoice,
                    parent: category.id
                })
                .catch(err => console.log(err))
                const rowInfo = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseTeamA')
                            .setEmoji(config.emojis.teamA)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseTeamB')
                            .setEmoji(config.emojis.teamB)
                            .setStyle(2),
                    )
                const infoEmbed = new EmbedBuilder()
                    .setTitle(`Запись на ${closeName}`)
                    .setColor(config.color)
                    .setDescription(`Количество участников: **${teams[0].length + teams[1].length}**
Для начала игры необходимо ещё ${10-teams[0].length + teams[1].length} игроков!`)
                    .setFields(
                        {name: `${config.emojis.terrorists} Team A`, value: `${membersList(teams[0])}`, inline: true},
                        {name: `${config.emojis.countrTerrorists} Team B`, value: `${membersList(teams[1])}`, inline: true}
                    )
                await infoChannel.send({
                    embeds: [infoEmbed],
                    components: [rowInfo]
                })
                .then((msg) => messageInfo = msg)
                .catch()
                const filter4 = ButtonInteraction => ButtonInteraction.customId === 'buttonCloseTeamA' || ButtonInteraction.customId === 'buttonCloseTeamB';

                const collector4 = messageInfo.createMessageComponentCollector({ filter4 });

                collector4.on('collect', async ButtonInteraction => {
                    let ButtonMember = ButtonInteraction.member;
                    if (teams[0].includes(ButtonMember.id) || teams[1].includes(ButtonMember.id)) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, вы уже учавствуйте в клоузе`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`${ButtonMember}, вы записаны на клоуз`);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    if (ButtonInteraction.customId === 'buttonCloseTeamA') {
                        teams[0].push(ButtonInteraction.member.id);
                        if (teams[0].length == 5) {
                            rowInfo.components[0].setDisabled(true)
                        }
                        infoEmbed
                            .setDescription(`Количество участников: **${teams[0].length + teams[1].length}**\n${players(10-teams[0].length - teams[1].length)}`)
                            .setFields(
                                {name: `${config.emojis.terrorists} Team A`, value: `${membersList(teams[0])}`, inline: true},
                                {name: `${config.emojis.countrTerrorists} Team B`, value: `${membersList(teams[1])}`, inline: true}
                            )
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: [rowInfo]
                        })
                    } else {
                        teams[1].push(ButtonInteraction.member.id);
                        if (teams[1].length == 5) {
                            rowInfo.components[1].setDisabled(true)
                        }
                        infoEmbed
                            .setDescription(`Количество участников: **${teams[0].length + teams[1].length}**\n${players(10-teams[0].length - teams[1].length)}`)
                            .setFields(
                                {name: `${config.emojis.terrorists} Team A`, value: `${membersList(teams[0])}`, inline: true},
                                {name: `${config.emojis.countrTerrorists} Team B`, value: `${membersList(teams[1])}`, inline: true}
                            )
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: [rowInfo]
                        })
                    }
                })
            } else {
                await interaction.guild.channels.create({
                    name: closeName,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                })
                .catch(err => console.log(err))
            }
            await author.user.send({
                content: `${author}, клоуз создан`
            })
            .catch()
            if (members.length) {
                for (let i = 0; i < members.length; i++) {
                    await members[i].send({
                        content: `${members[i]}, приготовтесь, клоуз ${closeName} начинается!`
                    })
                    .catch()
                }
            }
            const rowSettings1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonCloseEditLimit')
                        .setEmoji(config.emojis.changeLimit)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonCloseLock')
                        .setEmoji(config.emojis.ban)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonCloseUnlock')
                        .setEmoji(config.emojis.unban)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonCloseMute')
                        .setEmoji(config.emojis.voiceMute)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonCloseUnmute')
                        .setEmoji(config.emojis.voiceUnmute)
                        .setStyle(2),
                )
            if (closeName == 'CS 2' || closeName == 'Valorant' || closeName == 'Dota 2') {
                const rowSettings2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseStart')
                            .setEmoji(config.emojis.startEvent)
                            .setStyle(3),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseReplace')
                            .setEmoji(config.emojis.replace)
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseClose')
                            .setEmoji(config.emojis.cancel)
                            .setStyle(4),
                    )
                const settingsEmbed = new EmbedBuilder()
                    .setTitle('Управление ивентом')
                    .setColor(config.color)
                    .setDescription(`${config.emojis.changeLimit} - Изменить лимит комнаты
${config.emojis.ban} - закрыть комнату
${config.emojis.unban} - открыть комнату
${config.emojis.voiceMute} - замутить всех входящих
${config.emojis.voiceUnmute} - размутить всех входящих
${config.emojis.startEvent} - Начать клоуз
${config.emojis.replace} - заменить участника
${config.emojis.cancel} - закончить клоуз`)
                await channelControl.send({
                    embeds: [settingsEmbed],
                    components: [rowSettings1, rowSettings2]
                })
                .then((msg) => messageControlClose = msg)
            } else {
                const rowSettings2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseClose')
                            .setEmoji(config.emojis.cancel)
                            .setStyle(4),
                    )
                const settingsEmbed = new EmbedBuilder()
                    .setTitle('Управление ивентом')
                    .setColor(config.color)
                    .setDescription(`${config.emojis.changeLimit} - Изменить лимит комнаты
${config.emojis.ban} - закрыть комнату
${config.emojis.unban} - открыть комнату
${config.emojis.voiceMute} - замутить всех входящих
${config.emojis.voiceUnmute} - размутить всех входящих
${config.emojis.cancel} - закончить клоуз`)
                await channelControl.send({
                    embeds: [settingsEmbed],
                    components: [rowSettings1, rowSettings2]
                })
                .then((msg) => messageControlClose = msg)
            }
            const filter3 = ButtonInteraction => ButtonInteraction.customId === 'buttonCloseEditLimit' || ButtonInteraction.customId === 'buttonCloseLock' || ButtonInteraction.customId === 'buttonCloseUnlock' || ButtonInteraction.customId === 'buttonCloseMute' || ButtonInteraction.customId === 'buttonCloseUnmute' || ButtonInteraction.customId === 'buttonCloseClose' || ButtonInteraction.customId === 'buttonCloseStart' || ButtonInteraction.customId === 'buttonCloseReplace';

            const collector3 = messageControlClose.createMessageComponentCollector({ filter3});

            collector3.on('collect', async ButtonInteraction => {
                let voice = ButtonInteraction.member.voice.channel
                let ButtonMember = ButtonInteraction.member
                const Embed = new EmbedBuilder()
                    .setColor(config.color)
                if ((!voice || voice.parentId !== category.id) && ButtonInteraction.customId !== 'buttonCloseClose' && ButtonInteraction.customId !== 'buttonCloseStart' && ButtonInteraction.customId !== 'buttonCloseReplace') {
                    Embed
                        .setDescription(`${author}, вы должны находиться в соданном голосовом канале`)
                        .setColor(config.colorError)
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseEditLimit') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalCloseEditLimit')
                        .setTitle('Изменить лимит голосового канала');
                    const input = new TextInputBuilder()
                        .setCustomId('modalCloseEditLimitInput')
                        .setLabel('Введите новый лимит')
                        .setPlaceholder('1')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(2)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(input)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'buttonCloseEditLimit';
                    ButtonInteraction.awaitModalSubmit({ time: 300000 })
                    .then(async ModalInteraction => {
                        let limitInput = ModalInteraction.components[0].components[0].value
                        if (limitInput != parseInt(limitInput) || limitInput < 0 || limitInput > 100) {
                            Embed
                                .setDescription(`${author}, введите корректное число от 0 до 99`)
                                .setColor(config.colorError);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                            return
                        }
                        await voice.setUserLimit(parseInt(limitInput))
                        Embed
                            .setDescription(`${author}, лимит успешно изменён`)
                            .setColor(config.color);
                        await ModalInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                    })
                    .catch((err) => {
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseLock') {
                    await voice.permissionOverwrites.edit(interaction.guild.id, {
                        Connect: false
                    })
                    Embed
                        .setDescription(`${author}, комната закрыта от всех`)
                        .setColor(config.color);
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseUnlock') {
                    await voice.permissionOverwrites.edit(interaction.guild.id, {
                        Connect: null
                    })
                    Embed
                        .setDescription(`${author}, комната открыта для всех`)
                        .setColor(config.color);
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseMute') {
                    await voice.permissionOverwrites.edit(interaction.guild.id, {
                        Speak: true
                    })
                    Embed
                        .setDescription(`${author}, теперь входящие в голосовой канал не смогут говорить`)
                        .setColor(config.color);
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseUnmute') {
                    await voice.permissionOverwrites.edit(interaction.guild.id, {
                        Speak: null
                    })
                    Embed
                        .setDescription(`${author}, теперь входящие в голосовой канал смогут говорить`)
                        .setColor(config.color);
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonCloseClose') {
                    collector3.stop()
                    await ButtonInteraction.deferUpdate()
                    if (!ghost) {
                        logEmbed
                            .setDescription(`[1] ${author}(${author.id})
[2] Клоуз/ID: ${closeName} (${sqlResult[0].closeid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Завершён(${ButtonInteraction.member})`);
                        await logs.edit({
                            embeds: [logEmbed],
                        })
                    }
                    let parent = ButtonInteraction.channel.parent
                    for (var [key, value] of parent.children.cache) {
                        await value.delete()
                    }
                    await parent.delete()
                }
                if (ButtonInteraction.customId === 'buttonCloseStart') {
                    if (teams[0].length == 5 && teams[1].length == 5) {
                        let voiceA;
                        let voiceB;
                        await interaction.guild.channels.create({
                            name: 'Team A',
                            type: ChannelType.GuildVoice,
                            parent: category.id,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: author.id,
                                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers,],
                                },
                                {
                                    id: teams[0][0],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[0][1],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[0][2],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[0][3],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[0][4],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                            ]
                        })
                        .then((voice) => voiceA = voice)
                        .catch(err => console.log(err))
                        await interaction.guild.channels.create({
                            name: 'Team B',
                            type: ChannelType.GuildVoice,
                            parent: category.id,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.id,
                                    deny: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: author.id,
                                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers,],
                                },
                                {
                                    id: teams[1][0],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[1][1],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[1][2],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[1][3],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                                {
                                    id: teams[1][4],
                                    allow: [PermissionFlagsBits.Connect],
                                },
                            ]
                        })
                        .then((voice) => voiceB = voice)
                        .catch(err => console.log(err))
                        const infoEmbed = new EmbedBuilder()
                            .setTitle(`Запись на ${closeName}`)
                            .setColor(config.color)
                            .setDescription(`Количество участников: **${teams[0].length + teams[1].length}**\nКлоуз начался!`)
                            .setFields(
                                {name: `${config.emojis.terrorists} Team A`, value: `${membersList(teams[0])}`, inline: true},
                                {name: `${config.emojis.countrTerrorists} Team B`, value: `${membersList(teams[1])}`, inline: true}
                            )
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: []
                        })
                    } else {

                    }
                }
                if (ButtonInteraction.customId === 'buttonCloseReplace') {
                    if (teams[0].length+teams[0].length == 0) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, в списке нет записавшихся пользователей`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    let ButtonInteractionReply = ButtonInteraction
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('selectMenuCloseReplace')
                        .setPlaceholder('Выберите пользователя')
                        .setMaxValues(1)
                    let list = []
                    for (let i = 0; i < teams[0].length; i++) {
                        let member = await interaction.guild.members.fetch(teams[0][i])
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(member.displayName)
                                .setValue(member.id)
                        )
                    } 
                    for (let i = 0; i < teams[1].length; i++) {
                        let member = await interaction.guild.members.fetch(teams[1][i])
                        selectMenu.addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(member.displayName)
                                .setValue(member.id)
                        )
                    } 
                    const selectEmbed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`${ButtonMember}, выберите пользователя`);
                    const rowMembers = new ActionRowBuilder().addComponents(selectMenu)
                    await ButtonInteractionReply.reply({
                        embeds: [selectEmbed],
                        components: [rowMembers],
                        ephemeral: true
                    })
                    .then((msg) => {
                        message = msg
                    })
                    status = 'collector5'
                    const collector5 = message.createMessageComponentCollector({ time: 60000 });
        
                    collector5.on('collect', async ButtonInteraction => {
                        await ButtonInteraction.deferUpdate()
                        let ButtonMember = ButtonInteraction.user;
                        status = 'end'
                        collector5.stop()
                        let memberId = ButtonInteraction.values[0]
                        const rowInfo = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCloseTeamA')
                                    .setEmoji(config.emojis.teamA)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonCloseTeamB')
                                    .setEmoji(config.emojis.teamB)
                                    .setStyle(2),
                            )
                        if (teams[0].includes(memberId)) {
                            teams[0].splice(teams[0].indexOf(memberId))
                            if (teams[0].length == 5) {
                                rowInfo.components[1].setDisabled(false)
                            }
                        }
                        else {
                            teams[1].splice(teams[1].indexOf(memberId))
                            if (teams[1].length == 5) {
                                rowInfo.components[1].setDisabled(false)
                            }
                        }
                        const infoEmbed = new EmbedBuilder()
                            .setTitle(`Запись на ${closeName}`)
                            .setColor(config.color)
                            .setDescription(`Количество участников: **${teams[0].length + teams[1].length}**
Для начала игры необходимо ещё ${10-teams[0].length + teams[1].length} игроков!`)
                            .setFields(
                                {name: `${config.emojis.terrorists} Team A`, value: `${membersList(teams[0])}`, inline: true},
                                {name: `${config.emojis.countrTerrorists} Team B`, value: `${membersList(teams[1])}`, inline: true}
                            )
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: [rowInfo]
                        })
                        selectEmbed.setDescription(`${ButtonMember} пользователь исключён из спика команды`)
                        await ButtonInteractionReply.editReply({
                            embeds: [selectEmbed],
                            components: []
                        })
                    })
                    collector5.on('end', async () => {
                        if (status == 'collector5') {
                            rowMembers.components[0].setDisabled(true)
                            await message.edit({
                                components: [rowMembers]
                            })
                        }
                    })
                }
            })
        }
        switch (subcommand) {
            case 'create': title=`Создание ивента`;break;
            case 'cancel': title=`Отменить создание ивента`;break;
        }
        if (!author.roles.cache.has(config.roleClose) && !author.roles.cache.has(config.roleMafia) && author.id != config.owner_id) {
            const embedError = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, вы не можете этого делать`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [embedError],
                ephemeral: true
            })
            return
        }
        if (subcommand === 'create') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new $selectMenu()
                        .customId("SelectMenuCreateClose")
                        .placeholder("Close")
                        .options({
                                label: 'CS2',
                                description: '',
                                value: 'CS 2',
                            },
                            {
                                label: 'Dead by Daylight',
                                description: '',
                                value: 'Dead by Daylight',
                            },
                            {
                                label: 'Dota 2',
                                description: '',
                                value: 'Dota 2',
                            },
                            {
                                label: 'Fortnite',
                                description: '',
                                value: 'Fortnite',
                            },
                            {
                                label: 'Rocket League',
                                description: '',
                                value: 'Rocket League',
                            },
                            {
                                label: 'Valorant',
                                description: '',
                                value: 'Valorant',
                            },
                            {
                                label: "Tom Clancy's Rainbow Six: Siege",
                                description: '',
                                value: 'r6',
                            },
                            {
                                label: 'Overwatch 2',
                                description: '',
                                value: 'Overwatch 2',
                            },
                            {
                                label: 'OSU',
                                description: '',
                                value: 'osu',
                            },
                            {
                                label: 'Minecraft',
                                description: '',
                                value: 'Minecraft',
                            },
                            {
                                label: 'League of Legends',
                                description: '',
                                value: 'League of Legends',
                            },
                            {
                                label: 'Genshin Empact',
                                description: '',
                                value: 'Genshin Impact',
                            },
                            {
                                label: 'Brawlhalla',
                                description: '',
                                value: 'Brawlhalla',
                            },
                            {
                                label: 'Apex',
                                description: '',
                                value: 'Apex Legends',
                            }
                            )
                        .save()
                )
            row.components[0].data
            const Embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, выберите клоуз`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then((msg) => {
                message = msg
            })
            status = 'collector'
            const collector = message.createMessageComponentCollector({ time: 60000 });

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
                await ButtonInteraction.deferUpdate()
                collector.stop()
                closeName = ButtonInteraction.values[0]
                const rowTime = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseSendNow')
                            .setLabel('Начать сейчас')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseSendTime')
                            .setLabel('Запланировать')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonCloseCancel')
                            .setLabel('Отмена')
                            .setStyle(4)
                    );
                Embed.setDescription(`Ведущий: ${author}
Клоуз: ${closeName}
Время: ${timeText}
Статус: ${statusText}`)
                await interaction.editReply({
                    embeds: [Embed],
                    components: [rowTime]
                })
                status = 'collector1'
                const filter1 = ButtonInteraction => ButtonInteraction.customId === 'buttonCloseSendNow' || ButtonInteraction.customId === 'buttonCloseSendTime' || ButtonInteraction.customId === 'buttonCloseCancel';

                const collector1 = message.createMessageComponentCollector({ filter1, time: 600000 });

                collector1.on('collect', async ButtonInteraction => {
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
                    if (ButtonInteraction.customId === 'buttonCloseCancel') {
                        await ButtonInteraction.deferUpdate()
                        status = 'end'
                        collector1.stop()
                        Embed.setDescription(`Ведущий: ${author}
Клоуз: ${closeName}
Время: ${timeText}
Статус: Отменён`)
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                        return
                    }
                    closeId = DB.settings.closes;
                    DB.settings.closes+=1
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Close')
                        .setColor('#00ff00')
                    if (ButtonInteraction.customId === 'buttonCloseSendNow') {
                        await ButtonInteraction.deferUpdate()
                        collector1.stop()
                        status = 'wait'
                        timeEmbed = new Date()
                        setClose(timeEmbed)
                        const EmbedClose = new EmbedBuilder()
                            .setTitle(closeText[0].title)
                            .setDescription(closeText[0].description)
                            .setColor(closeText[0].color)
                            .addFields(closeText[0].fields)
                            .setImage(closeText[0].image.url)
                        await CloseChannel.send({
                            content: `<@&1121809323736191058>`,
                            embeds: [EmbedClose],
                        })
                        closeObject = {
                            author: author.id,
                            name: closeName,
                            time: timeEmbed,
                            status: 'Клоуз создан',
                            category: undefined
                        }
                        DB.events[closeId] = closeObject
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
[2] Клоуз/ID: ${closeName} (${sqlResult[0].closeid})
[3] Время: ${format(timestampInput)}(${timestampInput})
[4] Статус: Клоуз создан`)
                            logs = await logChannel.send({
                                embeds: [logEmbed],
                            })
                        }
                        message1 = await CloseChannel.send(closeText)
                        timeText = format(timeEmbed)
                        createClose(Embed)
                    }
                    if (ButtonInteraction.customId === 'buttonCloseSendTime') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalCreateClose')
                            .setTitle('Создание ивента');
                        const timestampTextInput = new TextInputBuilder()
                            .setCustomId('modalCreateCloseInput')
                            .setLabel('Введите timestamp')
                            .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(timestampTextInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalCreateClose';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 600000 })
                        .then(async ModalInteraction => {
                            status = 'wait'
                            collector1.stop()
                            timestampInput = parseInt(ModalInteraction.components[0].components[0].value)*1000
                            if ((timestampInput == NaN) || (timestampInput < Date.now())) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, укажите корректное время ивента`);
                                await ModalInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ModalInteraction.deferUpdate()
                            setClose(new Date(timestampInput))
                            const EmbedClose = new EmbedBuilder()
                                .setTitle(closeText[0].title)
                                .setDescription(closeText[0].description)
                                .setColor(closeText[0].color)
                                .addFields(closeText[0].fields)
                                .setImage(closeText[0].image.url)
                            timeEmbed = timestampInput-60*60*1000
                            closeObject = {
                                author: author.id,
                                name: closeName,
                                time: timestampInput,
                                status: 'Запланирован',
                                category: undefined
                            }
                            DB.events[closeId] = closeObject
                            timeText = format(timestampInput)
                            if (timeEmbed > Date.now()) {
                                Embed.setDescription(`Ведущий: ${author}
Клоуз: ${closeName}
Время: ${format(time)}
Статус: Запланирован`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                await wait(timeEmbed-Date.now())
                            }
                            const rowClose = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('buttonCloseRegistration')
                                        .setLabel('Записаться')
                                        .setStyle(2),
                                )
                            if (!ghost) {
                                logEmbed
                                    .setDescription(`[1] ${author}(${author.id})
[2] Клоуз/ID: ${closeName} (${sqlResult[0].closeid})
[3] Время: ${format(timestampInput)}(${timestampInput})
[4] Статус: Отправлен вебхук`)
                                logs = await logChannel.send({
                                    embeds: [logEmbed],
                                })
                            }
                            DB.events[closeId].status = 'Отправлен вебхук'
                            Embed.setDescription(`Ведущий: ${author}
Клоуз: ${closeName}
Время: ${format(time)}
Статус: Отправлен вебхук`)
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            message1 = await CloseChannel.send({
                                content: `<@&1121809323736191058>`,
                                embeds: [EmbedClose],
                                components: [rowClose]
                            })
                            const filter2 = ButtonInteraction => ButtonInteraction.customId === 'buttonCloseRegistration'

                            const collector2 = message1.createMessageComponentCollector({ filter2, time: timestampInput-Date.now() });

                            collector2.on('collect', async ButtonInteraction => {
                                if (DB.events[closeId]) {
                                    await ButtonInteraction.reply({
                                        content: `${ButtonInteraction.member}, клоуз был отменён`,
                                        ephemeral: true
                                    })
                                    collector2.stop()
                                    return
                                }
                                await ButtonInteraction.reply({
                                    content: `${ButtonInteraction.member}, вам будет прислано уведомление о начале ивента`,
                                    ephemeral: true
                                })
                                members.push(ButtonInteraction.member)
                            })
                            collector2.on('end', async () => {
                                rowClose.components[0].setDisabled(true)
                                await message1.edit({
                                    components: [rowClose]
                                })
                                createClose(Embed)
                            })
                        })
                    }
                })
                collector1.on('end', async () => {
                    if (status == 'collector1') {
                        for (let i = 0; i<rowTime.components.length; i++) {
                            rowTime.components[0].setDisabled(true)
                        }
                        await interaction.editReply({
                            components: [rowTime]
                        })
                    }
                })
            })
            collector.on('end', async () => {
				if (status == 'collector') {
                    row.components[0].setDisabled(true)
					await interaction.editReply({
						components: [row]
					})
				}
			})
        }
	}
};