const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeblock')
		.setDescription('Убрать пользователя из чёрного списка')
        .addUserOption( option => 
            option.setName('member')
            .setDescription('пользователь')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const member = interaction.options.getUser('member');
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logProtection}`)
        let sqlResult
        let now = Date.now()
        if (author.id !== config.owner_id && author.id !== '394415407634710529' && author.id !== '455817057565540365') {
            await interaction.reply({
                content: `${author}, ты щас пизды получишь! Не тройгай эту команду`,
                ephemeral: true
            }) 
            console.log(`ROOT: ${author.username} tried to use commands remblock`)
            return
        }
        try {
            await connection
				.query(`SELECT * FROM protection WHERE id = ${member.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
            .then((result) => sqlResult = result)
            .catch(async (err) => {
                console.log(`SQL: Error ${err}`)
                const lockEmbed = new EmbedBuilder()
                    .setTitle("Убрать пользователя из чёрного списка")
                    .setDescription(`${author}, нет связи с базы данных`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: lockEmbed,
                    ephemeral: true
                }) 
                return
            })
            if (sqlResult[0] == undefined || sqlResult[0].block == 0) {
                const lockEmbed = new EmbedBuilder()
                    .setTitle("Убрать пользователя из чёрного списка")
                    .setDescription(`${author}, администратор ${member} не в чёрном списке`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [lockEmbed],
                    ephemeral: true
                }) 
                return
            }
            DB.blacklistedUsers.splice(DB.blacklistedUsers.indexOf(member.id), 1)
            await connection
				.query(`DELETE FROM protection WHERE id = ${member.id};`, {
					type: QueryTypes.DELETE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
				})
            const lockEmbed = new EmbedBuilder()
                .setTitle("Убрать пользователя из чёрного списка")
                .setDescription(`${author}, вы убрали администратора из чёрного списка`)
                .setColor(config.color);
            interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            })
            const LogEmbed = new EmbedBuilder()
                .setTitle("**Remove from blacklist**")
                .setColor("#00ff00")
                .setDescription(`[1] ${author}(${author.id})\n[2] ${member}(${member.id})\n [3] Remove from blacklist`)
                .setFooter({text: `${member.id} • ${interaction.guild.name}`})
                .setTimestamp();
            await logChannel.send({
                embeds: [LogEmbed]
            })
            return
        } catch(err) {
            if (err.code != 'InteractionNotReplied') {
				lockedCommands.push(interaction.commandName)
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