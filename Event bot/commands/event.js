const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { $selectMenu, $sendMessage, $row } = require("discord.js-basic")
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
        .setDescription('a')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создание ивента")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription("Отменить создание ивента")
                .addIntegerOption(option => 
                    option.setName('id')
                    .setDescription('ID ивента')
                    .setRequired(true))
        ),
	async execute(interaction, connection, DB) {
        let lockedCommands = DB.lockedCommands;
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const subcommand = interaction.options._subcommand
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const EventChannel = await interaction.guild.channels.fetch(config.eventChannel)
        let eventtime
        let block
        let bypass1;
        let sqlResult
        let title = 'Создание ивента'
        let message
        let message1
        let logs
        let category
        let channelControl
        let eventName
        let eventText
        let ready = false;
        let members = []
        let ghost = 1
        let timeEmbed
        let timestampInput
        let eventId = 'Ивент не активен';
        let status = 'start';
        let statusText = 'Не активен'
        let timeText = 'Не указано'
        let eventObject = {}
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
        try {
            let setEvent = (timestamp) => {
                if (eventName === 'mafia') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠМафия",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + String(two(time.getHours())) + ":" + String(two(time.getMinutes())) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Мафия»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Это - клубная командная психологическая пошаговая ролевая игра с детективным сюжетом, моделирующая борьбу информированных друг о друге членов организованного меньшинства с неорганизованным большинством.\n\nЗавязка сюжета: Жители города, обессилевшие от разгула мафии, выносят решение пересажать в тюрьму всех мафиози до единого. В ответ мафия объявляет войну до полного уничтожения всех мирных горожан.\n```\nᅠ",
                        "color": 56831,
                        "fields": [
                        {
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                        }
                    }]
                    ready = true
                    eventName = 'Мафия'
                }
                if (eventName === 'Gartic Phone') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠGartic Phone",
                        "description": "**Дорогие участники сервера! Сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Gartic Phone»`__\n\n:Line: Ведущий : <@" + author + ">\n\n```Игра, в которой игроки рисуют и отгадывают рисунки друг друга. Игра основана на классической игре «телефон», где сообщение передается от одного игрока к другому, и каждый следующий игрок передает информацию так, как он ее понял, что приводит к комическим различиям между оригинальным сообщением и конечным результатом\n```\nᅠ",
                        "color": 1179629,
                        "fields": [
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981492103807056/Gartic.gif?ex=661bd498&is=66095f98&hm=cae6bd5e2097381c14dbd8f7ae1e2f28849d71d8e70b3871fcedad814d1141c1&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Шпион') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠШпион",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Шпион»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```В игре есть есть один шпион и обычные игроки, шпион не знает локацию и должен разгадать ее, либо же дождаться пока обвинят не того. Цель обычных игроков - определить шпиона. Время ограничено, поторопитесь.```\nᅠ",
                        "color": 1179629,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981548768854036/08622d707a456eab.gif?ex=661bd4a5&is=66095fa5&hm=cb9f8dab02e074eef008b82f9766be7036b7964c2b96e28092fda488280dffeb&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Шляпа') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠШляпа",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Шляпа»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игроки делятся на команды, в каждой команде по 2-3 человека, количество команд неограниченно.\nОдин из игроков, у которого так называемая стрелочка объясняет слова, другой отгадывает.```\nᅠ",
                        "color": 1179629,
                        "fields": [
                        {
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981548307746957/156a5f55fe09d873.gif?ex=661bd4a5&is=66095fa5&hm=3263bdf42f1c1835dbc1d77b381f9a7de08268408b3428e86727fa81a719ba79&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Угадай мелодию') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠУгадай мелодию",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Угадай мелодию»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игрушка, где вам будет даваться какой-то отрывок трека из топ чартов, вам за определенное количество времени необходимо выбрать, что это за трек. Заходите на сайт, нажимаете на кнопочку играть!\n```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981546768437319/b415fb99cfc81737.gif?ex=661bd4a5&is=66095fa5&hm=881c1a20a7352afed69956a1b44b9154ff9a45fc780b35b0195338f99f687690&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Своя игра') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠСвоя Игра",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Своя Игра»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Интеллектуальная викторина, в которой каждый может проверить свои знания и скорость реакции и сразиться с оппонентами.\n```\nᅠ",
                        "color": 1179629,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981524500746250/6d5a5f52cbcea003.gif?ex=661bd49f&is=66095f9f&hm=ae4828c758777f539f44763e0c63d9c2ffcd6186a2953496b2414621999b87d7&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Ппт') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠПесня по тексту",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Песня по тексту»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Ивент схожий с загадками, проводится аналогично - скидываешь в чат/зачитываешь текст из песни, либо же можно включать фрагмент через саунпад/бота, принимаешь ответы так же исключительно в чате, кто первый назвал тому и засчитываешь правильный ответ, выдаешь 2 коина за каждый правильный.```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981527453663343/a24bbfa5bf074531.gif?ex=661bd4a0&is=66095fa0&hm=8abb9f5374f65fc4011522f7193c5ca190b48be8914d238a2533798ce762556b&="
                        }
                    }]
                    
                    ready = true
                }
                if (eventName === 'Правда или действие') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠПравда или действие",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Правда или действие»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игра для двух и более игроков. Особенно популярна среди детей и подростков.\nИгроку, до которого дошёл ход, даётся выбор: правдиво ответить на вопрос, который ему будет задан, или выполнить какое-нибудь задание.```\nᅠ",
                        "color": 1179629,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981527822635130/0d5b5b8927275cc6.gif?ex=661bd4a0&is=66095fa0&hm=c6ce48490108a434fbd1ff5512d9da19514415515e28c1418557ad8629981998&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Намёк понял') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠНамек понял",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Намек понял»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Один из игроков становится ведущим (каждый раунд новый), а остальные игроки получают слово, на которое нужно намекнуть ведущему словом-подсказкой. ```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981527122182214/656c62c251a52307.gif?ex=661bd4a0&is=66095fa0&hm=69ac1a83da5bcb926e35ced1827c88b36df7ff34fd520a022dd01afa94cb727a&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Монополия') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠМонополия",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Монополия»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Настольная игра в жанре экономической стратегии для двух и более человек.```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981492850655252/Monopolia.gif?ex=661bd498&is=66095f98&hm=38b60688887d57061b9f8b90c70a1320aeceb659a3e2ca6e434c5bbe8836fb66&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Крокодил') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠКрокодил",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Крокодил»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Аналогия ирл игры, только в виде рисовалки, принцип абсолютно такой же как как и в ирл игре.```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981525616431174/2f0b4be1a4ac82ad.gif?ex=661bd4a0&is=66095fa0&hm=71bd8a7ace0fbd215a7bbe472418cd8109b5598965c745a54bd4f50985509cea&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Codenames') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠКоднеймс",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Коднеймс»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игроки делятся на 2/3 команды, в зависимости от количества участников. У каждой команды есть капитан, он дает ассоциации.\nАссоциация может состоять из одного и слова и одной цифры. Допустим на столе слова: микроволновка, фартук, повар. Капитан может загадать ассоциацию; Кухня - 3```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981524915978392/a92b065b0948eb20.gif?ex=661bd4a0&is=66095fa0&hm=1661a25097dfa89e6f2044c9bd753482b485c9ba61f9ba893b7fdda8773ecefc&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Загадки') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠЗагадки",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Загадки»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Просто чилловый ивент, где ты, как ведущий зачитываешь загадку, кто первый в чат напишет ответ - получат 1 очко. Проводится исключительно в устном формате, проведение через какие-либо сторонние сайты запрещены.\nЧтобы засчитать ивент необходимо загадать минимум 10 загадок, то есть 10 загадок = 1 балл.```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981494784098405/44677a58b678333f.gif?ex=661bd498&is=66095f98&hm=32f274347e6aab0fbdae7b94f9c619fd61e13f263f0a071f36717435d0a6f889&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'JackBox') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠДжек Бокс",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Джек Бокс»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Огромнейшие паки интересных и весёлых игр, шутите, рисуйте, отвечайте на вопросы. В игру можно играть с любого устройства, достаточно лишь знать ход игры!\n```\nᅠ",
                        "color": 56831,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                        "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981492494008433/Jack_Box.gif?ex=661bd498&is=66095f98&hm=531128d1778bf3e0eb84dcfdc7a814ba74edd926c891201a0a8b24ea8ce8022f&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Бункер') {
                    eventText = [{
                        "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠБункер",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Бункер»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Каждый игрок рандомно получает 8 характеристик и 2 карты действий. После старта игры, никто не знает твоих характеристик, также как и ты чужих, до тех пор пока игроки не откроют ту или иную характеристику. Постарайся максимально подробно описать свои характеристики, таким образом у тебя будет больше шансов убедить других игроков оставить именно тебя в игре.```\nᅠ",
                        "color": 1179629,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981493513224222/cea29c26e2971d1c.gif?ex=661bd498&is=66095f98&hm=78fa7e881a0003ff5f0477371509c824485dbbb60eb4ac5024d1129ff8cb61e2&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Кто я') {
                    eventText =  [{
                        "title": "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Кто я?",
                        "description": "Дорогие участники сервера, сегодня в ** __`" + time(timestamp) + " по мск`__, ** у нас проходит увлекательный ивент по игре «Кто я?»\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Каждый участник загадывает персонажа/предмет и начинается ход, если игрок получает утвердительный ответ на свой вопрос, он может продолжать расспросы, если ответ отрицательный, ход автоматически переходит к следующему игроку.```\n",
                        "color": 6946798,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "100 " + config.emoji,
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "50 " + config.emoji,
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1215762171179569222/1223981525968748615/7.gif?ex=661bd4a0&is=66095fa0&hm=db77877b2e6b5b2ab7a09780c529d8c3dc5fcd511aea0ea3b840e9adbd140c0e&="
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Криминалист') {
                    eventText =  [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤКриминалист",
                        "description": "ㅤ**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Криминалист»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Криминалист - уникальная детективная игра, соединяющая в себе психологические, дедуктивные и логические элементы.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150 <:Money:1153010563505475645>",
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75 <:Money:1153010563505475645>",
                            "inline": true
                        }],
                        "image": {
                            "url": "https://cdn.discordapp.com/attachments/1069673488786407575/1223267597236178995/11d7437cc0206979.gif?ex=66193bba&is=6606c6ba&hm=732a6be774d1b2a7ce763b551586c01a6775e56c9a6841e3a3388bae59f2e613&"
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Имаджинариум') {
                    eventText =  [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤИмаджинариум",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Имаджинариум»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Имаджинариум — это настольная игра в ассоциации, отечественный аналог легендарного Диксита.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150 <:Money:1153010563505475645>",
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75 <:Money:1153010563505475645>",
                            "inline": true
                        }],
                        "image": {
                            "url": "https://media.discordapp.net/attachments/1199748025640308766/1223350813523443722/198f3b738cc5903d.gif?ex=6619893a&is=6607143a&hm=656da599bd280a4279fc80b3d9fc9eed83f55cb0938a15e253f833c8763d5d8b&=&width=450&height=213"
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Дурак') {
                    eventText =  [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤДурак онлайн",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Дурак онлайн»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```«Дура́к» — карточная игра, популярная в странах бывшего СССР.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150 <:Money:1153010563505475645>",
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75 <:Money:1153010563505475645>"
                        }],
                        "image": {
                            "url": "https://cdn.discordapp.com/attachments/1069673488786407575/1223267596694978680/1dca8b1344ffc67a.gif?ex=66193bba&is=6606c6ba&hm=b6c02a56c19321122f60f27715a72cd8cc7befddc19d0b6efc8acb203f8a1f7c&"
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Гномы вредители') {
                    eventText =  [{
                        "title": "ㅤㅤㅤㅤㅤ ㅤ ㅤ Гномы вредители",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Гномы вредители»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Гномы-вредители — карточная настольная игра на тему золотодобычи, разработанная Фредериком Мойерсоном и выпущенная в 2004 году компанией Z-Man Games.```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150 <:Money:1153010563505475645>",
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75 <:Money:1153010563505475645>",
                            "inline": true
                        }],
                        "image": {
                            "url": "https://cdn.discordapp.com/attachments/1069673488786407575/1223267596259037296/e08cb0dd646b5d48.gif?ex=66193bba&is=6606c6ba&hm=4fa31ca4c9aa23466ee2d366439236a74b4ba4029ab4022c55f63fc4e6b31b23&"
                        }
                    }]
                    ready = true
                }
                if (eventName === 'Цитадели') {
                    eventText =  [{
                        "title": "ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤЦитадели",
                        "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный клоуз по игре** __`«Цитадели»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```«Цитадели» - градостроительная «Мафия», в которой участникам доведется проявить смекалку, находчивость, спокойствие и показать высший пилотаж в построении стратегии!```",
                        "color": null,
                        "fields": [{
                            "name": "Награда за победу:",
                            "value": "150 <:Money:1153010563505475645>",
                            "inline": true
                        },
                        {
                            "name": "Награда за участие:",
                            "value": "75 <:Money:1153010563505475645>",
                            "inline": true
                        }],
                        "image": {
                            "url": "https://cdn.discordapp.com/attachments/1069673488786407575/1223267605708804117/08c91467cbde3162.gif?ex=66193bbc&is=6606c6bc&hm=cef881fcf6c2a4a2e8d139ae328a4a18f03121540806217bff7ceec63122fd19&"
                        }
                    }]
                    ready = true
                }
            }
            let createEvent = async (Embed) => {
                if (DB.events[eventId].status == 'Отменён') {
                    return
                }
                Embed.setDescription(`ID: ${eventId}
Ведущий: ${author}
Ивент: ${eventName}
Время: ${timeText}
Статус: Ивент создан`)
                await interaction.editReply({
                    embeds: [Embed],
                    components: []
                })
                await interaction.guild.channels.create({
                    name: eventName,
                    type: ChannelType.GuildCategory,
                    position: 5,
                    permissionOverwrites: [
                        {
                            id: config.roleEventBan,
                            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
                        }
                    ]
                })
                .then(channel => category = channel)
                .catch(err => console.log(err))
                DB.events[eventId].category = category.id;
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
                await interaction.guild.channels.create({
                    name: eventName,
                    type: ChannelType.GuildText,
                    parent: category.id
                })
                .then(channel => category = channel)
                .catch(err => console.log(err))
                await interaction.guild.channels.create({
                    name: eventName,
                    type: ChannelType.GuildVoice,
                    parent: category.id
                })
                .catch(err => console.log(err))
                try {
                    await author.user.send({
                        content: `${author}, ивент создан`
                    })
                    .catch()
                } catch(err) {
                    
                }
                try {
                    for (let i = 0; i < members.length; i++) {
                        await members[i].send({
                            content: `${members[i]}, приготовтесь, ивент ${eventName} начинается!`
                        })
                        .catch()
                    }
                } catch(err) {
                    
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
    ${config.emojis.cancel} - закончить ивент`)
                await channelControl.send({
                    embeds: [settingsEmbed],
                    components: [rowSettings1, rowSettings2]
                })
                .then((msg) => message = msg)
                const filter3 = ButtonInteraction => ButtonInteraction.customId === 'buttonEventEditLimit' || ButtonInteraction.customId === 'buttonEventLock' || ButtonInteraction.customId === 'buttonEventUnlock' || ButtonInteraction.customId === 'buttonEventMute' || ButtonInteraction.customId === 'buttonEventUnmute' || ButtonInteraction.customId === 'buttonEventClose';

                const collector3 = message.createMessageComponentCollector({ filter3});

                collector3.on('collect', async ButtonInteraction => {
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
                        collector3.stop()
                        if (!ghost) {
                            logEmbed
                                .setDescription(`[1] ${author}(${author.id})
    [2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
    [3] Время: ${format(time)}(${timestampInput})
    [4] Статус: Завершён(${ButtonInteraction.member})`);
                            await logs.edit({
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
            }
            switch (subcommand) {
                case 'create': title=`Создание ивента`;break;
                case 'cancel': title=`Отменить создание ивента`;break;
            }
            if (!author.roles.cache.has(config.roleEvent) && !author.roles.cache.has(config.roleMafia) && author.id != config.owner_id) {
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
                            .placeholder("Event")
                            .options({
                                    label: 'Ивент Мафия',
                                    description: '',
                                    value: 'Мафия',
                                },
                                {
                                    label: 'Ивент Gartic Phone',//
                                    description: '',
                                    value: 'Gartic Phone',
                                },
                                {
                                    label: 'Ивент Шпион',//
                                    description: '',
                                    value: 'Шпион',
                                },
                                {
                                    label: 'Ивент Шляпа',//
                                    description: '',
                                    value: 'Шляпа',
                                },
                                {
                                    label: 'Ивент Угадай мелодию',//
                                    description: '',
                                    value: 'Угадай мелодию',
                                },
                                {
                                    label: 'Ивент Своя игра',//
                                    description: '',
                                    value: 'Своя игра',
                                },
                                {
                                    label: 'Ивент Песня по тексту',//
                                    description: '',
                                    value: 'Ппт',
                                },
                                {
                                    label: 'Ивент Правда или действие',//
                                    description: '',
                                    value: 'Правда или действие',
                                },
                                {
                                    label: 'Ивент Намек понял',//
                                    description: '',
                                    value: 'Намёк понял',
                                },
                                {
                                    label: 'Ивент Монополия',//
                                    description: '',
                                    value: 'Монополия',
                                },
                                {
                                    label: 'Ивент Крокодил',//
                                    description: '',
                                    value: 'Крокодил',
                                },
                                {
                                    label: 'Ивент Коднеймс',//
                                    description: '',
                                    value: 'Codenames',
                                },
                                {
                                    label: 'Ивент Загадки',//
                                    description: '',
                                    value: 'Загадки',
                                },
                                {
                                    label: 'Ивент Джек Бокс',//
                                    description: '',
                                    value: 'JackBox',
                                },
                                {
                                    label: 'Ивент Бункер',//
                                    description: '',
                                    value: 'Бункер',
                                },
                                {
                                    label: 'Ивент Кто я',//
                                    description: '',
                                    value: 'Кто я',
                                },
                                {
                                    label: 'Ивент Криминалист',//
                                    description: '',
                                    value: 'Криминалист',
                                },
                                {
                                    label: 'Ивент Имаджинариум',//
                                    description: '',
                                    value: 'Имаджинариум',
                                },
                                {
                                    label: 'Ивент Дурак',//
                                    description: '',
                                    value: 'Дурак',
                                },
                                {
                                    label: 'Ивент Гномы вредители',//
                                    description: '',
                                    value: 'Гномы вредители',
                                },
                                {
                                    label: 'Ивент Цитадели',//
                                    description: '',
                                    value: 'Цитадели',
                                }
                                )
                            .save()
                    )
                const Embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(`${author}, выберите ивент`)
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
                    eventName = ButtonInteraction.values[0]
                    const rowTime = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventSendNow')
                                .setLabel('Начать сейчас')
                                .setStyle(2)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventSendTime')
                                .setLabel('Запланировать')
                                .setStyle(2)
                        )
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('buttonEventCancel')
                                .setLabel('Отмена')
                                .setStyle(4)
                        );
                    Embed.setDescription(`ID: ${eventId}
Ведущий: ${author}
Ивент: ${eventName}
Время: ${timeText}
Статус: ${statusText}`)
                    await interaction.editReply({
                        embeds: [Embed],
                        components: [rowTime]
                    })
                    status = 'collector1'
                    const filter1 = ButtonInteraction => ButtonInteraction.customId === 'buttonEventSendNow' || ButtonInteraction.customId === 'buttonEventSendTime' || ButtonInteraction.customId === 'buttonEventCancel';

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
                        if (ButtonInteraction.customId === 'buttonEventCancel') {
                            await ButtonInteraction.deferUpdate()
                            collector1.stop()
                            Embed.setDescription(`ID: ${eventId}
Ведущий: ${author}
Ивент: ${eventName}
Время: ${timeText}
Статус: Отменён`)
                            await interaction.editReply({
                                embeds: [Embed],
                                components: []
                            })
                            return
                        }
                        eventId = DB.settings.events;
                        DB.settings.events+=1
                        const logEmbed = new EmbedBuilder()
                            .setTitle('Event')
                            .setColor('#00ff00')
                        if (ButtonInteraction.customId === 'buttonEventSendNow') {
                            collector1.stop()
                            await ButtonInteraction.deferUpdate()
                            timeEmbed = new Date()
                            setEvent(timeEmbed)
                            /*const EmbedEvent = new EmbedBuilder()
                                .setTitle(eventText[0].title)
                                .setDescription(eventText[0].description)
                                .setColor(eventText[0].color)
                                .addFields(eventText[0].fields)
                                .setImage(eventText[0].image.url)*/
                            eventObject = {
                                author: author.id,
                                name: eventName,
                                time: timeEmbed,
                                status: 'Ивент создан',
                                category: undefined
                            }
                            DB.events[eventId] = eventObject
                            if (!ghost) {
                                logEmbed
                                    .setDescription(`[1] ${author}(${author.id})
    [2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
    [3] Время: ${format(timestampInput)}(${timestampInput})
    [4] Статус: Ивент создан`)
                                logs = await logChannel.send({
                                    embeds: [logEmbed],
                                })
                            }
                            message1 = await EventChannel.send({
                                content: `<@&1121809323736191058>`,
                                embeds: eventText,
                            })
                            timeText = format(timeEmbed)
                            createEvent(Embed)
                        }
                        if (ButtonInteraction.customId === 'buttonEventSendTime') {
                            const modal = new ModalBuilder()
                                .setCustomId('modalCreateEvent')
                                .setTitle('Создание ивента');
                            const timestampTextInput = new TextInputBuilder()
                                .setCustomId('modalCreateEventInput')
                                .setLabel('Введите timestamp')
                                .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                            const firstActionRow = new ActionRowBuilder().addComponents(timestampTextInput)
                            modal.addComponents(firstActionRow)
                            await ButtonInteraction.showModal(modal);
                            const filter = (ModalInteraction) => ModalInteraction.customId === 'modalCreateEvent';
                            ButtonInteraction.awaitModalSubmit({ filter, time: 600000 })
                            .then(async ModalInteraction => {
                                collector1.stop()
                                status = 'end'
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
                                const dateObject = new Date(timestampInput)
                                setEvent(dateObject)
                                const EmbedEvent = new EmbedBuilder()
                                    .setTitle(eventText[0].title)
                                    .setDescription(eventText[0].description)
                                    .setColor(eventText[0].color)
                                    .addFields(eventText[0].fields)
                                    .setImage(eventText[0].image.url)
                                timeEmbed = timestampInput-60*60*1000
                                eventObject = {
                                    author: author.id,
                                    name: eventName,
                                    time: timestampInput,
                                    status: 'Запланирован',
                                    category: undefined
                                }
                                DB.events[eventId] = eventObject
                                timeText = format(dateObject)
                                if (timeEmbed > Date.now()) {
                                    Embed.setDescription(`ID: ${eventId}
    Ведущий: ${author}
    Ивент: ${eventName}
    Время: ${timeText}
    Статус: Запланирован`)
                                    await interaction.editReply({
                                        embeds: [Embed],
                                        components: []
                                    })
                                    await wait(timeEmbed-Date.now())
                                    if (!DB.events[eventId]) return
                                }
                                const rowEvent = new ActionRowBuilder()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('buttonEventRegistration')
                                            .setLabel('Записаться')
                                            .setStyle(2),
                                    )
                                if (!ghost) {
                                    logEmbed
                                        .setDescription(`[1] ${author}(${author.id})
    [2] Ивент/ID: ${eventName} (${sqlResult[0].eventid})
    [3] Время: ${timeText}(${timestampInput})
    [4] Статус: Отправлен вебхук`)
                                    logs = await logChannel.send({
                                        embeds: [logEmbed],
                                    })
                                }
                                DB.events[eventId].status = 'Отправлен вебхук'
                                Embed.setDescription(`ID: ${eventId}
    Ведущий: ${author}
    Ивент: ${eventName}
    Время: ${timeText}
    Статус: Отправлен вебхук`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                message1 = await EventChannel.send({
                                    content: `<@&1121809323736191058>`,
                                    embeds: [EmbedEvent],
                                    components: [rowEvent]
                                })
                                const filter2 = ButtonInteraction => ButtonInteraction.customId === 'buttonEventRegistration'

                                const collector2 = message1.createMessageComponentCollector({ filter2, time: timestampInput-Date.now() });

                                collector2.on('collect', async ButtonInteraction => {
                                    if (!DB.events[eventId]) {
                                        await ButtonInteraction.reply({
                                            content: `${ButtonInteraction.member}, ивент был отменён`,
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
                                    rowEvent.components[0].setDisabled(true)
                                    await message1.edit({
                                        components: [rowEvent]
                                    })
                                    if (DB.events[eventId]) createEvent(Embed)
                                })
                            })
                        }
                    })
                    collector1.on('end', async () => {
                        if (status == 'collecor1') {
                            for (let i = 0; i < rowTime.components.length; i++) {
                                rowTime.components[i].setDisabled(true)
                            }
                            await interaction.editReply({
                                components: [rowTime]
                            })
                        }
                    })
                })
                collector.on('end', async () => {
                    if (status == 'collecor') {
                        row.components[0].setDisabled(true)
                        await interaction.editReply({
                            components: [row]
                        })
                    }
                })
            }
            if (subcommand === 'cancel') {
                const eventId = interaction.options.getInteger('id');
                const eventObject = DB[eventId]
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
                        .setDescription(`${author}, ивент не найден`);
                    await interaction.reply({
                        embeds: [errorEmbed],
                        ephemeral: true
                    })
                }
                let cancelEvent = async (Embed) => {
                    if (DB[eventId].status !== 'Запланирован' && DB[eventId].status !== 'Отправлен вебхук') {
                        DB[eventId].status = 'Отменён';
                        Embed.setDescription(`${author}, ивент ${eventId} отменён`);
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                    } else {
                        Embed.setDescription(`${author}, вы не можете отменить ивент ${eventId}`);
                        await interaction.editReply({
                            embeds: [Embed],
                            components: []
                        })
                    }
                }
                const Embed = new EmbedBuilder()
                    .setTitle(title)
                    .setColor(config.color)
                if (author.id === DB[eventId].author) {
                    await interaction.deferReply()
                    cancelEvent(Embed)
                } else {
                    if (author.roles.cache.has(config.roleGods) || author.roles.cache.has(config.roleSerafim) || author.id === config.owner_id) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonEventCancelYes')
                                    .setEmoji(config.emojis.yes)
                                    .setStyle(2),
                            )
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttonEventCancelNo')
                                    .setEmoji(config.emojis.no)
                                    .setStyle(2),
                            )
                        Embed.setDescription(`${author}, это не ваш ивент, вы уверены, что хотите его отменить?`);
                        await interaction.reply({
                            embeds: [Embed],
                            components: [row],
                            fetchReply: true
                        })
                        .then((msg) => message = msg)
                        const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonEventCancelYes' || ButtonInteraction.customId === 'buttonEventCancelNo';

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
                            if (ButtonInteraction.customId === 'buttonEventCancelYes') {
                                cancelEvent(Embed)
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
        } catch(err) {
            if (err.code != 10062) {
				//DB.lockedCommands.push(interaction.commandName)
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