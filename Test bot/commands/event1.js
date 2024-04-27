const { SlashCommandBuilder , EmbedBuilder, ButtonBuilder, ActionRowBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { $selectMenu, $sendMessage, $row } = require("discord.js-basic")
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const { emit } = require('node:process');
const { aiplatform } = require('googleapis/build/src/apis/aiplatform');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event1')
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
        let eventId = 0;
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
        let setEvent = (timestamp) => {
            if (eventName === 'Мафия') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠМафия",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Мафия»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Это - клубная командная психологическая пошаговая ролевая игра с детективным сюжетом, моделирующая борьбу информированных друг о друге членов организованного меньшинства с неорганизованным большинством.\n\nЗавязка сюжета: Жители города, обессилевшие от разгула мафии, выносят решение пересажать в тюрьму всех мафиози до единого. В ответ мафия объявляет войну до полного уничтожения всех мирных горожан.\n```\nᅠ",
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
            }
            if (eventName === 'Gartic Phone') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠGartic Phone",
                    "description": "**Дорогие участники сервера! Сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Gartic Phone»`__\n\n:Line: Ведущий : <@" + author + ">\n\n```Игра, в которой игроки рисуют и отгадывают рисунки друг друга. Игра основана на классической игре «телефон», где сообщение передается от одного игрока к другому, и каждый следующий игрок передает информацию так, как он ее понял, что приводит к комическим различиям между оригинальным сообщением и конечным результатом\n```\nᅠ",
                    "color": 2621413,
                    "fields": [
                    {
                        "name": "Награда за участие:",
                        "value": "50 " + config.emoji,
                        "inline": true
                    }],
                    "image": {
                        "url": "https://images-ext-1.discordapp.net/external/jt6ALOTQPYU6XePpoiKIbMdK450Q_60GYwevczgtsgU/https/1.bp.blogspot.com/-mqZdDXcn1hU/X_iH-rNtzNI/AAAAAAAAKeY/5ZnyxbA81H8X6uJs6ApMlF8EUqlfR-FRQCLcBGAsYHQ/w1200-h630-p-k-no-nu/gar.png"
                    }
                }]
                ready = true
            }
            if (eventName === 'Шахматы') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠШахматы",
                    "description": "**Дорогие участники сервера!\n\n Сегодня в** __`" + time(timestamp) + " по мск`__, ** __`«Шахматы»`__\n\n<a:blue_mark:1171073112104775783> Ведущий :  <@" + author + ">\n\n```Настольная логическая игра с шахматными фигурами на 64-клеточной доске, сочетающая в себе элементы искусства, науки и спорта.\n```\nᅠ",
                    "color": 2621413,
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
                        "url": "https://s.ecrater.com/stores/395946/584d759181faf_395946b.jpg"
                    }
                }]
                ready = true
            }
            if (eventName === 'Шпион') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠШпион",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Шпион»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```В игре есть есть один шпион и обычные игроки, шпион не знает локацию и должен разгадать ее, либо же дождаться пока обвинят не того. Цель обычных игроков - определить шпиона. Время ограничено, поторопитесь.```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
            if (eventName === 'Шляпа') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠШляпа",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Шляпа»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игроки делятся на команды, в каждой команде по 2-3 человека, количество команд неограниченно.\nОдин из игроков, у которого так называемая стрелочка объясняет слова, другой отгадывает.```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
            if (eventName === 'Своя игра') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠСвоя Игра",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Своя Игра»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Интеллектуальная викторина, в которой каждый может проверить свои знания и скорость реакции и сразиться с оппонентами.\n```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
            if (eventName === 'Глобальный кризис') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠМировой кризис",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Мировой кризис»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Некая радикально настроенная террористическая группировка уничтожила ИИ отвечающий за распределение ресурсов, из за чего в мире начался хаос. Ты выступаешь в роли президента одной из страны, где спустя долгое время мировые лидеры решили собраться для обсуждения этой проблемы.```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
            if (eventName === 'Мировой кризис') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠМировое господство",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Мировое господство»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```В игре вы будете принимать решения внутри своих команд, а также выстраивать отношения с другими. Вы можете общаться, вступать в альянсы и плести интриги. Никто не мешает вам давать друг другу обещания, а потом нарушать их. Блефуйте и обманывайте, но помните, что это может сыграть с вами злую шутку.\n```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                
                ready = true
            }
            if (eventName === 'Правда или действие') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠПравда или действие",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Правда или действие»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Игра для двух и более игроков. Особенно популярна среди детей и подростков.\nИгроку, до которого дошёл ход, даётся выбор: правдиво ответить на вопрос, который ему будет задан, или выполнить какое-нибудь задание.```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                    "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
            if (eventName === 'Бункер') {
                eventText = [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠᅠБункер",
                    "description": "**Дорогие участники сервера, сегодня в** __`" + time(timestamp) + " по мск`__, **у нас проходит увлекательный ивент по игре** __`«Бункер»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Каждый игрок рандомно получает 8 характеристик и 2 карты действий. После старта игры, никто не знает твоих характеристик, также как и ты чужих, до тех пор пока игроки не откроют ту или иную характеристику. Постарайся максимально подробно описать свои характеристики, таким образом у тебя будет больше шансов убедить других игроков оставить именно тебя в игре.```\nᅠ",
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif"
                    }
                }]
                ready = true
            }
            if (eventName === 'Among Us') {
                eventText =  [{
                    "title": "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀Among Us",
                    "description": "Дорогие участники сервера, сегодня в ** __`" + time(timestamp) + " по мск`__, ** у нас проходит увлекательный ивент по игре «Among us»\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```\nAmong Us - это мультяшная аркада выполненная в двухмерном стиле, где игроки в количестве от 5 до 15 игроков должны попытаться подготовить свой космический корабль к вылету. Однако всё не так просто, как кажется, ведь несколько пользователей являются скрытыми убийцами. Фактически эта игра - аналог \"Мафии\", где для успешной подрывной деятельности игроки должны вводить своих оппонентов в заблуждение и делать всё возможное, чтобы одержать победу.\n```",
                    "color": 16711680,
                    "fields": [{
                        "name": "Награда за победу",
                        "value": "100 " + config.emoji,
                        "inline": true
                    },
                    {
                        "name": "Награда за участие",
                        "value": "50 " + config.emoji,
                        "inline": true
                    }]
                }]
                ready = true
            }
            if (eventName === 'Poker') {
                eventText =  [{
                    "title": "ᅠᅠᅠᅠᅠᅠᅠᅠᅠПокер",
                    "description": "Дорогие участники сервера, сегодня в ** __`" + time(timestamp) + " по мск`__, ** у нас проходит увлекательный ивент по игре __`«Покер»`__\n\n<:Line:1157746076904857660> Ведущий : <@" + author + ">\n\n```Карточная игра, цель которой собрать выигрышную комбинацию или вынудить всех соперников прекратить участвовать в игре.\nИгра идёт с полностью или частично закрытыми картами. Конкретные правила могут варьироваться в зависимости от разновидности покера.```",
                    "color": null,
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
                        "url": "https://media.discordapp.net/attachments/720080933046452307/1160603073157275799/0000.gif?ex=653542d7&is=6522cdd7&hm=b97ddbd2456f5aab1509e6cc76fe21000b9746d367bbc0f3473c86f708e999a1&=&width=375&height=150"
                    }
                }]
                ready = true
            }
        }
        let createEvent = async (Embed) => {
            if (DB.events[eventId].status == 'Отменён') {
                return
            }
            Embed.setDescription(`Ведущий: ${author}
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
                        id: config.roleEventBan,
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
            .then(channel => channelCШляпа = channel)
            .catch(err => console.log(err))
            await interaction.guild.channels.create({
                name: eventName,
                type: ChannelType.GuildVoice,
                parent: category.id
            })
            .catch(err => console.log(err))
            await author.user.send({
                content: `${author}, ивент создан`
            })
            .catch()
            for (let i = 0; i < members.length; i++) {
                await members[i].send({
                    content: `${members[i]}, приготовтесь, ивент ${eventName} начинается!`
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
                                label: 'Ивент Gartic Phone',
                                description: '',
                                value: 'Gartic Phone',
                            },
                            {
                                label: 'Ивент Шахматы',
                                description: '',
                                value: 'Шахматы',
                            },
                            {
                                label: 'Ивент Шпион',
                                description: '',
                                value: 'Шпион',
                            },
                            {
                                label: 'Ивент Шляпа',
                                description: '',
                                value: 'Шляпа',
                            },
                            {
                                label: 'Ивент Угадай мелодию',
                                description: '',
                                value: 'Угадай мелодию',
                            },
                            {
                                label: 'Ивент Своя игра',
                                description: '',
                                value: 'Своя игра',
                            },
                            {
                                label: 'Ивент Мировой кризис',
                                description: '',
                                value: 'Глобальный кризис',
                            },
                            {
                                label: 'Ивент Мировое господство',
                                description: '',
                                value: 'Мировой кризис',
                            },
                            {
                                label: 'Ивент Песня по тексту',
                                description: '',
                                value: 'Ппт',
                            },
                            {
                                label: 'Ивент Правда или действие',
                                description: '',
                                value: 'Правда или действие',
                            },
                            {
                                label: 'Ивент Намек понял',
                                description: '',
                                value: 'Намёк понял',
                            },
                            {
                                label: 'Ивент Монополия',
                                description: '',
                                value: 'Монополия',
                            },
                            {
                                label: 'Ивент Крокодил',
                                description: '',
                                value: 'Крокодил',
                            },
                            {
                                label: 'Ивент Коднеймс',
                                description: '',
                                value: 'Codenames',
                            },
                            {
                                label: 'Ивент Загадки',
                                description: '',
                                value: 'Загадки',
                            },
                            {
                                label: 'Ивент Джек Бокс',
                                description: '',
                                value: 'JackBox',
                            },
                            {
                                label: 'Ивент Бункер',
                                description: '',
                                value: 'Бункер',
                            },
                            {
                                label: 'Ивент Кто я',
                                description: '',
                                value: 'Кто я',
                            },
                            {
                                label: 'Ивент Among Us',
                                description: '',
                                value: 'Among Us',
                            },
                            {
                                label: 'Ивент Покер',
                                description: '',
                                value: 'Poker',
                            },
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
                            .setLabel('Сейчас')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonEventSendTime')
                            .setLabel('Потом')
                            .setStyle(2)
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonEventCancel')
                            .setLabel('Отмена')
                            .setStyle(4)
                    );
                Embed.setDescription(`Ведущий: ${author}
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
                    collector1.stop()
                    if (ButtonInteraction.customId === 'buttonEventCancel') {
                        await ButtonInteraction.deferUpdate()
                        Embed.setDescription(`Ведущий: ${author}
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
                            setEvent(new Date(timestampInput))
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
                            timeText = format(timestampInput)
                            if (timeEmbed > Date.now()) {
                                Embed.setDescription(`Ведущий: ${author}
Ивент: ${eventName}
Время: ${format(time)}
Статус: Запланирован`)
                                await interaction.editReply({
                                    embeds: [Embed],
                                    components: []
                                })
                                await wait(timeEmbed-Date.now())
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
[3] Время: ${format(timestampInput)}(${timestampInput})
[4] Статус: Отправлен вебхук`)
                                logs = await logChannel.send({
                                    embeds: [logEmbed],
                                })
                            }
                            DB.events[eventId].status = 'Отправлен вебхук'
                            Embed.setDescription(`Ведущий: ${author}
Ивент: ${eventName}
Время: ${format(time)}
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
                                if (DB.events[eventId]) {
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
                                createEvent(Embed)
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
	}
};