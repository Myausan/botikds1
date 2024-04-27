const { SlashCommandBuilder , EmbedBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('купить роль')
		.addIntegerOption(option => 
			option.setName('role')
			.setDescription('роль')
			.setRequired(true)),
	async execute(interaction, connection) {
		const author = interaction.member;
        const roleNumber = interaction.options.getInteger('role');
        const emoji = config.emoji;
        const rolesList = [];
        const rolesCost = [];
		let balance = 0;
		let baneconomy = 0;
        try {
            const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logCasino}`)
            const role = author.guild.roles.cache.get(rolesList[roleNumber]);
            await connection
                .query(`SELECT money, bank, baneconomy FROM money WHERE id = ${author.id}`, {
                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
                .then((result) => sqlResult = result)
            if (sqlResult[0] === undefined) {
                await connection
                .query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
                    type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            } else {
                balance = sqlResult[0].money;
                baneconomy = sqlResult[0].baneconomy
            }

            if (baneconomy == 1) {
                const banEmbed = new EmbedBuilder()
                    .setDescription(`${author}, вы не можете использовать эту команду, вам выдан бан экономики, длительность: Навсегда`)
                    .setColor(config.colorError);
                await interaction.reply({
                    embeds: [banEmbed],
                    ephemeral: true
                }) 
                return
            }

            if (roleNumber < 1 || roleNumber > rolesList.length) {
                const errorEmbed = new EmbedBuilder()
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author},  вы указали слишком мальнькое значение, минимальное: 1`)
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            if (balance < rolesCost[roleNumber]) {
                const errorEmbed = new EmbedBuilder()
                    .setThumbnail(author.user.displayAvatarURL())
                    .setColor(config.colorError)
                    .setDescription(`${author},  у вас недостаточно средств\n\n\\Ваш баланс: ${balance} ${emoji}`)
                await interaction.reply({
                    embeds: [errorEmbed]
                })
                return
            }
            for (let i = 0; i<author.roles.length; i++){
                if (author.roles[i].id == rolesList[roleNumber]) {
                    const errorEmbed = new EmbedBuilder()
                        .setThumbnail(author.user.displayAvatarURL())
                        .setColor(config.colorError)
                        .setDescription(`${author}, у вас уже есть эта роль`)
                    await interaction.reply({
                        embeds: [errorEmbed]
                    })
                    return
                }
            }

            await connection
                .query(`UPDATE money SET money = money-${rolesCost[roleNumber]} WHERE id = ${author.id};`, {
                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                })
            author.roles.add(role, 'role buy')
            const embed = new EmbedBuilder()
                .setThumbnail(author.user.displayAvatarURL())
                .setDescription(`${author}, вы успешно купили роль ${role}\n\n\\Ваш новый баланс: ${balance-costs[roleNumber]}`)
                .setColor(0x00ff00);
            await interaction.reply({
                embeds: [embed]
            })
            const logEmbed = new EmbedBuilder()
                .setTitle("Buy")
                .setDescription(`[1] ${author}(${author.id})\n[2] buy\n[3] ${role}(${role.id})\n[4] Цена: ${rolesCost[roleNumber]}${emoji}\n[5] Старый баланс: ${balance}${emoji} \n[6] Новый баланс: ${balance-rolesCost[roleNumber]}${emoji}`)
                .setColor('#00ff00')
                .setFooter({text: `${author.id} • ${author.guild.name}`})
                .setTimestamp()
            await logChannel.send({
                embeds: [logEmbed]
            })
        } catch {
            console.log("Command: buy" , err)
        }
	}
};