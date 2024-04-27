const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require('discord.js');
const { $selectMenu } = require("discord.js-basic")
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
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
                .addIntegerOption(option => 
                    option.setName('id')
                    .setDescription('ID клоуза')
                    .setRequired(true))
        ),
	async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCloses}`)
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
        let closeId = 'Ивент не активен';
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
                    "content": "<@&1121809323736191058>",
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤCS2",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«CS2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nТрёхмерным многопользовательским шутером от первого лица, в котором игроки распределяются по двум командам и сражаются друг против друга.\n```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981390144733357/CS.gif?ex=661bd47f&is=66095f7f&hm=77bbd50f3ef26dde3bab993129cdba8840d8e11421b40a293dfc6373ee0262a2&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Dead by Daylight') {
                closeText = {
                    "content": "<@&1121809323736191058>",
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981390530478161/dbd.gif?ex=661bd47f&is=66095f7f&hm=704c1b75179d2891f7b42dec2b2e828897a0b9f65e623b1b5f720b9e35b21719&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Dota 2') {
                closeText = {
                    "content": "<@&1121809323736191058>",
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981390945845259/Dota.gif?ex=661bd480&is=66095f80&hm=7ad1ed71a2117c219f30ddac3957b7027dbe9805c0cbf0131c1b3d9ba80088fa&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Fortnite') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤFortnite",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Fortnite»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nFortnite — это кооперативная песочница на выживание, основными механиками которой являются исследование, сбор ресурсов, строительство укрепленных зданий и борьба с волнами наступающих зомби.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981391306424330/fortnite.gif?ex=661bd480&is=66095f80&hm=d28ce25c606ed82f127af84fb58a878ef9e5cd3ac2042933ca68c33b405fb4d5&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Among Us') {
                closeText =  [{
                    "title": "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Among Us",
                    "description": "Дорогие участники сервера, сегодня в ** __`" + time(timestamp) + " по мск`__, ** у нас проходит увлекательный ивент по игре «Among us»\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nAmong Us - это мультяшная аркада выполненная в двухмерном стиле, где игроки в количестве от 5 до 15 игроков должны попытаться подготовить свой космический корабль к вылету. Однако всё не так просто, как кажется, ведь несколько пользователей являются скрытыми убийцами. Фактически эта игра - аналог \"Мафии\", где для успешной подрывной деятельности игроки должны вводить своих оппонентов в заблуждение и делать всё возможное, чтобы одержать победу.\n```",
                    "color": 1179629,
                    "fields": [{
                        "name": "Награда за победу",
                        "value": "100 " + config.emoji,
                        "inline": true
                    },
                    {
                        "name": "Награда за участие",
                        "value": "50 " + config.emoji,
                        "inline": true
                    }],
                    "image": {
                        "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981491718193233/Among_Us.gif?ex=661bd498&is=66095f98&hm=269a63697e7220588932cb8c3bec15251a4c69cd839085bd2b6de43b718d3020&="
                    }
                }]
                ready = true
            }
            if (closeName === 'Rocket League') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤRocket League",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Rocket League»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nRocket League — аркадная гоночная игра в жанре футбола, разработанная и изданная компанией Psyonix для Windows, PlayStation 4.\n```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981436898639882/Rocket_League.gif?ex=661bd48b&is=66095f8b&hm=a6e478ebc271a50e944784642af74db386b8490387432f50e0801a9993c7e948&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Valorant') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤValorant",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Valorant»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nValorant - это многопользовательский шутер от создателей League of Legends, в котором игроков ждут противостояния команд в формате 5х5 игроков.\n```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981437263282267/Valorant.gif?ex=661bd48b&is=66095f8b&hm=317e1335eeb4d90a830f8183383e19347e8e31d9a597ddcc34ba48b4515c2a2e&="
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Rainbow Six') {
                closeText = {
                    "content": "<@&1121809323736191058>",
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981438525767721/bc7512ffa5f950a4.gif?ex=661bd48b&is=66095f8b&hm=6635d707629ad57af2794f7b31b978407793abd34f1f2bf147ca492882c54c24&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Overwatch 2') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤOverwatch 2",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Overwatch 2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOverwatch 2 — бесплатная командная игра в ярком мире будущего, каждый матч которой представляет собой поистине потрясающий бой 5 на 5.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981436483276922/overwatch_2.gif?ex=661bd48a&is=66095f8a&hm=140bb57fe06620b33ba8d85d0be3b8f7f4c4b84a24f3946f6fc6f5dcc3376c3a&="
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'OSU') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [
                    {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤOSU",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«OSU»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOSU — музыкальная ритм-игра, созданная в 2007 году Дином «peppy» Гербертом.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981436055322739/OSU.gif?ex=661bd48a&is=66095f8a&hm=3d765a0e1ee02cdc97fdc0f9495b1ec0d7fd1eb2018068165e200e93851a7a4b&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Minecraft') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤMinecraft",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Minecraft»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nMinecraft - это инди-игра в жанре песочницы с элементами выживания и открытым миром.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981388827590756/Minecraft.gif?ex=661bd47f&is=66095f7f&hm=a098fcebd0b35455c30a06921ff07602884a0ed6835a8a18c0845bc6f196fc1c&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'League of Legends') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤLeague of Legends",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«League of Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nLeague of Legends – это стратегическая кооперативная игра, в которой две команды из пяти могущественных чемпионов сражаются друг с другом, пытаясь уничтожить вражескую базу.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981393017831434/Lol.gif?ex=661bd480&is=66095f80&hm=8a9bb9c326c0d7db946f3afd4e9da6855dcbdce909cb0b24945ef2ff46412bec&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Genshin Impact') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤGenshin Impact",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Genshin Impact»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\n«Геншин» — ролевая приключенческая онлайн-игра в открытом мире. Это значит, что игрок управляет персонажем, который может со старта отправиться в любой уголок игрового мира. Здесь можно играть с другими людьми — но только с их разрешения. В игре нет уровней и других условностей, которые бы постоянно ограничивали.```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981391835037727/Genshin_impact.gif?ex=661bd480&is=66095f80&hm=96d0828df5474d334bbce80aec455085f99af0467af8691cf13f9d870a091405&="
                        }
                    }]
                }
                ready = true
            }
            if (closeName === 'Brawlhalla') {
                closeText = {
                    "content": "<@&1121809323736191058>",
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981389830029332/brawlhalla.gif?ex=661bd47f&is=66095f7f&hm=3c1f4c0fd85c82f19e377f2baa1d4844ab02c6d630c83f3ec80180cb7fb1770d&="
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Apex Legends') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤApex Legends",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Apex Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nApex Legends — это бесплатный геройский шутер с невероятным выбором легендарных персонажей, эффектных способностей и предметов, которые можно заработать.\n```",
                        "color": 1179629,
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
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981389431701514/Apex.gif?ex=661bd47f&is=66095f7f&hm=a32cbd5ff58e13ffea7c71a4a94d52092269a1731ed122bb3e05e3dd0c4583af&="
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'fall guys') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [
                        {
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤFALL GUYS",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Roblox»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Fall Guys — компьютерная многопользовательская игра, разработанная британской студией Mediatonic и изданная компанией Devolver Digital. Проект был анонсирован в 2019 году в рамках выставки E3. Выход игры состоялся в 2020 году на платформах Windows и PlayStation 4.```",
                        "color": null,
                        "fields": [
                            {
                                "name": "Награда за победу:",
                                "value": "150 <:Money:1153010563505475645>",
                                "inline": true
                            },
                            {
                                "name": "Награда за участие:",
                                "value": "75 <:Money:1153010563505475645>",
                                "inline": true
                            }
                        ],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1224719589707878523/ecdcef15650c80e6.gif?ex=661e8400&is=660c0f00&hm=5b8b188d78b341fc81bd95a5fd99396248226123788448452ed87c3606c3e917&=&width=440&height=208"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Roblox') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤRoblox",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Roblox»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Roblox — игровая онлайн-платформа и система создания игр, позволяющая любому пользователю создавать свои собственные и играть в созданные другими игры, охватывающие широкий спектр жанров. В некоторых источниках Roblox называют метавселенной.```",
                        "color": null,
                        "fields": [
                            {
                                "name": "Награда за победу:",
                                "value": "150 <:Money:1153010563505475645>",
                                "inline": true
                            },
                            {
                                "name": "Награда за участие:",
                                "value": "75 <:Money:1153010563505475645>",
                                "inline": true
                            }
                        ],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1224719785284206755/304cf1131dbe25a8.gif?ex=661e842f&is=660c0f2f&hm=0b8d44b7ad27da6b64dceb67918cd90efceecb28260ce27cc99d8cbb0d8cf253&=&width=480&height=228"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'PUBG') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤPUBG",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«PUBG»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```PUBG: Battlegrounds — многопользовательская онлайн-игра в жанре королевской битвы, разрабатываемая и издаваемая студией PUBG Corporation, дочерней компанией корейского издателя Krafton, ранее известного как Bluehole.```",
                        "color": null,
                        "fields": [
                            {
                              "name": "Награда за победу:",
                              "value": "150 <:Money:1153010563505475645>",
                              "inline": true
                            },
                            {
                              "name": "Награда за участие:",
                              "value": "75 <:Money:1153010563505475645>",
                              "inline": true
                            }
                        ],
                        "image": {
                          "url": "https://media.discordapp.net/attachments/720080933046452307/1224719912937848932/258a7f4125627755.gif?ex=661e844d&is=660c0f4d&hm=6eb85d4cfc9c7505acddd7beadb5de4b8edcce9ca6e9e690c5b4c441efbe25c0&=&width=480&height=228"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'Garrys') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤ ㅤ Garry’s Mod",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Garry’s Mod»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Garry’s Mod — компьютерная игра, физическая «песочница», которая позволяет игроку манипулировать объектами и экспериментировать с физикой, реализм которой обеспечивается движком Source.```",
                        "color": null,
                        "fields": [
                            {
                              "name": "Награда за победу:",
                              "value": "150 <:Money:1153010563505475645>",
                              "inline": true
                            },
                            {
                              "name": "Награда за участие:",
                              "value": "75 <:Money:1153010563505475645>",
                              "inline": true
                            }
                        ],
                        "image": {
                          "url": "https://media.discordapp.net/attachments/720080933046452307/1224720405286359153/c88e2b1d012902e5.gif?ex=661e84c2&is=660c0fc2&hm=219df0007d4603f077ff399ac49d49726fc2f884cde703d44a4771572a439346&=&width=480&height=228"
                        }
                    }],
                }
                ready = true
            }
            if (closeName === 'gta') {
                closeText = {
                    "content": "<@&1121809323736191058>",
                    "embeds": [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤGTA V",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«GTA V»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Grand Theft Auto V — компьютерная игра в жанре action-adventure с открытым миром, разработанная компанией Rockstar North и изданная компанией Rockstar Games.```",
                        "color": null,
                        "fields": [
                            {
                              "name": "Награда за победу:",
                              "value": "150 <:Money:1153010563505475645>",
                              "inline": true
                            },
                            {
                              "name": "Награда за участие:",
                              "value": "75 <:Money:1153010563505475645>",
                              "inline": true
                            }
                        ],
                        "image": {
                          "url": "https://media.discordapp.net/attachments/720080933046452307/1224722371957493770/gta_5.gif?ex=661e8697&is=660c1197&hm=3c2035fade07dfbdda1ee67b4e008446bf80c35f25cd8070caf83d01b80f9af0&=&width=480&height=228"
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
            Embed.setDescription(`ID: ${closeId}
Ведущий: ${author}
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
            try {
                await author.user.send({
                    content: `${author}, клоуз создан`
                })
                .catch()
            } catch(err) {
                
            }
            try {
                if (members.length > 0) {
                    for (let i = 0; i < members.length; i++) {
                        await members[i].send({
                            content: `${members[i]}, приготовтесь, клоуз ${closeName} начинается!`
                        })
                        .catch()
                    }
                }
            } catch(err) {

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
                            .setEmoji(config.emojis.start)
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
                    .setTitle('Управление клоузом')
                    .setColor(config.color)
                    .setDescription(`${config.emojis.changeLimit} - Изменить лимит комнаты
${config.emojis.ban} - закрыть комнату
${config.emojis.unban} - открыть комнату
${config.emojis.voiceMute} - замутить всех входящих
${config.emojis.voiceUnmute} - размутить всех входящих
${config.emojis.start} - Начать клоуз
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
                    .setTitle('Управление клоузом')
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
                        Embed
                            .setDescription(`${author}, клоуз запущен`)
                        await ButtonInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
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
                                {
                                    id: author.id,
                                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers],
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
                                {
                                    id: author.id,
                                    allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.MuteMembers],
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
                        Embed.setColor(config.colorError)
                            .setDescription(`${author}, для создания клоуза нужно 10 участников`)
                        await ButtonInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
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
            case 'create': title=`Создание клоуза`;break;
            case 'cancel': title=`Отменить создание клоуза`;break;
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
                                label: 'Ивент Among Us',
                                description: '',
                                value: 'Among Us',
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
                            },
                            {
                                label: 'FALL GUYS',
                                description: '',
                                value: 'fall guys',
                            },
                            {
                                label: 'Roblox',
                                description: '',
                                value: 'Roblox',
                            },
                            {
                                label: 'PUBG',
                                description: '',
                                value: 'PUBG',
                            },
                            {
                                label: 'Garry’s Mod',
                                description: '',
                                value: 'Garrys',
                            },
                            {
                                label: 'GTA V',
                                description: '',
                                value: 'gta',
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
                status = 'collector1'
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
                Embed.setDescription(`ID: ${closeId}
Ведущий: ${author}
Клоуз: ${closeName}
Время: ${timeText}
Статус: ${statusText}`)
                await interaction.editReply({
                    embeds: [Embed],
                    components: [rowTime]
                })
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
                        Embed.setDescription(`ID: ${closeId}
Ведущий: ${author}
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
                        /*const EmbedClose = new EmbedBuilder()
                            .setTitle(closeText[0].title)
                            .setDescription(closeText[0].description)
                            .setColor(closeText[0].color)
                            .addFields(closeText[0].fields)
                            .setImage(closeText[0].image.url)*/
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
                            .setTitle('Создание клоуза');
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
                                    .setDescription(`${author}, укажите корректное время клоуза`);
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
                                Embed.setDescription(`ID: ${closeId}
Ведущий: ${author}
Клоуз: ${closeName}
Время: ${format(time)}
Статус: Запланирован`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                await wait(timeEmbed-Date.now())
                                if (!DB.events[closeId]) return
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
                            Embed.setDescription(`ID: ${closeId}
Ведущий: ${author}
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
                                if (!DB.events[closeId]) {
                                    await ButtonInteraction.reply({
                                        content: `${ButtonInteraction.member}, клоуз был отменён`,
                                        ephemeral: true
                                    })
                                    collector2.stop()
                                    return
                                }
                                await ButtonInteraction.reply({
                                    content: `${ButtonInteraction.member}, вам будет прислано уведомление о начале клоуза`,
                                    ephemeral: true
                                })
                                members.push(ButtonInteraction.member)
                            })
                            collector2.on('end', async () => {
                                rowClose.components[0].setDisabled(true)
                                await message1.edit({
                                    components: [rowClose]
                                })
                                if (DB.events[closeId]) createClose(Embed)
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
        if (subcommand === 'cancel') {
            const closeId = interaction.options.getInteger('id');
            const eventObject = DB[closeId]
            /*
            eventObject = {
                    author: ,
                    name: ,
                    time: ,
                    status: Не активен, Отменён, Запланирован, Отправлен вебхук, Ивент создан
                    category: 
                }
            */
            if (!eventObject) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle(title)
                    .setColor(config.colorError)
                    .setDescription(`${author}, клоуз не найден`);
                await interaction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                })
            }
            let cancelClose = async (Embed) => {
                if (DB[closeId].status !== 'Запланирован' && DB[closeId].status !== 'Отправлен вебхук') {
                    DB[closeId].status = 'Отменён';
                    Embed.setDescription(`${author}, клоуз ${closeId} отменён`);
                    await interaction.editReply({
                        embeds: [Embed],
                        components: []
                    })
                } else {
                    Embed.setDescription(`${author}, вы не можете отменить клоуз ${closeId}`);
                    await interaction.editReply({
                        embeds: [Embed],
                        components: []
                    })
                }
            }
            const Embed = new EmbedBuilder()
                .setTitle(title)
                .setColor(config.color)
            if (author.id === DB[closeId].author) {
                await interaction.deferReply()
                cancelClose(Embed)
            } else {
                if (author.roles.cache.has(config.roleGods) || author.roles.cache.has(config.roleSerafim) || author.id === config.owner_id) {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonCloseCancelYes')
                                .setEmoji(config.emojis.yes)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonCloseCancelNo')
                                .setEmoji(config.emojis.no)
                                .setStyle(2),
                        )
                    Embed.setDescription(`${author}, это не ваш клоуз, вы уверены, что хотите его отменить?`);
                    await interaction.reply({
                        embeds: [Embed],
                        components: [row],
                        fetchReply: true
                    })
                    .then((msg) => message = msg)
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonCloseCancelYes' || ButtonInteraction.customId === 'buttonCloseCancelNo';

                    const collector = message.createMessageComponentCollector({ filter, time: 600000 });

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
                        status = 'end'
                        collector.stop()
                        await ButtonInteraction.deferUpdate()
                        if (ButtonInteraction.customId === 'buttonCloseCancelYes') {
                            cancelClose(Embed)
                        } else {
                            Embed.setDescription(`${author}, действие отменено`)
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                        }
                    })
                    collector.on('end', async () => {
                        if (status == 'start') {
                            for (let i = 0; i < row.components.length; i++) {
                                row.components[i].setDisabled(true)
                            }
                            await interaction.editReply({
                                components: [row]
                            })
                        }
                    })
                }
            }
        }
	}
};