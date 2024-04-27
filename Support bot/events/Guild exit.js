const { Events, ActivityType} = require('discord.js');
const { QueryTypes } = require('sequelize');

module.exports = {
	name: Events.GuildMemberRemove,
	    async execute(member, connection) {
            const channel = await member.guild.channels.fetch('722604852114358384');
            await channel.send(`${member} вышел с сервера`)
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
