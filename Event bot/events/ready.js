const { Events, ActivityType} = require('discord.js');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');

module.exports = {
	name: Events.ClientReady,
	once: true,
	    async execute(client, connection, client1, DB) {
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
            console.log(`[${time}] Bot is ready!`);
            client.user.setActivity('в мафию', { type: ActivityType.Playing });
            let sqlResult
            await connection
                .query(`SELECT eventid FROM settings WHERE id = ${config.client_id};`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            .then((result) => sqlResult = result)
            DB.settings.events = sqlResult[0].eventid
            //console.log(client)
            //client.user.setActivity('act', { type: ActivityType.Watching });
        }
};

    /*const commandsIT = client.application.commands;
    let test = await commandsIT.fetch(); //Найти все команды
    let command;

    for (command of test) {
        if(command.interaction) { //Если слэш команда есть
            const interaction = await commandsIT.cache.find(com=>com.name == command.interaction.name); //Найти команду в боте по названию
            console.log("test");
            console.log(interaction);
            if(!interaction) { //Если команда не была найдена в боте
                commandsIT.create(command.interaction); //Создать команду
                console.log("create");
            } else  //Если команда есть
            if(JSON.stringify(interaction.options) !== JSON.stringify(command.interaction.options)) {//И параметры команды не совпадают (т.е. команда была изменена)
                interaction.edit(command.interaction); //Редактируем эту команду
                console.log("edit");
            }
        }
    }
    for (const interaction of test) {
        const command = client.commands.any.find(el=>el.names.includes(interaction.name));
        if(!command&&interaction.delete) interaction.delete();//Если команды нет и есть возможность - удалить слэш команду
    }
    for (const command of client.commands.any) {
        if(!command.interaction) { //Если слэш команда есть
            const interaction = await commandsIT.cache.find(com=>com.name == command.interaction.name); //Найти команду в боте по названию
            if(interaction) { //Если команда не была найдена в боте
                commandsIT.delete(command.interaction); //Создать команду
            }
        }
    }*/
