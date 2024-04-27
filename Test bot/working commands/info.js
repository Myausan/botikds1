const { SlashCommandBuilder , EmbedBuilder, Emoji} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Посмотреть больше информации о команде')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('Команда')
				.setRequired(true)
				.addChoices(
					{ name: 'deposit/withdraw', value: 'deposit/withdraw' },
					{ name: 'buyrole', value: 'buyrole' },
					{ name: 'cards', value: 'cards' },
					{ name: 'marry/divorce', value: 'marry/divorce' },
					{ name: 'roulette', value: 'roulette' },
					{ name: 'steal', value: 'steal' },
				)),
	async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member;
		const emoji = config.emoji;
		let command = interaction.options.getString('command');
		let description;
		if (lockedCommands.includes(interaction.commandName)) {
            const lockEmbed = new EmbedBuilder()
				.setTitle(`Информация о команде`)
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
		}
		try {
			if (command == 'deposit/withdraw') {
				description = `</deposit:1086675661483159605> - команда для перевода кристаллов ${emoji} в электрокристаллы ${emoji}, минимальная сумма перевода - 50${emoji}.

</withdraw:1086687512900157481> - команда для перевода электрокристаллов ${emoji} в кристаллы ${emoji}, минимальная сумма перевода - 50${emoji}.`
			} else if (command == 'buyrole') {
				description = `</buyrole:1096507415601631283> - команда с помощью которой вы можете сознать кастомную роль за 10000${emoji} на первые две недели**(продление НЕ автоматически - 5000${emoji} за каждые 2 недели)**. Параметры: name(название роли), hex(цвет в формате #XXXXXX).

</rolemanage:1096507415601631286> - команда с помощью которой вы можете: 
${config.emojis.dot} выставить/удалить роль на торговой площадке
${config.emojis.dot} задать/поменять ее стоимость
${config.emojis.dot} поменять иконку роли, цвет, название
${config.emojis.dot} продлить действие роли

Также, вы получаете 10% с каждой продажи вашей роли на торговой площадке.`
			} else if (command == 'cards') {
				description = `</cards:1109927174015823997> - команда для игры в 21 очко
Как играть?
<:msg:1109617428419321876> Смысл игры в том, что бы набрать 21 очко. Каждому человеку в начале игры раздаётся по одной карте, кто первый ходит **решает рандом**. 

<:players:1109615766610903112> Игроки, могут добрать карту, либо передать ход другому игроку. Выиграет тот игрок, у которого будет большее количество очков, **не превышающее 21**.

${config.emojis.dot} Карты: 

Карта «<:61:1100890556630044692>» – дает игроку 6 очков.
Карта «<:71:1100890564951547944>» – дает игроку 7 очков.
Карта «<:81:1100890572861997076>» – дает игроку 8 очков.
Карта «<:91:1100890606110265596>» – дает игроку 9 очков.
Карта «<:101:1100890617850122260>» – дает игроку 10 очков. 
Карта «<:j1:1100890669725253793>» – дает игроку 2 очка.
Карта «<:q1:1100890728508424212>» – дает игроку 3 очка.
Карта «<:k1:1100890721021603952>» – дает игроку 4 очка.
Карта «<:a1:1100890661147918448>» – дает игроку 11 очков.`
			} else if (command == 'marry/divorce') {
				description = `</marry:1109927174015824002> - команда с помощью которой вы можете пожениться или выйти замуж ${emoji}, стоимость - 5000${emoji} для предложения и первых двух недель, **дальнейшее продление - 2500${emoji}**. Если вовремя не заплатить, то брак автоматически расторгается и love рума удаляется.

</divorce:1109927174015823999> - команда для расторжение брака раньше срока(остаток баланса пары аннулируется и не возвращается на счета)

</loveprofile:1109927174015824001> - команда для вывода вашего love профиля, статистики и баланса пары, а также для покупки разных тем для love профилей.`
			} else if (command == 'roulette') {
				description = `/roulette - минимальная ставка для участия - 100${emoji}, комиссия с выигрыша - **4%**. Ход игры: после использования команды вам нужно дождаться пока другой юзер примет ваш вызов, после чего вы поочередно выбираете по одной цифре из 6**(одну на двоих выбрать нельзя)**, тот чей номер выпадает - проигрывает, а ставка уходит к выигравшему юзеру.`
			} else if (command == 'steal') {
				description = `</steal:1088963316422037540> - команда с помощью которой вы можете попытаться обокрасть другого человека, с разным шансом вы можете как удачно обокрасть другого пользователя и получить часть от той суммы кристаллов ${emoji} что у него есть, так и неудачно и попасть в тюрьму.`
			}
			const embed = new EmbedBuilder()
				.setTitle(`Информация о команде`)
				.setThumbnail(author.user.displayAvatarURL())
				.setDescription(description)
				.setColor(config.color);
			await interaction.reply({
				embeds: [embed]
			})
		} catch(err) {
			if (!err.startsWith('Error [InteractionNotReplied]: The reply to this interaction has not been sent or deferred.')) {
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








//старая параша на sql2

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