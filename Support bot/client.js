const {IntentsBitField, Partials, Client, Collection, Events, GatewayIntentBits, MessageCollector, ButtonBuilder, AuditLogEvent, Webhook} = require('discord.js');
const config = require('./config.json');
const { channel } = require('node:diagnostics_channel');
const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize')
const DiscordDB = require('simple-discord.db'); //Память
const interactionCreate = require('./events/interactionCreate');
const wait = require('node:timers/promises');

config.cfg = {
    ...config.cfg,
    intents: new IntentsBitField(config.cfg.intents),
    partials: [Partials.Channel]
};

const connection = new Sequelize(
    'empire',
    'bot',
    'vampeare',
    {
      dialect: 'mysql',
      logging: false
    }
  )

connection
  .authenticate()
  .then(() => console.log('SQL: connection is established'))
  .catch((err) => console.error('SQL: Connection error: ', err))

/*const connection = mysql.createConnection({
    host: "localhost",
    user: "bot",
    database: "empire",
    password: "---",
})*/

/*connection.connect((err) =>{
    if(err){
        console.log("SQL: ERROR occurred", err);
    } else {
        console.log("SQL: Connection is enstabiled!");
    }
})*/

const client = new Client(config.cfg);
client.login(config.token);
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
let lockedCommands = [];

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, connection, client, lockedCommands));
	} else {
		client.on(event.name, (...args) => event.execute(...args, connection, client, lockedCommands));
	}
}

client.Memory = new DiscordDB("Memory", client); //Памятная память
client.Memory.save();
//require('./handlers')(client); //Запуск handler'ов
//require('./events')(client); //Запуск ивентов


/*client.on('interactionCreate', async interaction => {
    console.log("hi");
    if (interaction.commandName == "money"){
        console.log("hi");
        await interaction.deferReply();
        await wait(4000);
		await interaction.editReply('Pong!');
        connection.execute("SELECT money FROM money WHERE id = 432199748699684864",
            function(err, results, fields) {
                console.log(err);
                console.log(results); // собственно данные
                console.log(fields); // мета-данные полей 
            });
    }
})*/

/*// `m` is a message object that will be passed through the filter function
const filter = m => m.content.includes('discord');
const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

collector.on('collect', m => {                                                                           коллекторы, buttons, messages etc...
	console.log(`Collected ${m.content}`);
});

collector.on('end', collected => {
	console.log(`Collected ${collected.size} items`);
});*/

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
    
	try {
		await command.execute(interaction, connection, lockedCommands);
	} catch (error) {
		console.error(`command: ${interaction.commandName}`, error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'При выполнении этой команды произошла ошибка!', ephemeral: true });
		}
	}
});

client.on('warn', console.log)

//automatic guild anti-crash system
//automatic economy protection system
//automatic bot control system


/*
for (var [key, value] of oldMember.roles.cache) {
	if (!newMember.roles.cache.has(key)) {
		rolesList.push(`<@&${key}>`)
	}
}
*/


//interaction.deferUpdate() - подождать больше 3 секунд и ответить на кнопку

//member.roles.cache.has('role-id-here');
// returns true if the member has the role

//guild.roles.everyone.setPermissions([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]);

//channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });

// edits overwrites to disallow everyone to view the channel
//channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });

//channel.lockPermissions() - синхронизировать с категорией

//const rolePermissions = role.permissions.toArray();
// output: ['SendMessages', 'AddReactions', 'ChangeNickname', ...]


//----------------------------------------------------------старая параша на sql2

//console.log(results); 
		/*console.log("1");
		connection.execute(`SELECT money, bank FROM money WHERE id = ${member.id}`,
        function(err, results, fields) {
			console.log(results);
			console.log(String(results).startsWith("money", 4));
			if (String(results).startsWith("money", 4) == false) {
				console.log("2");
				connection.execute(`INSERT INTO money (id, money) VALUES (${member.id}, 0);`,
            		function(err, results, fields) {
						console.log(err);
					});
					console.log("3", results);
			} else {
				console.log("here")
				money = results[0].money;
				bank = results[0].bank;
			}
		});*/

/*const modal = new ModalBuilder()
                    .setCustomId('modalManageRoleEditName')
                    .setTitle('Изменение названия роли');
                const RoleNameInput = new TextInputBuilder()
                    .setCustomId('modalManageRoleEditNameInput')
                    .setLabel('Введите новое название роли')
                    .setPlaceholder('Крутая роль!')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                const firstActionRow = new ActionRowBuilder().addComponents(RoleNameInput)
                modal.addComponents(firstActionRow)
                await ButtonInteraction.showModal(modal);*/