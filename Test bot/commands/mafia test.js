const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { $selectMenu} = require("discord.js-basic")
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { emit } = require('node:process');
const { channel } = require('node:diagnostics_channel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mafia1')
        .setDescription('a')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создание Мафияа")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription("Отменить создание Мафияа")
        ),
	async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const MafiaChannel = await interaction.guild.channels.fetch(config.eventChannel)
        let Mafiatime
        let block
        let bypass1;
        let sqlResult
        let title = 'Создание Мафии'
        let message
        let message1
        let logs
        let category
        let channelControl
        let mafiaName
        let mafiaText
        let ready = false;
        let members = []
        let ghost = 1
        let timeEmbed
        let timestampInput
        let MafiaId = 0;
        let status = 'start';
        let statusText = 'Не активен'
        let timeText = 'Не указано'
        let channelInfo
        let channelMain
        let messageInfo
        let messageControlMafia
        let MafiaObject = {}
        let mafia = false
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
        let writeMember = (member) => {
            if (member) return `<@${member}>`
            return 'Ожидание'
        }
        let writeMemberPriority = (member) => {
            if (member) return `<@${member}> (Обычный)`
            return 'Ожидание'
        }
        let writeMembersListRegistration = (list) => {
            let text = `${config.emojis.dot} ${writeMemberPriority(list[0])}`
            for (let i = 1; i < list.length; i++) {
                text+=`\n${config.emojis.dot} ${writeMemberPriority(list[i])}`
            }
            return text
        }
        let setMafia = (timestamp) => {
            if (mafiaName === 'CS 2') {
                mafiaText = {
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
            if (mafiaName === 'Dead by Daylight') {
                mafiaText = {
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
            if (mafiaName === 'Dota 2') {
                mafiaText = {
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
            if (mafiaName === 'Fortnite') {
                mafiaText = {
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
            if (mafiaName === 'Rocket League') {
                mafiaText = {
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
            if (mafiaName === 'Valorant') {
                mafiaText = {
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
            if (mafiaName === 'Rainbow Six') {
                mafiaText = {
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
            if (mafiaName === 'Overwatch 2') {
                mafiaText = {
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
            if (mafiaName === 'OSU') {
                mafiaText = {
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
            if (mafiaName === 'Minecraft') {
                mafiaText = {
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
            if (mafiaName === 'League of Legends') {
                mafiaText = {
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
        }
        let getTeamPlayers = (list) => {
            while (list.length > 10) {
                let randomItem = Math.floor(Math.random() * list.length)
                while (list[randomItem] == config.owner_id) randomItem = Math.floor(Math.random() * list.length)
                delete list[randomItem]
            }
            return list
        }
        let membersGameList = (list) => {
            const text = `${config.emojis.number0+config.emojis.number1} ${writeMember(list[0])}
${config.emojis.number0+config.emojis.number2}  ${writeMember(list[1])}
${config.emojis.number0+config.emojis.number3}  ${writeMember(list[2])}
${config.emojis.number0+config.emojis.number4}  ${writeMember(list[3])}
${config.emojis.number0+config.emojis.number5}  ${writeMember(list[4])}
${config.emojis.number0+config.emojis.number6}  ${writeMember(list[5])}
${config.emojis.number0+config.emojis.number7}  ${writeMember(list[6])}
${config.emojis.number0+config.emojis.number8}  ${writeMember(list[7])}
${config.emojis.number0+config.emojis.number9}  ${writeMember(list[8])}
${config.emojis.number1+config.emojis.number0}  ${writeMember(list[9])}`
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
            return `Мафия скоро начнётся!`
        }
        let startMafia = async (listMafiaMembersRegistration) => {
            mafia = true
            let changeNick = (player) => {
                if (!player.alive) return ``
                if (player.falls == 0) return `${two(memberNumber)}`
                return `${two(memberNumber)} [${player.falls}/4]`
            }
            let listMifiaMembers = [];
            let mafiaRoles = ['Дон', 'Мафия', 'Мафия', 'Комисар', 'Доктор', 'Мирный житель', 'Мирный житель', 'Мирный житель', 'Мирный житель', 'Мирный житель'];
            let textMafiaMemberWithRoles = ``;
            let textMafiaMember = ``;
            for (let i = 0; i < 10; i++) {
                const player = listMafiaMembersRegistration[i];
                const role = mafiaRoles[Math.floor(Math.random() * mafiaRoles.length)];
                mafiaRoles.splice(mafiaRoles.indexOf(role), 1);
                const playerObject = {
                    id: player,
                    role: role,
                    falls: 0,
                    alive: true,
                    nickname: null
                }
                textMafiaMemberWithRoles += `[${two(i+1)}] <@${player}> - ${role}\n`;
                textMafiaMember += `[${two(i+1)}] <@${player}>\n`
                listMifiaMembers.push(playerObject)
            }
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('selectMenuMafiaMembers')
                .setPlaceholder('Выберите пользователя')
                .setMaxValues(1)
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Кошкомальчик')
                    .setValue(config.owner_id)
            )
            for (let i = 1; i < listMafiaMembersRegistration.length; i++) {
                let member = await interaction.guild.members.fetch(listMafiaMembersRegistration[i])
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        //.setLabel(member.displayName)
                        //.setValue(member.id)
                        .setLabel(String(i))
                        .setValue(String(i))
                )
            } 
            const rowMembers = new ActionRowBuilder().addComponents(selectMenu)
            const rowNight = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaNight')
                        .setEmoji(config.emojis.addMember)
                        .setLabel('Установить ночь')
                        .setStyle(2)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaDay')
                        .setEmoji(config.emojis.addMember)
                        .setLabel('Установить день')
                        .setStyle(2)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaWin')
                        .setEmoji(config.emojis.addMember)
                        .setLabel('Объявить победу мафии')
                        .setStyle(2)
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaLose')
                        .setEmoji(config.emojis.addMember)
                        .setLabel('Объявить победу мирных жителей')
                        .setStyle(2)
                )
            const embedMembersControl = new EmbedBuilder()
                .setTitle('Управление мафией')
                .setColor(config.color)
                .setDescription(textMafiaMember)
            const messageGameControl = await channelControl.send({
                embeds: [embedMembersControl],
                components: [rowMembers, rowNight]
            })
            const filter = ButtonInteraction => ButtonInteraction.customId === 'selectMenuMafiaMembers' || ButtonInteraction.customId ==='buttonMafiaNight' || ButtonInteraction.customId ==='buttonMafiaDay' || ButtonInteraction.customId ==='buttonMafiaWin' || ButtonInteraction.customId ==='buttonMafiaLose';

            const collector = messageGameControl.createMessageComponentCollector({ filter });

            collector.on('collect', async ButtonInteraction => {
                let ButtonMember = ButtonInteraction.member;
                if (ButtonInteraction.customId === 'selectMenuMafiaMembers') {
                    const rowMembersControl = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMafiaFallAdd')
                                .setEmoji(config.emojis.addMember)
                                .setLabel('Выдать фол')
                                .setStyle(2)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMafiaFallRemove')
                                .setEmoji(config.emojis.addMember)
                                .setLabel('Отменить фол')
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMafiaMemberRemove')
                                .setEmoji(config.emojis.addMember)
                                .setLabel('Поднять пользователя со стола')
                                .setStyle(2)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonMafiaMemberAdd')
                                .setEmoji(config.emojis.addMember)
                                .setLabel('Вернуть пользователя на стол')
                                .setStyle(2)
                        )
                    const EmbedMafiaControl = new EmbedBuilder()
                        .setTitle('Управление участником')
                        .setColor(config.color)
                        .setDescription(`${author}, выберите действие c пользователем`)
                    const messageMafiaControl = await ButtonInteraction.reply({
                        embeds: [EmbedMafiaControl],
                        components: [rowMembersControl],
                        ephemeral: true
                    })
                    const filter1 = ButtonInteraction => ButtonInteraction.customId === 'buttonMafiaFallAdd' || ButtonInteraction.custumId === 'buttonMafiaFallRemove' || ButtonInteraction.custumId === 'buttonMafiaMemberRemove' || ButtonInteraction.custumId === 'buttonMafiaMemberAdd' || ButtonInteraction.custumId === 'buttonMafiaNight' || ButtonInteraction.custumId === 'buttonMafiaDay' || ButtonInteraction.custumId === 'buttonMafiaCancel';

                    const collector1 = messageMafiaControl.createMessageComponentCollector({ time: 60000, filter1 });

                    collector1.on('collect', async ButtonInteraction1 => {
                        await ButtonInteraction1.deferUpdate()
                        collector1.stop()
                        const memberNumber = ButtonInteraction1.value[0];
                        const playerObject = listMifiaMembers[memberNumber]
                        if (ButtonInteraction1.customId === 'buttonMafiaFallAdd') {
                            playerObject.falls++
                            if (playerObject.falls < 4) {
                                await interaction.guild.members.fetch(playerObject.id)
                                .then(async (member) => {
                                    if (member.manageable) {
                                        await member.setNickname(changeNick()) 
                                        .then(async (promise) => {
                                            EmbedMafiaControl.setDescription(`${author}, вы выдали фол игроку ${member}`)
                                        })
                                        .catch((err) => EmbedMafiaControl.setDescription(`${author}, произошла ошибка при изменении ника`))
                                    } else {
                                        EmbedMafiaControl.setDescription(`${author}, фол выдан. Пользователь находится выше роли бота, попросите поменять никнейм самостоятельно`)
                                    }
                                })
                                .catch(async (err) => {
                                    EmbedMafiaControl.setDescription(`${author}, пользователь не найден`)
                                })
                            }
                        }
                        if (ButtonInteraction1.customId === 'buttonMafiaFallRemove') {
                            if (playerObject.falls > 0) {
                                playerObject.falls--
                                await interaction.guild.members.fetch(playerObject.id)
                                .then(async (member) => {
                                    if (member.manageable) {
                                        await member.setNickname(changeNick()) 
                                        .then(async (promise) => {
                                            EmbedMafiaControl.setDescription(`${author}, вы отменили фол у игрока ${member}`)
                                        })
                                        .catch((err) => EmbedMafiaControl.setDescription(`${author}, произошла ошибка при изменении ника`))
                                    } else {
                                        EmbedMafiaControl.setDescription(`${author}, фол отменён. Пользователь находится выше роли бота, попросите поменять никнейм самостоятельно`)
                                    }
                                })
                                .catch(async (err) => {
                                    EmbedMafiaControl.setDescription(`${author}, пользователь не найден`)
                                })
                            }
                        }
                        if (ButtonInteraction1.customId === 'buttonMafiaMemberRemove') {
                            playerObject.alive = false
                            await interaction.guild.members.fetch(playerObject.id)
                            .then(async (member) => {
                                if (member.manageable) {
                                    await member.setNickname() 
                                    .then(async (promise) => {
                                        EmbedMafiaControl.setDescription(`${author}, вы вернули на стол игрока ${member}`)
                                    })
                                    .catch((err) => EmbedMafiaControl.setDescription(`${author}, произошла ошибка при изменении ника`))
                                }
                            })
                            .catch(async (err) => {
                                EmbedMafiaControl.setDescription(`${author}, пользователь не найден`)
                            })
                        }
                        if (ButtonInteraction1.customId === 'buttonMafiaMemberAdd') {
                            playerObject.falls = 0;
                            playerObject.alive = true;
                            await interaction.guild.members.fetch(playerObject.id)
                            .then(async (member) => {
                                if (member.manageable) {
                                    await member.setNickname(changeNick()) 
                                    .then(async (promise) => {
                                        EmbedMafiaControl.setDescription(`${author}, вы вернули на стол игрока ${member}`)
                                    })
                                    .catch((err) => EmbedMafiaControl.setDescription(`${author}, произошла ошибка при изменении ника`))
                                }
                            })
                            .catch(async (err) => {
                                EmbedMafiaControl.setDescription(`${author}, пользователь не найден`)
                            })
                        }
                        await ButtonInteraction.editReply({
                            embeds: [EmbedMafiaControl],
                            components: []
                        })
                        return
                    })
                    collector1.on('end', async () => {
                        for (let i = 0; i < rowMembersControl.components.length; i++) rowMembersControl.components[i].setDisabled(true)
                        await ButtonInteraction.editReply({
                            components: [rowMembersControl]
                        })
                    })
                    return
                }
                /*if (ButtonMember.id !== author.id && ButtonMember.id !== config.owner_id) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.colorError)
                        .setDescription(`${ButtonMember}, вы не можете этого делать`);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }*/
                const Embed = new EmbedBuilder()
                    .setTitle('Управление ивентом')
                    .setColor(config.color)
                if (ButtonInteraction.customId === 'buttonMafiaNight') {
                    Embed.setDescription(`${author}, в городе установлена ночь`)
                    await channelMain.permissionOverwrites.edit(interaction.guild.id, {
                        SendMessages: false
                    });
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        fetchReply: true
                    })
                    return
                }
                if (ButtonInteraction.customId === 'buttonMafiaDay') {
                    await channelMain.permissionOverwrites.edit(interaction.guild.id, {
                        SendMessages: null
                    });
                    Embed.setDescription(`${author}, в городе установлен день`)
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        fetchReply: true
                    })
                    return
                }
                if (ButtonInteraction.customId === 'buttonMafiaWin') {
                    await channelMain.permissionOverwrites.edit(interaction.guild.id, {
                        SendMessages: null
                    });
                    Embed.setDescription(`${author}, Объявлена победа мафии`)
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        fetchReply: true
                    })
                    Embed.setTitle('Победа мафии!')
                        .setDescription(`Роли игроков:\n${textMafiaMemberWithRoles}`)
                    await channelMain.send({
                        embeds: [Embed]
                    })
                    collector.stop()
                    await messageGameControl.delete()
                }
                if (ButtonInteraction.customId === 'buttonMafiaLose') {
                    await channelMain.permissionOverwrites.edit(interaction.guild.id, {
                        SendMessages: null
                    });
                    Embed.setDescription(`${author}, Объявлена победа мирных!`)
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        fetchReply: true
                    })
                    Embed.setTitle('Победа мирных жителей!')
                        .setDescription(`Роли игроков:\n${textMafiaMemberWithRoles}`)
                    await channelMain.send({
                        embeds: [Embed]
                    })
                    collector.stop()
                    await messageGameControl.delete()
                }
            })
        }
        let createMafia = async (Embed) => {
            let arraycd = {}
            if (DB.events[MafiaId].status == 'Отменён') {
                return
            }
            statusText = 'Создан'
            Embed.setDescription(`Ведущий: ${author}
Мафия: ${mafiaName}
Время: ${timeText}
Статус: ${statusText}`)
            await interaction.editReply({
                embeds: [Embed],
                components: []
            })
            await interaction.guild.channels.create({
                name: 'Мафия',
                type: ChannelType.GuildCategory,
                position: 5,
                permissionOverwrites: [
                    {
                        id: config.roleEventBan,
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
            DB.events[MafiaId].category = category.id;
            await interaction.guild.channels.create({
                name: 'управление_ивентом',
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
            let listRegistrationMembers = [];
            let listPlayersMembers = [];
            await interaction.guild.channels.create({
                name: 'Информация',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: config.roleEventBan,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }
                ]
            })
            .then(channel => channelInfo = channel)
            .catch(err => console.log(err))
            await interaction.guild.channels.create({
                name: 'Мафия',
                type: ChannelType.GuildText,
                parent: category.id
            })
            .then(channel => channelMain = channel)
            .catch(err => console.log(err))
            await interaction.guild.channels.create({
                name: 'Мафия',
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            .catch(err => console.log(err))
            const rowInfo = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaMember')
                        .setEmoji(config.emojis.addMember)
                        .setStyle(2),
                )
            const infoEmbed = new EmbedBuilder()
                .setTitle(`Запись на Мафию`)
                .setColor(config.color)
                .setDescription(`Количество участников: **${listRegistrationMembers.length}**\n${players(10-listRegistrationMembers.length)}`)
                .setFields(
                    {name: `${config.emojis.addMember} Игроки`, value: `${writeMembersListRegistration(listRegistrationMembers)}`, inline: true},
                )
            await channelInfo.send({
                embeds: [infoEmbed],
                components: [rowInfo]
            })
            .then((msg) => messageInfo = msg)
            .catch()
            const filter4 = ButtonInteraction => ButtonInteraction.customId === 'buttonMafiaMember';

            const collector4 = messageInfo.createMessageComponentCollector({ filter4 });

            collector4.on('collect', async ButtonInteraction => {
                let ButtonMember = ButtonInteraction.member;
                if (listRegistrationMembers.includes(ButtonMember.id)) {
                    listRegistrationMembers.splice(listRegistrationMembers[0].indexOf(ButtonMember.id), 1)
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.color)
                        .setDescription(`${ButtonMember}, вы покинули очередь на регистрацию`);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    arraycd[ButtonMember.id] = Date.now()+60000
                    infoEmbed
                        .setDescription(`Количество участников: **${listRegistrationMembers.length}**\n${players(10-listRegistrationMembers.length)}`)
                        .setFields(
                            {name: `${config.emojis.addMember} Игроки`, value: `${writeMembersListRegistration(listRegistrationMembers)}`, inline: true},
                        )
                    await messageInfo.edit({
                        embeds: [infoEmbed],
                        components: [rowInfo]
                    })
                    return
                }
                if (arraycd[ButtonMember.id] && arraycd[ButtonMember.id] > Date.now()) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor(config.colorError)
                        .setDescription(`${ButtonMember}, вы сможете это сделать через ${Math.ceil((arraycd[ButtonMember.id] - Date.now()) /1000)} секунд`);
                    await ButtonInteraction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                    return
                }
                const errorEmbed = new EmbedBuilder()
                    .setColor(config.color)
                    .setDescription(`${ButtonMember}, вы записаны на мафию`);
                await ButtonInteraction.reply({
                    embeds: [errorEmbed],
                    ephemeral: true
                })
                listRegistrationMembers.push(ButtonInteraction.member.id);
                infoEmbed
                    .setDescription(`Количество участников: **${listRegistrationMembers.length}**\n${players(10-listRegistrationMembers.length)}`)
                    .setFields(
                        {name: `${config.emojis.addMember} Игроки`, value: `${writeMembersListRegistration(listRegistrationMembers)}`, inline: true},
                    )
                await messageInfo.edit({
                    embeds: [infoEmbed],
                    components: [rowInfo]
                })
            })
            if (members.length) {
                for (let i = 0; i < members.length; i++) {
                    await members[i].send({
                        content: `${members[i]}, приготовтесь, мафия начинается!`
                    })
                    .catch()
                }
            }
            const rowSettings1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaEditLimit')
                        .setEmoji(config.emojis.changeLimit)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaLock')
                        .setEmoji(config.emojis.ban)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaUnlock')
                        .setEmoji(config.emojis.unban)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaMute')
                        .setEmoji(config.emojis.voiceMute)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaUnmute')
                        .setEmoji(config.emojis.voiceUnmute)
                        .setStyle(2),
                )
            const rowSettings2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaStart')
                        .setEmoji(config.emojis.startEvent)
                        .setStyle(3),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaReplace')
                        .setEmoji(config.emojis.replace)
                        .setStyle(2),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonMafiaClose')
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
${config.emojis.startEvent} - Начать мафию
${config.emojis.replace} - заменить участника`)
            await channelControl.send({
                embeds: [settingsEmbed],
                components: [rowSettings1, rowSettings2]
            })
            .then((msg) => messageControlMafia = msg)
            const filter3 = ButtonInteraction => ButtonInteraction.customId === 'buttonMafiaEditLimit' || ButtonInteraction.customId === 'buttonMafiaLock' || ButtonInteraction.customId === 'buttonMafiaUnlock' || ButtonInteraction.customId === 'buttonMafiaMute' || ButtonInteraction.customId === 'buttonMafiaUnmute' || ButtonInteraction.customId === 'buttonMafiaStart' || ButtonInteraction.customId === 'buttonMafiaReplace' || ButtonInteraction.customId === 'buttonMafiaClose';

            const collector3 = messageControlMafia.createMessageComponentCollector({ filter3});

            collector3.on('collect', async ButtonInteraction => {
                let voice = ButtonInteraction.member.voice.channel
                let ButtonMember = ButtonInteraction.member
                if ((!voice || voice.parentId !== category.id) && ButtonInteraction.customId !== 'buttonMafiaStart' && ButtonInteraction.customId !== 'buttonMafiaReplace' && ButtonInteraction.customId !== 'buttonMafiaClose') {
                    Embed
                        .setDescription(`${author}, вы должны находиться в созданом голосовом канале`)
                        .setColor(config.colorError)
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonMafiaEditLimit') {
                    const modal = new ModalBuilder()
                        .setCustomId('modalMafiaEditLimit')
                        .setTitle('Изменить лимит голосового канала');
                    const input = new TextInputBuilder()
                        .setCustomId('modalMafiaEditLimitInput')
                        .setLabel('Введите новый лимит')
                        .setPlaceholder('1')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(2)
                        .setRequired(true)
                    const firstActionRow = new ActionRowBuilder().addComponents(input)
                    modal.addComponents(firstActionRow)
                    await ButtonInteraction.showModal(modal);
                    const filter = (ModalInteraction) => ModalInteraction.customId === 'modalMafiaEditLimit';
                    ButtonInteraction.awaitModalSubmit({ time: 300000, filter })
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
                if (ButtonInteraction.customId === 'buttonMafiaLock') {
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
                if (ButtonInteraction.customId === 'buttonMafiaUnlock') {
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
                if (ButtonInteraction.customId === 'buttonMafiaMute') {
                    await voice.permissionOverwrites.edit(interaction.guild.id, {
                        Speak: false
                    })
                    Embed
                        .setDescription(`${author}, теперь входящие в голосовой канал не смогут говорить`)
                        .setColor(config.color);
                    await ButtonInteraction.reply({
                        embeds: [Embed],
                        ephemeral: true
                    })
                }
                if (ButtonInteraction.customId === 'buttonMafiaUnmute') {
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
                if (ButtonInteraction.customId === 'buttonMafiaClose') {
                    collector3.stop()
                    await ButtonInteraction.deferUpdate()
                    if (!ghost) {
                        logEmbed
                            .setDescription(`[1] ${author}(${author.id})
[2] Мафия/ID: ${mafiaName} (${sqlResult[0].Mafiaid})
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
                    collector4.stop()
                }
                if (ButtonInteraction.customId === 'buttonMafiaStart') {
                    for (let i = 0; i < 12; i++) {
                        listRegistrationMembers.push(author.id)
                    }
                    if (listRegistrationMembers.length > 9) {
                        let position = Math.floor(Math.random() * 10)
                        for (let i = 0; i < 10; i++) {
                            if (position !== i) {
                                let tempItem = Math.floor(Math.random() * listRegistrationMembers.length)
                                listPlayersMembers.push(listRegistrationMembers[tempItem])
                                listRegistrationMembers.slice(tempItem)
                            } else {
                                if (listRegistrationMembers.includes(config.owner_id)) {
                                    listPlayersMembers.push(config.owner_id)
                                    listRegistrationMembers.slice(listRegistrationMembers.indexOf(config.owner_id))
                                } else {
                                    let tempItem = Math.floor(Math.random() * listRegistrationMembers.length)
                                    listPlayersMembers.push(listRegistrationMembers[tempItem])
                                    listRegistrationMembers.slice(tempItem)
                                }
                            }
                        }
                        const Embed = new EmbedBuilder()
                            .setColor(config.color)
                            .setDescription(`${ButtonMember}, мафия запущена!`);
                        await ButtonInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                        console.log(listPlayersMembers)
                        infoEmbed
                            .setTitle('Игроки в мафию')
                            .setDescription(membersGameList(listPlayersMembers))
                            .setFields()
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: []
                        })
                        startMafia(listPlayersMembers)
                        /*const rowNumbers1 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia1')
                                    .setLabel(config.emojis.number0+config.emojis.number1)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia2')
                                    .setLabel(config.emojis.number0+config.emojis.number2)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia3')
                                    .setLabel(config.emojis.number0+config.emojis.number3)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia4')
                                    .setLabel(config.emojis.number0+config.emojis.number4)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia5')
                                    .setLabel(config.emojis.number0+config.emojis.number5)
                                    .setStyle(2),
                            )
                        const rowNumbers2 = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia6')
                                    .setLabel(config.emojis.number0+config.emojis.number6)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia7')
                                    .setLabel(config.emojis.number0+config.emojis.number7)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia8')
                                    .setLabel(config.emojis.number0+config.emojis.number8)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia9')
                                    .setLabel(config.emojis.number0+config.emojis.number9)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonMafia10')
                                    .setLabel(config.emojis.number1+config.emojis.number0)
                                    .setStyle(2),
                            )
                        const infoEmbed = new EmbedBuilder()
                            .setTitle(`Запись на мафию`)
                            .setColor(config.color)
                            .setDescription(`Разбираем слоты:`)
                            .setFields(
                                {name: `${config.emojis.addMember} Игроки`, value: `${membersList(listRegistrationMembers)}`, inline: true},
                            )
                        messageInfo = await channelInfo.send({
                            content: text,
                            embeds: [infoEmbed],
                            components: [rowNumbers1, rowNumbers2]
                        })
                        const filter5 = ButtonInteraction => ButtonInteraction.customId.includes('buttonMafia');

                        const collector5 = messageInfo.createMessageComponentCollector({ filter5 });

                        collector5.on('collect', async ButtonInteraction => {
                            let ButtonMember = ButtonInteraction.member;
                            if (listRegistrationMembers.includes(ButtonMember.id)) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonMember}, вы не зарегестрированы на мафию`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            if (listRegistrationMembers.includes(ButtonMember.id)) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(config.colorError)
                                    .setDescription(`${ButtonMember}, вы уже выбрали слот`);
                                await ButtonInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            const slot = parseInt(ButtonInteraction.customId.replace('buttonMafia'));
                            listRegistrationMembers[slot-1] = ButtonMember.id;
                            if (slot < 6) {
                                rowNumbers1.components[(slot-1)%5].setDisabled(true)
                            } else {
                                rowNumbers2.components[(slot-1)%5].setDisabled(true)
                            }
                            const Embed = new EmbedBuilder()
                                .setColor(config.colorError)
                                .setDescription(`${ButtonMember}, вы заняли ${slot} слот!`);
                            await ButtonInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                            await messageInfo.edit({
                                embeds: [infoEmbed],
                                components: [rowNumbers1, rowNumbers2]
                            })
                        })*/
                    } else {
                        const Embed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, для запуска мафии нужно 10 человек!`);
                        await ButtonInteraction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                    }
                }
                if (ButtonInteraction.customId === 'buttonMafiaReplace') {
                    if (listRegistrationMembers.length == 0) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor(config.colorError)
                            .setDescription(`${ButtonMember}, в списке нет записавшихся пользователей`);
                        await ButtonInteraction.reply({
                            embeds: [errorEmbed],
                            ephemeral: true
                        })
                        return
                    }
                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('selectMenuMafiaReplace')
                        .setPlaceholder('Выберите пользователя')
                        .setMaxValues(1)
                    for (let i = 0; i < listRegistrationMembers.length; i++) {
                        let member = await interaction.guild.members.fetch(listRegistrationMembers[i])
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
                    await ButtonInteraction.reply({
                        embeds: [selectEmbed],
                        components: [rowMembers],
                        ephemeral: true
                    })
                    .then((msg) => {
                        message = msg
                    })
                    const collector5 = message.createMessageComponentCollector({ time: 60000 });
        
                    collector5.on('collect', async ButtonInteraction1 => {
                        await ButtonInteraction1.deferUpdate()
                        let ButtonMember = ButtonInteraction.user;
                        collector5.stop()
                        let memberId = ButtonInteraction1.values[0]
                        listRegistrationMembers.splice(listRegistrationMembers.indexOf(memberId), 1)
                        infoEmbed
                            .setDescription(`Количество участников: **${listRegistrationMembers.length}**\n${players(10-listRegistrationMembers.length)}`)
                            .setFields(
                                {name: `${config.emojis.addMember} Игроки`, value: `${writeMembersListRegistration(listRegistrationMembers)}`, inline: true},
                            )
                        await messageInfo.edit({
                            embeds: [infoEmbed],
                            components: [rowInfo]
                        })
                        selectEmbed.setDescription(`${ButtonMember} пользователь исключён из спика команды`)
                        await ButtonInteraction.editReply({
                            embeds: [selectEmbed],
                            components: []
                        })
                    })
                }
            })
        }
        switch (subcommand) {
            case 'create': title=`Создание ивента`;break;
            case 'cancel': title=`Отменить создание ивента`;break;
        }
        if (!author.roles.cache.has(config.roleMafia) && !author.roles.cache.has(config.roleMafia) && author.id != config.owner_id) {
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
                        .customId("SelectMenuCreateMafia")
                        .placeholder("Mafia")
                        .options({
                                label: 'Городская мафия',
                                description: '',
                                value: 'CS 2',
                            },
                            {
                                label: 'Классическая мафия',
                                description: '',
                                value: 'Dead by Daylight',
                            },
                            {
                                label: 'Городская мафия с вебками',
                                description: '',
                                value: 'Dota 2',
                            },
                            {
                                label: 'Классическая мафия с вебками',
                                description: '',
                                value: 'Fortnite',
                            },
                            {
                                label: 'Ролевая мафия',
                                description: '',
                                value: 'Rocket League',
                            },
                            {
                                label: 'Городская по ФИИМ',
                                description: '',
                                value: 'Valorant',
                            },
                            {
                                label: `Мафия "стенка на Стенку"`,
                                description: '',
                                value: 'r6',
                            },
                            {
                                label: 'Мафия Пива',
                                description: '',
                                value: 'Overwatch 2',
                            }
                            )
                        .save()
                )
            row.components[0].data
            const Embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(`${author}, выберите вид мафии`)
                .setColor(config.color);
            await interaction.reply({
                embeds: [Embed],
                components: [row],
                fetchReply: true
            })
            .then((msg) => {
                message = msg
            })
            status = 'collecor'
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
                mafiaName = ButtonInteraction.values[0]
                const rowTime = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonMafiaSendNow')
                            .setLabel('Сейчас')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonMafiaSendTime')
                            .setLabel('Потом')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonMafiaCancel')
                            .setLabel('Отмена')
                            .setStyle(4)
                    );
                Embed.setDescription(`Ведущий: ${author}
Мафия: ${mafiaName}
Время: ${timeText}
Статус: ${statusText}`)
                await interaction.editReply({
                    embeds: [Embed],
                    components: [rowTime]
                })
                status = 'collecor1'
                const filter1 = ButtonInteraction => ButtonInteraction.customId === 'buttonMafiaSendNow' || ButtonInteraction.customId === 'buttonMafiaSendTime' || ButtonInteraction.customId === 'buttonMafiaCancel';

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
                    if (ButtonInteraction.customId === 'buttonMafiaCancel') {
                        await ButtonInteraction.deferUpdate()
                        status = 'end'
                        collector1.stop()
                        Embed.setDescription(`Ведущий: ${author}
Мафия: ${mafiaName}
Время: Не указано
Статус: Отменён`)
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                        return
                    }
                    MafiaId = DB.settings.Mafias;
                    DB.settings.Events+=1
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Mafia')
                        .setColor('#00ff00')
                    if (ButtonInteraction.customId === 'buttonMafiaSendNow') {
                        await ButtonInteraction.deferUpdate()
                        collector1.stop()
                        status = 'wait'
                        timeEmbed = new Date()
                        setMafia(timeEmbed)
                        /*const EmbedMafia = new EmbedBuilder()
                            .setTitle(mafiaText[0].title)
                            .setDescription(mafiaText[0].description)
                            .setColor(mafiaText[0].color)
                            .addFields(mafiaText[0].fields)
                            .setImage(mafiaText[0].image.url)*/
                        MafiaObject = {
                            author: author.id,
                            name: mafiaName,
                            time: timeEmbed,
                            status: 'Ивент создан',
                            category: undefined
                        }
                        DB.events[MafiaId] = MafiaObject
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${mafiaName} (${sqlResult[0].Mafiaid})
[3] Время: ${format(timestampInput)}(${timestampInput})
[4] Статус: Ивент создан`)
                            logs = await logChannel.send({
                                embeds: [logEmbed],
                            })
                        }
                        message1 = await MafiaChannel.send(mafiaText)
                        timeText = format(timeEmbed)
                        createMafia(Embed)
                    }
                    if (ButtonInteraction.customId === 'buttonMafiaSendTime') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalCreateMafia')
                            .setTitle('Создание ивента');
                        const timestampTextInput = new TextInputBuilder()
                            .setCustomId('modalCreateMafiaInput')
                            .setLabel('Введите timestamp')
                            .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(timestampTextInput)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalCreateMafia';
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
                            setMafia(new Date(timestampInput))
                            const EmbedMafia = new EmbedBuilder()
                                .setTitle(mafiaText[0].title)
                                .setDescription(mafiaText[0].description)
                                .setColor(mafiaText[0].color)
                                .addFields(mafiaText[0].fields)
                                .setImage(mafiaText[0].image.url)
                            timeEmbed = timestampInput-60*60*1000
                            MafiaObject = {
                                author: author.id,
                                name: mafiaName,
                                time: timestampInput,
                                status: 'Запланирован',
                                category: undefined
                            }
                            DB.events[MafiaId] = MafiaObject
                            timeText = format(timestampInput)
                            if (timeEmbed > Date.now()) {
                                Embed.setDescription(`Ведущий: ${author}
Ивент: ${mafiaName}
Время: ${format(time)}
Статус: Запланирован`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                await wait(timeEmbed-Date.now())
                            }
                            const rowMafia = new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('buttonMafiaRegistration')
                                        .setLabel('Записаться')
                                        .setStyle(2),
                                )
                            if (!ghost) {
                                logEmbed
                                    .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${mafiaName} (${sqlResult[0].Mafiaid})
[3] Время: ${format(timestampInput)}(${timestampInput})
[4] Статус: Отправлен вебхук`)
                                logs = await logChannel.send({
                                    embeds: [logEmbed],
                                })
                            }
                            DB.events[MafiaId].status = 'Отправлен вебхук'
                            Embed.setDescription(`Ведущий: ${author}
Мафия: ${mafiaName}
Время: ${format(time)}
Статус: Отправлен вебхук`)
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            message1 = await MafiaChannel.send({
                                content: `<@&1121809323736191058>`,
                                embeds: [EmbedMafia],
                                components: [rowMafia]
                            })
                            const filter2 = ButtonInteraction => ButtonInteraction.customId === 'buttonMafiaRegistration'

                            const collector2 = message1.createMessageComponentCollector({ filter2, time: timestampInput-Date.now() });

                            collector2.on('collect', async ButtonInteraction => {
                                if (DB.events[MafiaId]) {
                                    await ButtonInteraction.reply({
                                        content: `${ButtonInteraction.member}, Ивент был отменён`,
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
                                rowMafia.components[0].setDisabled(true)
                                await message1.edit({
                                    components: [rowMafia]
                                })
                                createMafia(Embed)
                            })
                        })
                    }
                })
            })
        }
	}
};