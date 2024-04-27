const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createembed')
		.setDescription('Отправить вебхук')
		.addStringOption(option =>
			option.setName('event')
				.setDescription('Ивент')
				.setRequired(true)
				.addChoices(
					{ name: 'Мафия', value: 'mafia' },
					{ name: 'Шляпа', value: 'alias' },
					{ name: 'Коднеймс', value: 'codenames' },
				))
		.addStringOption(option =>
			option.setName('time')
				.setDescription('Время проведения ивента')
				.setRequired(true)),
    async execute(interaction, connection, lockedCommands) {
        const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const emoji = config.emoji;
		const event = interaction.options.getString('event');
		const time = interaction.options.getString('time');
        let commandCooldown = 0;
        let currentTimestamp = Date.now();
        let sqlResult;
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
                .setTitle("Создание вебхука")
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
		}
        try {
			await connection
                .query(`SELECT timestamp_embed FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
                .catch((err) => {
                    console.log(`SQL: Error ${err}`)
                    const lockEmbed = new EmbedBuilder()
                        .setTitle("Создание вебхука")
                        .setDescription(`${author}, Команда временно заблокирована`)
                        .setColor(config.colorError);
                    interaction.reply({
                        embeds: [lockEmbed],
                        ephemeral: true
                    }) 
                    return
                })
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id) VALUES (${author.id});`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                commandCooldown = sqlResult[0].timestamp;
            }
            if (commandCooldown + 30 * 60 * 1000 > currentTimestamp) {
                let time = commandCooldown + 30 * 60 * 1000 - currentTimestamp
                let sec = Math.floor(time/1000%60);
                let min = Math.floor(time/1000/60%60);
                let hours = Math.floor(time/1000/60/60%24);
                let result = `${hours}h ${min}m ${sec}s`;
                const cooldownEmbed = new EmbedBuilder()
                    .setTitle("Ежедневная награда")
                    .setThumbnail(author.user.displayAvatarURL())
                    .setDescription(`${author}, использовать createembed можно раз в 30 минут\n\n\\Вы cможете использовать ещё раз через ${result}`)
                    .setColor(config.colorError)
                interaction.reply({
                    embeds: [cooldownEmbed]
                })
                return
            }
		} catch(err) {
			console.log(balance)
		}
	}
};