const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { $selectMenu, $sendMessage, $row } = require("discord.js-basic")
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { emit } = require('node:process');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
        .setDescription('a')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создание запланированного клоуза")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription("Отменить создание клоуза")
        ),
	async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const EventChannel = await interaction.guild.channels.fetch(config.eventChannel)
        let eventtime
        let block
        let bypass1;
        let sqlResult
        let title
        let message
        let message1
        let logs
        let category
        let channelControl
        let event
        let eventName
        let eventText
        let ready = false;
        let members = []
        let eventBool
        let channelsList = []
        let ghost
        let roleId
        let two = n => (n > 9 ? "" : "0") + n;
        let format = now =>
            two(now.getDate()) + "." +
            two(now.getMonth() + 1) + "." +
            now.getFullYear() + " " +
            two(now.getHours()) + ":" +
            two(now.getMinutes()) + ":" +
            two(now.getSeconds());
        switch (subcommand) {
            case 'create': title=`Создание запланированного клоуза`;break;
            case 'cancel': title=`Отменить создание клоуза`;break;
        }
        if (!author.roles.cache.has(config.roleClose) && author.id != config.owner_id) {
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
                        .customId("SelectMenuCreateEvent")
                        .placeholder("Close")
                        .options({
                                label: 'CS2',
                                description: '',
                                value: 'cs2',
                            },
                            {
                                label: 'Dead by Daylight',
                                description: '',
                                value: 'dbd',
                            },
                            {
                                label: 'Dota 2',
                                description: '',
                                value: 'dota2',
                            },
                            {
                                label: 'Fortnite',
                                description: '',
                                value: 'fortnite',
                            },
                            {
                                label: 'Rocket League',
                                description: '',
                                value: 'rocketLeague',
                            },
                            {
                                label: 'Valorant',
                                description: '',
                                value: 'valorant',
                            },
                            {
                                label: "Tom Clancy's Rainbow Six: Siege",
                                description: '',
                                value: 'r6',
                            },
                            {
                                label: 'Overwatch 2',
                                description: '',
                                value: 'overwatch2',
                            },
                            {
                                label: 'OSU',
                                description: '',
                                value: 'osu',
                            },
                            {
                                label: 'Minecraft',
                                description: '',
                                value: 'minecraft',
                            },
                            {
                                label: 'League of Legends',
                                description: '',
                                value: 'lol',
                            },
                            {
                                label: 'Genshin Empact',
                                description: '',
                                value: 'genshinEmpact',
                            },
                            {
                                label: 'Brawlhalla',
                                description: '',
                                value: 'brawlhalla',
                            },
                            {
                                label: 'Apex',
                                description: '',
                                value: 'apex',
                            }
                            )
                        .save()
                )
            const rowEvent = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('buttonEventRegistration')
                        .setLabel('Записаться')
                        .setStyle(2),
                )
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
                collector.stop()
                const modal = new ModalBuilder()
                    .setCustomId('modalCreateEvent')
                    .setTitle('Создание клоуза');
                const timestampInput = new TextInputBuilder()
                    .setCustomId('modalCreateEventInput')
                    .setLabel('Введите timestamp')
                    .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const firstActionRow = new ActionRowBuilder().addComponents(timestampInput)
                modal.addComponents(firstActionRow)
                await ButtonInteraction.showModal(modal);
                const filter = (ModalInteraction) => ModalInteraction.customId === 'modalCreateEvent';
                ButtonInteraction.awaitModalSubmit({ filter, time: 60000 })
                .then(async ModalInteraction => {
                    await ModalInteraction.deferUpdate()
                    let timestampInput = parseInt(ModalInteraction.components[0].components[0].value)*1000
                    let time = new Date(timestampInput)
                    await connection
                        .query(`SELECT protection.eventtime, protection.block, protection.ghost, protection.event, admin.bypass1 FROM protection LEFT JOIN admin ON protection.id = admin.id WHERE protection.id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => {
                            sqlResult = result
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                    if (!sqlResult[0]) {
                        await connection
                            .query(`INSERT INTO protection (id, eventtime) VALUES (${author.id}, 0)`, {
                                type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        sqlResult[0].eventtime = 0
                    } else {
                        eventtime = sqlResult[0].eventtime ?? 0
                        bypass1 = sqlResult[0].bypass1 ?? 0
                        block = sqlResult[0].block
                        eventBool = sqlResult[0].event
                        ghost = sqlResult[0].ghost
                    }
                    if (block) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor(config.colorError)
                            .setDescription(`${author}, вы не можете этого делать`);
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    if (event) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor(config.colorError)
                            .setDescription(`${author}, у вас уже есть активный ивент`);
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    if (eventtime > Date.now() && !bypass1) {
                        let time1 = eventtime - Date.now()
                        let sec = Math.floor(time1/1000%60);
                        let min = Math.floor(time1/1000/60%60);
                        let hours = Math.floor(time1/1000/60/60%24);
                        let result = `${hours}h ${min}m ${sec}s`;
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor(config.colorError)
                            .setDescription(`${author}, вы уже недавно создавали ивент. Создать следующий можно через: ${result}`);
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    if ((timestampInput == NaN) || (timestampInput < Date.now()) || (timestampInput-Date.now() > 24*60*60*1000)) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle(title)
                            .setColor(config.colorError)
                            .setDescription(`${author}, укажите корректное время ивента`);
                        await interaction.editReply({
                            embeds: [errorEmbed],
                            components: []
                        })
                        return
                    }
                    event = ButtonInteraction.values[0]
                    if (event === 'cs2') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤCS2",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«CS2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nТрёхмерным многопользовательским шутером от первого лица, в котором игроки распределяются по двум командам и сражаются друг против друга.\n```",
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
                        ready = true
                        eventName = 'CS 2'
                        roleId = '<@&1111413378875932672>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'dbd') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤDead by Daylight",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Dead by Daylight»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nDead by Daylight — это многопользовательская игра в жанре ужасов в режиме 4 против 1, где один игрок берёт на себя роль жестокого Убийцы, а четыре других игрока являются Выжившими, пытающимися сбежать от убийцы.```",
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
                        ready = true
                        eventName = 'Dead by Daylight'
                        roleId = '<@&1065025610830856334>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'dota2') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤDota 2",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Dota 2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nDota 2 — компьютерная многопользовательская командная игра жанра стратегия в реальном времени с элементами компьютерной ролевой игры, реализация известной карты DotA для игры Warcraft III в отдельном клиенте. В игре участвуют две команды по пять человек. Одна команда играет за светлую сторону, другая — за темную.```",
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
                        ready = true
                        eventName = 'Dota 2'
                        roleId = '<@&1065025625225703484>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'fortnite') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤFortnite",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Fortnite»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nFortnite — это кооперативная песочница на выживание, основными механиками которой являются исследование, сбор ресурсов, строительство укрепленных зданий и борьба с волнами наступающих зомби.```",
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
                        ready = true
                        eventName = 'Fortnite'
                        roleId = '<@&1065025622595874927>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'rocketLeague') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤRocket League",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Rocket League»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nRocket League — аркадная гоночная игра в жанре футбола, разработанная и изданная компанией Psyonix для Windows, PlayStation 4.\n```",
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
                        ready = true
                        eventName = 'Rocket League'
                        roleId = '<@&1065025615650115675>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 3
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 3
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'valorant') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤValorant",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Valorant»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nValorant - это многопользовательский шутер от создателей League of Legends, в котором игроков ждут противостояния команд в формате 5х5 игроков.\n```",
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
                        ready = true
                        eventName = 'Valorant'
                        roleId = '<@&1065025617051013140>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'r6') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤTom Clancy's Rainbow Six: Siege",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Tom Clancy's Rainbow Six: Siege»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nTom Clancy's Rainbow Six: Siege - это очередная часть знаменитого тактического шутера от первого лица, сценарий которого построен на историях реальных контртеррористических операций по всему миру.\n```",
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
                        ready = true
                        eventName = 'Мировой кризис'
                        roleId = '<@&1065025612026232832>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'overwatch2') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤOverwatch 2",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Overwatch 2»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOverwatch 2 — бесплатная командная игра в ярком мире будущего, каждый матч которой представляет собой поистине потрясающий бой 5 на 5.```",
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
                        ready = true
                        eventName = 'Overwatch 2'
                        roleId = '<@&1065028182413148241>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: 'Команда 1',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: 'Команда 2',
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'osu') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤOSU",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«OSU»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nOSU — музыкальная ритм-игра, созданная в 2007 году Дином «peppy» Гербертом.```",
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
                        ready = true
                        eventName = 'OSU'
                        roleId = '<@&1065025624055496734>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'minecraft') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤMinecraft",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Minecraft»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nMinecraft - это инди-игра в жанре песочницы с элементами выживания и открытым миром.```",
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
                        ready = true
                        eventName = 'Намёк понял'
                        roleId = '<@&1065028083620515870>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'lol') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤLeague of Legends",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«League of Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nLeague of Legends – это стратегическая кооперативная игра, в которой две команды из пяти могущественных чемпионов сражаются друг с другом, пытаясь уничтожить вражескую базу.```",
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
                        ready = true
                        eventName = 'League of Legends'
                        roleId = '<@&1065028092474704022>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'genshinEmpact') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤGenshin Impact",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Genshin Impact»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\n«Геншин» — ролевая приключенческая онлайн-игра в открытом мире. Это значит, что игрок управляет персонажем, который может со старта отправиться в любой уголок игрового мира. Здесь можно играть с другими людьми — но только с их разрешения. В игре нет уровней и других условностей, которые бы постоянно ограничивали.```",
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
                        ready = true
                        eventName = 'Genshin Impact'
                        roleId = '<@&1065028078595747881>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 5
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'brawlhalla') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤBrawlhalla",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Brawlhalla»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nBrawlhalla — Эпический платформенный файтинг, в который можно играть как в одиночку, так и при участии до 8 игроков.```",
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
                        ready = true
                        eventName = 'Brawlhalla'
                        roleId = '<@&1065028087236014211>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (event === 'apex') {
                        eventText = [{
                            "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤApex Legends",
                            "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Apex Legends»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nApex Legends — это бесплатный геройский шутер с невероятным выбором легендарных персонажей, эффектных способностей и предметов, которые можно заработать.\n```",
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
                        ready = true
                        eventName = 'Apex Legends'
                        roleId = '<@&1065025614425374821>'
                        channelsList = [
                            {
                                name: eventName,
                                type: 'voice',
                                limit: 0
                            },
                            {
                                name: eventName,
                                type: 'text'
                            },
                        ]
                    }
                    if (!ready) {
                        Embed
                            .setDescription(`${author}, произошла ошибка`)
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                        return
                    }
                    await connection
                        .query(`SELECT eventid FROM settings WHERE id = ${config.client_id};`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => sqlResult = result)
                    await connection
                        .query(`UPDATE protection SET eventtime = ${Date.now()+1000*60*30}, event = 1 WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .catch(err => console.log(err))
                    Embed
                        .setDescription(`${author}, клоуз запланирован на: ${format(time)}`)
                    await interaction.editReply({
                        embeds: [Embed],
                        components: []
                    })
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Close')
                        .setColor('#00ff00')
                    const EmbedEvent = new EmbedBuilder()
                        .setTitle(eventText[0].title)
                        .setDescription(eventText[0].description)
                        .setColor(eventText[0].color)
                        .addFields(eventText[0].fields)
                        .setImage(eventText[0].image.url)
                    if (Date.now()+60*60*1000 > timestampInput) {
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Отправлен вебхук`)
                            logs = await logChannel.send({
                                embeds: [logEmbed],
                            })
                        }
                        message1 = await EventChannel.send({
                            content: `<@&1121809323736191058> ${roleId}`,
                            embeds: [EmbedEvent],
                            components: [rowEvent]
                        })
                    } else {
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Готовится`)
                            logs = await logChannel.send({
                                embeds: [logEmbed],
                            })
                        }
                        await wait(timestampInput-Date.now()-60*60*1000)
                        await connection
                        .query(`SELECT event FROM protection WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                        .then((result) => {
                            sqlResult = result
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                        if (!sqlResult[0].event) {
                            if (!ghost) {
                                logEmbed
                                    .setColor('#ff0000')
                                    .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Отменён`);
                                logs.edit({
                                    embeds: [logEmbed],
                                })
                            }
                            return
                        }
                        message1 = await EventChannel.send({
                            embeds: [EmbedEvent],
                            components: [rowEvent]
                        })
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Отправлен вебхук`);
                            logs.edit({
                                embeds: [logEmbed],
                            })
                        }
                    }
                    const filter1 = ButtonInteraction => ButtonInteraction.customId === 'buttonEventRegistration'

                    const collector1 = message1.createMessageComponentCollector({ filter1, time: 3600000 });

                    collector1.on('collect', async ButtonInteraction => {
                        await connection
                            .query(`SELECT event FROM protection WHERE id = ${author.id}`, {
                                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                        .then((result) => {
                            sqlResult = result
                        })
                        .catch((err) => {
                            console.log(`SQL: Error ${err}`)
                        })
                        if (!sqlResult[0].event) {
                            await ButtonInteraction.reply({
                                content: `${ButtonInteraction.member}, клоуз был отменён`,
                                ephemeral: true
                            })
                            collector1.stop()
                            return
                        }
                        await ButtonInteraction.reply({
                            content: `${ButtonInteraction.member}, вам будет прислано уведомление о начале клоуза`,
                            ephemeral: true
                        })
                        members.push(ButtonInteraction.member)
                    })
                    collector1.on('end', async () => {
                        rowEvent.components[0].setDisabled(true)
                        await message1.edit({
                            components: [rowEvent]
                        })
                    })
                    await wait (timestampInput-Date.now())
                    await connection
                        .query(`SELECT event FROM protection WHERE id = ${author.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .then((result) => {
                        sqlResult = result
                    })
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                    })
                    if (!sqlResult[0].event) {
                        return
                    }
                    collector1.stop()
                    await interaction.guild.channels.create({
                        name: eventName,
                        type: ChannelType.GuildCategory,
                        position: 5,
                        permissionOverwrites: [
                            {
                                id: '1079056110960513207',
                                deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
                            }
                        ]
                    })
                    .then(channel => category = channel)
                    .catch(err => console.log(err))
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
                    for (let i = 0; i < channelsList.length; i++) {
                        if (channelsList[i].type == 'voice') {
                            await interaction.guild.channels.create({
                                name: channelsList[i].name,
                                type: ChannelType.GuildVoice,
                                parent: category.id,
                                limit: channelsList[i].limit
                            })
                            .catch(err => console.log(err))
                        } else {
                            await interaction.guild.channels.create({
                                name: channelsList[i].name,
                                type: ChannelType.GuildText,
                                parent: category.id
                            })
                            .catch(err => console.log(err))
                        }
                    }
                    await connection
                        .query(`UPDATE protection SET event = 2 WHERE id = ${author.id};`, {
                            type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                        })
                    .catch(err => console.log(err))
                    await author.user.send({
                        content: `${author}, клоуз создан`
                    })
                    if (!ghost) {
                        logEmbed
                            .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Проводится`);
                        logs.edit({
                            embeds: [logEmbed],
                        })
                    }
                    for (let i = 0; i < members.length; i++) {
                        await members[0].send({
                            content: `${members[0]}, приготовтесь, клоуз ${eventName} начинается!`
                        })
                        .catch()
                    }
                    const rowSettings1 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventEditLimit')
                                .setEmoji(config.emojis.changeLimit)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventLock')
                                .setEmoji(config.emojis.ban)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventUnlock')
                                .setEmoji(config.emojis.unban)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventMute')
                                .setEmoji(config.emojis.voiceMute)
                                .setStyle(2),
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventUnmute')
                                .setEmoji(config.emojis.voiceUnmute)
                                .setStyle(2),
                        )
                    const rowSettings2 = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventClose')
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
                    .then((msg) => message = msg)
                    const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonEventEditLimit' || ButtonInteraction.customId === 'buttonEventLock' || ButtonInteraction.customId === 'buttonEventUnlock' || ButtonInteraction.customId === 'buttonEventMute' || ButtonInteraction.customId === 'buttonEventUnmute' || ButtonInteraction.customId === 'buttonEventClose';

                    const collector = message.createMessageComponentCollector({ filter});

                    collector.on('collect', async ButtonInteraction => {
                        let voice = author.voice.channel
                        if ((!voice || voice.parentId !== category.id) && ButtonInteraction.customId !== 'buttonEventClose') {
                            Embed
                                .setDescription(`${author}, вы должны находиться в соданном голосовом канале`)
                                .setColor(config.colorError)
                            await ButtonInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        }
                        if (ButtonInteraction.customId === 'buttonEventEditLimit') {
                            const modal = new ModalBuilder()
                                .setCustomId('modalEventEditLimit')
                                .setTitle('Изменить лимит голосового канала');
                            const input = new TextInputBuilder()
                                .setCustomId('modalEventEditLimitInput')
                                .setLabel('Введите новый лимит')
                                .setPlaceholder('1')
                                .setStyle(TextInputStyle.Short)
                                .setMaxLength(2)
                                .setRequired(true)
                            const firstActionRow = new ActionRowBuilder().addComponents(input)
                            modal.addComponents(firstActionRow)
                            await ButtonInteraction.showModal(modal);
                            const filter = (ModalInteraction) => ModalInteraction.customId === 'buttonEventEditLimit';
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
                        if (ButtonInteraction.customId === 'buttonEventLock') {
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
                        if (ButtonInteraction.customId === 'buttonEventUnlock') {
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
                        if (ButtonInteraction.customId === 'buttonEventMute') {
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
                        if (ButtonInteraction.customId === 'buttonEventUnmute') {
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
                        if (ButtonInteraction.customId === 'buttonEventClose') {
                            if (!ghost) {
                                logEmbed
                                    .setDescription(`[1] ${author}(${author.id})
[2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
[3] Время: ${format(time)}(${timestampInput})
[4] Статус: Завершён(${ButtonInteraction.member})`);
                                logs.edit({
                                    embeds: [logEmbed],
                                })
                            }
                            await ButtonInteraction.deferUpdate()
                            let parent = ButtonInteraction.channel.parent
                            for (var [key, value] of parent.children.cache) {
                                await value.delete()
                            }
                            await parent.delete()
                        }
                    })
                })
                .catch(async err => {})
            })
            collector.on('end', async () => {
				if (!ready) {
                    row.components[0].setDisabled(true)
					await interaction.editReply({
						components: [row]
					})
				}
			})
        }
        if (subcommand === 'cancel') {
            await connection
                .query(`SELECT event FROM protection WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            .then((result) => {
                sqlResult = result
            })
            .catch((err) => {
                console.log(`SQL: Error ${err}`)
            })
            if (!sqlResult || sqlResult[0].event != 1) {
                const embedError = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(`${author}, у вас нет запланированных ивентов`)
                    .setColor(config.colorError)
                await interaction.reply({
                    embeds: [embedError],
                })
                return
            }
            const modal = new ModalBuilder()
                .setCustomId('modalCloseCancel')
                .setTitle(title);
            const input = new TextInputBuilder()
                .setCustomId('modalCloseCancelInput')
                .setLabel('Введите причину отмены клоуза')
                .setPlaceholder('Причина')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            const firstActionRow = new ActionRowBuilder().addComponents(input)
            modal.addComponents(firstActionRow)
            await interaction.showModal(modal);
            interaction.awaitModalSubmit({ time: 300000 })
            .then(async ModalInteraction => {
                let reasonInput = ModalInteraction.components[0].components[0].value
                await connection
                    .query(`SELECT ghost FROM money WHERE id = ${author.id}`, {
                        type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                .then((result) => sqlResult = result)
                .catch()
                await connection
                    .query(`UPDATE protection SET event = 0 WHERE id = ${author.id}`, {
                        type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(`${author}, клоуз отменён`)
                    .setColor(config.color)
                await ModalInteraction.reply({
                    embeds: [embed],
                })
                if (!sqlResult[0].ghost) {
                    const embed = new EmbedBuilder()
                        .setTitle('Close cancel')
                        .setDescription(`[1] ${author}(${author.id})
[2] Отмена клоуза
[3] Причина: ${reasonInput}`)
                        .setColor('#ff0000')
                    await logChannel.send({
                        embeds: [embed]
                    })
                }
            })
            .catch((err) => {
            })
        }
	}
};