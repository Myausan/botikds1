const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const Canvas = require('canvas')
const { Image, loadImage, FontFace } = require('canvas')
const axios = require('axios')
const sharp = require('sharp')
const opentype = require('opentype.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('посмотреть профиль'),
	async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member;
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembersEconomy}`)
		//const x = interaction.options.getInteger('x');
		//const y = interaction.options.getInteger('y');
		//const font = interaction.options.getString('font');
		let balance = 0;
		let bank = 0;
		let jailtime = 0;
		let position = 0;
		let baneconomy = 0;
		let messages = 0;
		let voice_online = 0;
		let ghost = 0;
		let UserStatus = 'Не установлен';
		let partner1Id = null;
		let partner2Id = null;
		let love_background = null;
		let love_money = null;
		let love_time = null;
		let love_create = null;
		let sqlResult;
		let message;
		let page = 0;
        let maxPage = 1;
        let id;
		let profile
		let profiles = ['Night sky']
		let status;
		let currentProfile
		let prices = [
            [0, 1000, 2500, 3000],
            [5000, 7500, 10000, 25000]
        ]
		let now = Date.now()
		if (lockedCommands.includes(interaction.commandName)) {
			if (!author.user.username) return
            const lockEmbed = new EmbedBuilder()
				.setTitle(`Профиль   ${author.user.username}`)
                .setDescription(`${author}, Команда временно заблокирована`)
                .setColor(config.colorError);
            await interaction.reply({
                embeds: [lockEmbed],
                ephemeral: true
            }) 
            return
		}
		let online = (time) => {
			return `${Math.floor(time/60)}ч ${time%60}м`
		}
		let top = () => {
			if (position > 1000) {
				return "999+"
			}
			return position
		}
		let setDisabledImage = (number) => {
			if (number >= profiles.length || profiles[number] == profile) {
				return true
			}
			return false
		}
		try {
			await connection
				.query(`SELECT money.money, money.bank, money.profile, money.baneconomy, money.ghost, money.jailtime, money.messages, money.voice_online, marry.partner, marry.partner1, marry.love_background, marry.love_money, marry.love_time, marry.love_create, marry.love_online FROM money LEFT JOIN marry ON money.id = marry.partner OR money.id = marry.partner1 WHERE money.id = ${author.id}`, {
					type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
			})
				.then((result) => {
					sqlResult = result
				})
				.catch((err) => {
					console.log(`SQL: Error ${err}`)
					const lockEmbed = new EmbedBuilder()
						.setTitle(`Профиль   ${author.user.username}`)
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
					.query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
						type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
			} else {
				balance = sqlResult[0].money;
				bank = sqlResult[0].bank;
				profile = sqlResult[0].profile
				jailtime = sqlResult[0].jailtime;
				ghost = sqlResult[0].ghost;
				baneconomy = sqlResult[0].baneconomy;
				messages = sqlResult[0].messages;
				voice_online = sqlResult[0].voice_online;
				UserStatus = sqlResult[0].status;
				partner1Id = sqlResult[0].partner;
				partner2Id = sqlResult[0].partner1;
				love_background = sqlResult[0].love_background;
				love_online = sqlResult[0].love_online;
				love_money = sqlResult[0].love_money;
				love_time = sqlResult[0].love_time;
				love_create = sqlResult[0].love_create;
			}
			status = 'start'
			let partner = async () => {
				if(!partner1Id) {
					return "Отсутствует"
				}
				if (author.id === partner1Id) {
					let partner = await interaction.guild.members.fetch(partner2Id)
					return partner.user.username
				}
				let partner = await interaction.guild.members.fetch(partner1Id)
				return partner.user.username
			}
			let partnerAva = async () => {
				if(!partner1Id) {
					return "Отсутствует"
				}
				if (author.id === partner1Id) {
					let partner = await interaction.guild.members.fetch(partner2Id)
					return partner.displayAvatarURL()
				}
				let partner = await interaction.guild.members.fetch(partner1Id)
				return partner.displayAvatarURL()
			}
			let username = (member) => {
				return member.user.username
			}
			let lockMarryProfile = (partner1Id) => {
				if (partner1Id == null) {
					return true
				} else {
					return false
				}
			}
			let lockJail = () => {
				if (jailtime < now) {
					return false
				} else {
					return true
				}
			}
			let lockBuy = (number) => {
				if (love_background == number) {
					return true
				} else {
					return false
				}
			}
			let lockLeft = () => {
				if (page == 0) {
					return true
				} else {
					return false
				}
			}
			let lockRight = () => {
				if (page == maxPage) {
					return true
				} else {
					return false
				}
			}
			let profilesText = (page) => {
				let text = `[${page*5+1}] ${profiles[page*5]} (${rare(profiles[page*5])})\n`;
				for (let i = page*5+1; i < page*5+5; i++) {
					if (profiles[i]) {
						text+=`[${i+1}] ${profiles[i]} (${rare(profiles[i])})\n`;
					} else {
						return text
					}
				}
				return text
			}
			let rare = (name) => {
				let profiles = config.profiles
				for (let i = 0; i < profiles.common.length; i++) {
					if (profiles.common[i].name == name) return "Обычный"
				}
				for (let i = 0; i < profiles.rare.length; i++) {
					if (profiles.rare[i].name == name) return "Редкий"
				}
				for (let i = 0; i < profiles.epic.length; i++) {
					if (profiles.epic[i].name == name) return "Эпический"
				}
				for (let i = 0; i < profiles.legendary.length; i++) {
					if (profiles.legendary[i].name == name) return "Легендарный"
				}
				for (let i = 0; i < profiles.mythical.length; i++) {
					if (profiles.mythical[i].name == name) return "Мифический"
				}
				return "Обычный"
			}
			let two = n => (n > 9 ? "" : "0") + n;
			let format = now =>
				two(now.getHours()) + ":" +
				two(now.getMinutes()) + ":" +
				two(now.getSeconds()) + " " +
				two(now.getDate()) + "." +
				two(now.getMonth() + 1) + "." +
				now.getFullYear()
			let now1 = new Date(love_create);
			let formatTime = (time) => {
				let m = Math.floor(time/1000/60%60);
				let h = Math.floor(time/1000/60/60%24);
				let d = Math.floor(time/1000/60/60/24);
				let result = '';
				if ((d % 10 == 1) && d != 11) {
					result += `${d} день `
				} else {
					if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
						result += `${d} дня `
					} else {
						result += `${d} дней `
					}
				}
				if ((h % 10 == 1) && h != 11) {
					result += `${h} час `
				} else {
					if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
						result += `${h} часа `
					} else {
						result += `${h} часов `
					}
				}
				if ((m % 10 == 1) && m != 11) {
					result += `${m} минута`
				} else {
					if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
						result += `${m} минуты`
					} else {
						result += `${m} минут`
					}
				}
				return result
			}
			let formatTimems = (time) => {
				let m = Math.floor(time%60);
				let h = Math.floor(time/60%24);
				let d = Math.floor(time/60/24);
				let result = '';
				if ((d % 10 == 1) && d != 11) {
					result += `${d} день `
				} else {
					if ((d % 10 == 2 || d % 10 == 3 || d % 10 == 4) && d != 12 && d != 13 && d != 14) {
						result += `${d} дня `
					} else {
						result += `${d} дней `
					}
				}
				if ((h % 10 == 1) && h != 11) {
					result += `${h} час `
				} else {
					if ((h % 10 == 2 || h % 10 == 3 || h % 10 == 4) && h != 12 && h != 13 && h != 14) {
						result += `${h} часа `
					} else {
						result += `${h} часов `
					}
				}
				if ((m % 10 == 1) && m != 11) {
					result += `${m} минута`
				} else {
					if ((m % 10 == 2 || m % 10 == 3 || m % 10 == 4) && m != 12 && m != 13 && m != 14) {
						result += `${m} минуты`
					} else {
						result += `${m} минут`
					}
				}
				return result
			}
			let resultVoiceOnline = formatTimems(voice_online)
			const rowStart1 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonProfileBuyCoins')
						.setLabel('Донат-магазин')
						.setEmoji(config.emojis.buymoney)
						.setDisabled(true)
						.setStyle(3)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonProfileInventory')
						.setLabel('Инвентарь')
						.setEmoji(config.emojis.inventory)
						.setDisabled(true)
						.setStyle(2)
				)
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonProfileEditImage')
						.setLabel('Изменить фон')
						.setEmoji(config.emojis.editName)
						.setStyle(2)
				)
			const rowStart2 = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonProfileToMarryProfile')
						.setLabel('Открыть любовный профиль')
						.setEmoji(config.emojis.loveCreate)
						.setDisabled(lockMarryProfile(partner1Id))
						.setStyle(2)
				)
			const rowMarryProfile = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('replenishAccountMarryProfile')
						.setLabel('Пополнить счёт')
						.setEmoji(config.emojis.replenishBalance)
						.setDisabled(lockJail())
						.setStyle(2),
				)
				.addComponents(
					new ButtonBuilder()
					.setCustomId('butttonMarryProfileEditProfile')
						.setLabel('Кастомизация профиля')
						.setEmoji(config.emojis.editLoveProfile)
						.setDisabled(lockJail())
						.setStyle(2),
				)
			const rowReturn = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
						.setCustomId('buttonProfileReturn')
						.setLabel('назад')
						.setEmoji(config.emojis.return)
						.setStyle(1),
				)

			await connection
            .query(`SELECT COUNT(id) as count FROM money WHERE bank>${bank};`, {
                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            position = sqlResult[0].count + 1;
			const canvasava1 = Canvas.createCanvas(200, 200);
			const ctxava1 = canvasava1.getContext('2d');
			const canvas = Canvas.createCanvas(1040, 579);
			const ctx = canvas.getContext('2d');
			//interaction.deferReply()
			/*ctx.beginPath();
			ctx.arc( 75, 75, 10, 0, Math.pi*2, true);
			ctx.clip();*/
			let loadImg = () => {
				if (profile) return `profile\\${profile}.png`
				return `profile/Night sky.png`
			}
			const background = await Canvas.loadImage(loadImg())
			const round = await Canvas.loadImage('images/round.png')
			let member1 = await interaction.guild.members.fetch(author.id)
			let imageResponse = await axios.get(member1.displayAvatarURL(), {
				responseType: 'arraybuffer',
			});
			let img = await sharp(imageResponse.data).toFormat('png').toBuffer()
			let avatar1 = await loadImage(img)
			ctxava1.fillStyle = '#fff'
			ctxava1.fillRect(0, 0, 100, 100)
			ctxava1.globalCompositeOperation = 'source-in'
			ctxava1.drawImage(round, 0, 0, 100, 100)
			ctxava1.drawImage(avatar1, 0, 0, 100, 100)
			ctxava1.globalCompositeOperation = 'source-over';
			ctx.font = `30px Gogono Cocoa Mochi Cyrillic`;
			ctx.drawImage(background, 0, 0);
			ctx.textAlign = "center";
			ctx.drawImage(canvasava1, 375.5, 120, 575, 575);
			ctx.fillText(`${author.user.username}`, 521, 498.5)
			ctx.font = `20px Gogono Cocoa Mochi Cyrillic`;
			/*function drawRoundedProgressBar(ctx, x, y, maxWidth, percentage) {
				const barHeight = 20;
				const borderRadius = 10;
				const barWidth = (maxWidth - 2 * borderRadius) * (percentage / 100);
				ctx.beginPath();
				ctx.moveTo(x + borderRadius, y);
				ctx.lineTo(x + maxWidth - borderRadius, y);
				ctx.arcTo(x + maxWidth, y, x + maxWidth, y + borderRadius, borderRadius);
				ctx.lineTo(x + maxWidth, y + barHeight - borderRadius);
				ctx.arcTo(x + maxWidth, y + barHeight, x + maxWidth - borderRadius, y + barHeight, borderRadius);
				ctx.lineTo(x + borderRadius + barWidth, y + barHeight);
				ctx.arcTo(x, y + barHeight, x, y + barHeight - borderRadius, borderRadius);
				ctx.lineTo(x, y + borderRadius);
				ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
				ctx.closePath();
				ctx.fillStyle = 'rgba(255, 0, 0, 0.0)'; // Цвет заливки (синий с прозрачностью)
				ctx.fill();
				ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Цвет контура (черный)
				ctx.lineWidth = 4;
				ctx.stroke();
			}
			
			// Замените значения аргументов на необходимые вам
			function drawRoundedProgressBar1(ctx, x, y, maxWidth, percentage) {
				// Размеры прогресс бара
				const barHeight = 20;
				const borderRadius = 10;
			  
				// Вычисляем ширину прогресса
				const barWidth = (maxWidth - 2 * borderRadius) * (percentage / 100);
			  
				// Начинаем рисовать прогресс бар
				ctx.beginPath();
			  
				// Верхний левый угол
				ctx.moveTo(x + borderRadius, y);
			  
				// Верхняя линия
				ctx.lineTo(x + maxWidth - borderRadius, y);
			  
				// Верхний правый угол
				ctx.arcTo(x + maxWidth, y, x + maxWidth, y + borderRadius, borderRadius);
			  
				// Правая линия
				ctx.lineTo(x + maxWidth, y + barHeight - borderRadius);
			  
				// Нижний правый угол
				ctx.arcTo(x + maxWidth, y + barHeight, x + maxWidth - borderRadius, y + barHeight, borderRadius);
			  
				// Нижняя линия
				ctx.lineTo(x + borderRadius + barWidth, y + barHeight);
			  
				// Нижний левый угол
				ctx.arcTo(x, y + barHeight, x, y + barHeight - borderRadius, borderRadius);
			  
				// Левая линия
				ctx.lineTo(x, y + borderRadius);
			  
				// Верхний левый угол
				ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
			  
				// Заканчиваем рисовать
				ctx.closePath();
			  
				// Заливаем прогресс
				ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Цвет заливки (синий с прозрачностью)
				ctx.fill();
			  }
			*/
			// Замените значения аргументов на необходимые вам
			//drawRoundedProgressBar1(ctx, 50, 50, 200, 10); // Пример: 50% заполнения
			//drawRoundedProgressBar(ctx, 50, 50, 300, 10); // Пример: 50% заполнения
			ctx.fillStyle = '#000000'
			ctx.textAlign = "right";
			ctx.fillText('Пара:', 202, 431)
			ctx.fillText(await partner(), 273, 471)
			ctx.fillText('Клан:', 908, 431)
			ctx.fillText('Отсутствует', 978, 471)
			ctx.font = '17px Gogono Cocoa Mochi Cyrillic'
			ctx.fillText(`${balance}`, 273, 215)
			ctx.fillText(`${bank}`, 273, 290)
			ctx.fillText(`${0}`, 273, 361)
			ctx.fillText(top(), 978, 215)
			ctx.fillText(online(voice_online), 978, 290)
			ctx.fillText(`${messages}`, 978, 361)
			/*const StartEmbed = new EmbedBuilder()
				.setTitle(`Профиль   ${author.displayName}`)
				.addFields(
					{name: `${config.emojis.editName} Статус:`, value: `\`\`\`${UserStatus}\`\`\``, inline: false},
					{name: `${config.emoji} Койны:`, value: `\`\`\`${balance}\`\`\``, inline: true},
					{name: `${config.emojianim} Биткойны:`, value: `\`\`\`${bank}\`\`\``, inline: true},
					{name: `${config.emojis.pentrial} Пентриалы:`, value: `\`\`\`0\`\`\``, inline: true},
					{name: `${config.emojis.voiceUnmute} Голосовой онлайн:`, value: `\`\`\`${resultVoiceOnline}\`\`\``, inline: true},
					{name: `${config.emojis.txtUnmute} Сообщений:`, value: `\`\`\`${messages}\`\`\``, inline: true},
				)
				.setImage('attachment://test.png')
				.setColor(config.color);*/
			await interaction.reply({
				//embeds: [StartEmbed],
				components: [rowStart1, rowStart2],
				files: [
                    {
                        attachment: canvas.toBuffer(), name: 'test.png', description: 'desc'
                    }
                ]
			})
			.then ((send) => {
				message = send
			})

			const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonProfileBuyCoins' || ButtonInteraction.customId === 'buttonProfileInventory' || ButtonInteraction.customId === 'buttonProfileEditImage' || ButtonInteraction.customId === 'buttonProfileToMarryProfile' || ButtonInteraction.customId === 'replenishAccountMarryProfile' || ButtonInteraction.customId === 'butttonMarryProfileEditProfile' || ButtonInteraction.customId === 'buttonProfileReturn';

			const collector = message.createMessageComponentCollector({ filter, time: 60000 });

			collector.on('collect', async ButtonInteraction => {
				if (ButtonInteraction.user.id != author.id) {
					const errorEmbed = new EmbedBuilder()
						.setTitle('Меню управления ролями')
						.setThumbnail(ButtonInteraction.user.displayAvatarURL())
						.setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
						.setColor(config.colorError);
					await ButtonInteraction.reply({
						embeds: [errorEmbed],
						ephemeral: true
					})
					return
				}
				let buttonId = ButtonInteraction.customId
				collector.resetTimer()
				if (buttonId === 'buttonProfileBuyCoins') {

				}
				if (buttonId === 'buttonProfileInventory') {
					
				}
				if (buttonId === 'buttonProfileEditImage') {
					await ButtonInteraction.deferUpdate()
					status = 'editImage'
					await connection
						.query(`SELECT * FROM profiles WHERE id = ${author.id}`, {
							type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					.then((result) => sqlResult = result)
					for (let i = 0; i < sqlResult.length;i++) {
						profiles.push(sqlResult[i].profile);
					}
					profiles.sort();
					maxPage = Math.floor(profiles.length/5)
					const rowImage1 = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonProfileSelect0`)
								.setLabel('1')
								.setDisabled(setDisabledImage(page*5))
								.setStyle(3)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonProfileSelect1`)
								.setLabel('2')
								.setDisabled(setDisabledImage(page*5+1))
								.setStyle(3)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonProfileSelect2`)
								.setLabel('3')
								.setDisabled(setDisabledImage(page*5+2))
								.setStyle(3)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonProfileSelect3`)
								.setLabel('4')
								.setDisabled(setDisabledImage(page*5+3))
								.setStyle(3)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonProfileSelect4`)
								.setLabel('5')
								.setDisabled(setDisabledImage(page*5+4))
								.setStyle(3)
						)
					const rowArrows = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileLeft')
								.setEmoji(`${config.emojis.left}`)
								.setStyle(2)
								.setDisabled(lockLeft())
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileRight')
								.setEmoji(`${config.emojis.right}`)
								.setStyle(2)
								.setDisabled(lockRight())
						)
					const ImageEmbed = new EmbedBuilder()
						.setTitle(`Изменить фон профиля`)
						.setDescription(profilesText(page))
						.setColor(config.color);
					await interaction.editReply({
						embeds: [ImageEmbed],
						components: [rowImage1, rowArrows],
						files: []
					})
					const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonProfileSelect0' || ButtonInteraction.customId === 'buttonProfileSelect1' || ButtonInteraction.customId === 'buttonProfileSelect2' || ButtonInteraction.customId === 'buttonProfileSelect3' || ButtonInteraction.customId === 'buttonProfileSelect4' || ButtonInteraction.customId === 'buttonProfileLeft' || ButtonInteraction.customId === 'buttonProfileRight';

					const collector = message.createMessageComponentCollector({ filter, time: 60000 });

					collector.on('collect', async ButtonInteraction => {
						if (ButtonInteraction.user.id != author.id) {
							const errorEmbed = new EmbedBuilder()
								.setTitle('Меню управления ролями')
								.setThumbnail(ButtonInteraction.user.displayAvatarURL())
								.setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`)
								.setColor(config.colorError);
							await ButtonInteraction.reply({
								embeds: [errorEmbed],
								ephemeral: true
							})
							return
						}
						let buttonId = ButtonInteraction.customId
						collector.resetTimer()
						await ButtonInteraction.deferUpdate()
						if (buttonId.includes('buttonProfileSelect')) {
							status = 'end'
							await connection
								.query(`UPDATE money SET profile = '${profiles[page*5+parseInt(buttonId.replace('buttonProfileSelect', ''))]}' WHERE id = ${author.id}`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
							ImageEmbed.setDescription(`${author}, вы успешно изменили профиль на **${profiles[page*5+parseInt(buttonId.replace('buttonProfileSelect', ''))]}**`)
							await interaction.editReply({
								embeds: [ImageEmbed],
								components: []
							})
						}
						if (buttonId === 'buttonProfileLeft') {
							page--
							for (let i = 0; i<rowImage1.components.length;i++) {
								rowImage1.components[i].setLabel(String(page*5+i+1))
								rowImage1.components[i].setDisabled(setDisabledImage(page*5+i))
							}
							rowArrows.components[0].setDisabled(lockLeft())
							rowArrows.components[1].setDisabled(lockRight())
							ImageEmbed.setDescription(profilesText(page))
							await interaction.editReply({
								embeds: [ImageEmbed],
								components: [rowImage1, rowArrows]
							})
						}
						if (buttonId === 'buttonProfileRight') {
							page++
							for (let i = 0; i<rowImage1.components.length;i++) {
								rowImage1.components[i].setLabel(String(page*5+i+1))
								rowImage1.components[i].setDisabled(setDisabledImage(page*5+i))
							}
							rowArrows.components[0].setDisabled(lockLeft())
							rowArrows.components[1].setDisabled(lockRight())
							ImageEmbed.setDescription(profilesText(page))
							await interaction.editReply({
								embeds: [ImageEmbed],
								components: [rowImage1, rowArrows]
							})
						}
					})
					collector.on('end', async () => {
						if (status == 'editImage') {
							for (let i = 0; i<rowImage1.components.length;i++) {
								rowImage1.components[i].setDisabled(true)
							}
							for (let i = 0; i<rowArrows.components.length;i++) {
								rowArrows.components[i].setDisabled(true)
							}
							await interaction.editReply({
								components: [rowImage1, rowArrows]
							})
						}
					})
				}
				if (buttonId === 'buttonProfileToMarryProfile') {
					await ButtonInteraction.deferUpdate()
					status = 'MarryProfile'
					let resultCreated = format(now1)
					let resultOnline = formatTimems(love_online)
					let resultTime = formatTimems(love_time/60000-Date.now()/60000)
					let member1 = await interaction.guild.members.fetch(author.id)
					const canvasava1 = Canvas.createCanvas(200, 200);
					const ctxava1 = canvasava1.getContext('2d');
					const canvasava2 = Canvas.createCanvas(200, 200);
					const ctxava2 = canvasava2.getContext('2d');
					const canvas = Canvas.createCanvas(900, 270);
					const ctx = canvas.getContext('2d');
					const background = await Canvas.loadImage(`images/${love_background}.png`);
					const round = await Canvas.loadImage('images/round.png');
					let imageResponse = await axios.get(member1.displayAvatarURL(), {
						responseType: 'arraybuffer',
					});
					let img = await sharp(imageResponse.data).toFormat('png').toBuffer();
					let avatar1 = await loadImage(img);
					ctxava1.fillStyle = '#fff';
					ctxava1.fillRect(0, 0, 100, 100);
					ctxava1.globalCompositeOperation = 'source-in';
					ctxava1.drawImage(round, 0, 0, 100, 100);
					ctxava1.drawImage(avatar1, 0, 0, 100, 100);
					ctxava1.globalCompositeOperation = 'source-over';
					imageResponse = await axios.get(await partnerAva(), {
						responseType: 'arraybuffer',
					});
					img = await sharp(imageResponse.data).toFormat('png').toBuffer();
					let avatar2 = await loadImage(img);
					ctxava2.fillStyle = '#fff';
					ctxava2.fillRect(0, 0, 100, 100);
					ctxava2.globalCompositeOperation = 'source-in';
					ctxava2.drawImage(round, 0, 0, 100, 100);
					ctxava2.drawImage(avatar2, 0, 0, 100, 100);
					ctxava2.globalCompositeOperation = 'source-over';
					ctx.drawImage(background, 0, 0);
					ctx.drawImage(canvasava1, 111.03, 47.5, 350, 350);
					ctx.drawImage(canvasava2, 614, 47.5, 350, 350);
					const MarryProfileEmbed = new EmbedBuilder()
						.setTitle('Love профиль')
						.setColor(config.color)
						.setImage('attachment://test.png')
						.addFields(
							{name: `${config.emojis.love} Пара:`, value: `\`\`\`${author.user.username}💗${await partner()}\`\`\``, inline: false},
							{name: `${config.emojis.loveCreate} Регистрация:`, value: `\`\`\`${resultCreated}\`\`\``, inline: false},
							{name: `${config.emojis.loveMoney} Баланс пары:`, value: `\`\`\`${love_money}\`\`\``, inline: true},
							{name: `${config.emojis.loveTime} Списание платы через:`, value: `\`\`\`${resultTime}\`\`\``, inline: true},
							{name: `${config.emojis.loveOnline} Парный онлайн:`, value: `\`\`\`${resultOnline}\`\`\``, inline: false}
						)
					await interaction.editReply({
						embeds: [MarryProfileEmbed],
						components: [rowMarryProfile, rowReturn],
						files: [
							{
								attachment: canvas.toBuffer(), name: 'test.png', description: 'desc'
							}
						]
					})
				}
				if (buttonId === 'replenishAccountMarryProfile') {
					const modal = new ModalBuilder()
						.setCustomId('modalReplenishAccountMarry')
						.setTitle('Пополнение баланса пары');
					const replenishAccountInput = new TextInputBuilder()
						.setCustomId('modalReplenishAccountMarryInput')
						.setLabel('Введите сумму пополнения')
						.setPlaceholder('1000')
						.setStyle(TextInputStyle.Short)
						.setRequired(true)
					const firstActionRow = new ActionRowBuilder().addComponents(replenishAccountInput)
					modal.addComponents(firstActionRow)
					await ButtonInteraction.showModal(modal);
					const filter = ModalInteraction => ModalInteraction.customId === 'modalReplenishAccountMarry';
					ButtonInteraction.awaitModalSubmit({ filter, time: 60000 })
					.then(async ModalInteraction => {
						await ModalInteraction.deferUpdate()
						status = 'MarryMoney'
						let moneyInput = ModalInteraction.components[0].components[0].value
						if (parseInt(moneyInput) != moneyInput) {
							const errorEmbed = new EmbedBuilder()
								.setTitle("Пополнение баланса пары")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.colorError)
								.setDescription(`${author}, вам нужно указать сумму пополнения`);
							await interaction.editReply({
								embeds: [errorEmbed],
								components: [],
								files: []
							})
							return
						}
						const money = moneyInput;
						if (money < 1) {
							const errorEmbed = new EmbedBuilder()
								.setTitle("Пополнение баланса пары")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.colorError)
								.setDescription(`${author}, вы указали слишком мальнькое значение, минимальное: 1`);
							await interaction.editReply({
								embeds: [errorEmbed],
								components: [],
								files: []
							})
							return
						}
						if (balance < money){
							const errorEmbed = new EmbedBuilder()
								.setTitle("Пополнение баланса пары")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.colorError)
								.setDescription(`${author}, вы не можете положить ${money} ${emoji}\n\n\\Ваш баланс: ${balance} ${emoji}`);
							await interaction.editReply({
								embeds: [errorEmbed],
								components: [],
								files: []
							})
							return
						}
						const Embed = new EmbedBuilder()
							.setTitle('Пополнение баланса пары')
							.setThumbnail(author.user.displayAvatarURL())
							.setColor(config.color)
							.setDescription(`${author}, вы пополнили баланс пары на ${money} ${emoji}\n\nВаш новый баланс: ${balance-moneyInput} ${emoji}`);
						await interaction.editReply({
							embeds: [Embed],
							components: [],
							files: []
						})
						await connection
							.query(`UPDATE money SET money = money-${money} WHERE id = ${author.id};`, {
								type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
							})
						await connection
							.query(`UPDATE marry SET love_money = love_money+${money} WHERE partner = ${author.id} OR partner1 = ${author.id};`, {
								type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
							})
					})
				}
				if (ButtonInteraction.customId == 'butttonMarryProfileEditProfile') {
					await ButtonInteraction.deferUpdate()
					status = 'MarryProfileShop'
					const rowEditProfile = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonMarryProfileBuy0`)
								.setLabel(`${page*4+1}`)
								.setEmoji(config.emojis.buy)
								.setDisabled(lockBuy(page*4+1))
								.setStyle(2),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonMarryProfileBuy1`)
								.setLabel(`${page*4+2}`)
								.setEmoji(config.emojis.buy)
								.setDisabled(lockBuy(page*4+2))
								.setStyle(2),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonMarryProfileBuy2`)
								.setLabel(`${page*4+3}`)
								.setEmoji(config.emojis.buy)
								.setDisabled(lockBuy(page*4+3))
								.setStyle(2),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId(`buttonMarryProfileBuy3`)
								.setLabel(`${page*4+4}`)
								.setEmoji(config.emojis.buy)
								.setDisabled(lockBuy(page*4+4))
								.setStyle(2),
						)
					const rowPages = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonMarryProfileLeft')
								.setEmoji(config.emojis.left)
								.setStyle(2)
								.setDisabled(lockLeft()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonMarryProfileRight')
								.setEmoji(config.emojis.right)
								.setStyle(2)
								.setDisabled(lockRight()),
						);
					const test = new AttachmentBuilder(`./images/lovepage${page+1}.png`, {name: 'image.png'})
					const Embed = new EmbedBuilder()
						.setTitle("Магазин любовных профилей")
						.setThumbnail(author.user.displayAvatarURL())
						.setImage('attachment://image.png')
						.addFields(
							{name: `[${page*4+1}] - ${prices[page][0]}${emoji}`, value: ` `, inline: true},
							{name: `[${page*4+2}] - ${prices[page][1]}${emoji}`, value: ` `, inline: true},
							{name: ` `, value: ` `, inline: false},
							{name: `[${page*4+3}] - ${prices[page][2]}${emoji}`, value: ` `, inline: true},
							{name: `[${page*4+4}] - ${prices[page][3]}${emoji}`, value: ` `, inline: true},
						)
						.setColor(config.color);
					await interaction.editReply({
						embeds: [Embed],
						components: [rowEditProfile, rowPages],
						files: [test]
					})
					const filter = ButtonInteraction => (ButtonInteraction.customId === 'buttonMarryProfileBuy0' || ButtonInteraction.customId === 'buttonMarryProfileBuy1' || ButtonInteraction.customId === 'buttonMarryProfileBuy2' || ButtonInteraction.customId === 'buttonMarryProfileBuy3' || ButtonInteraction.customId === 'buttonMarryProfileLeft' || ButtonInteraction.customId === 'buttonMarryProfileRight' || ButtonInteraction.customId === 'buttonMarryProfileAccept' || ButtonInteraction.customId === 'buttonMarryProfileReject' || ButtonInteraction.customId === 'buttonProfileReturn1');

					const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

					collector1.on('collect', async ButtonInteraction => {
						if (ButtonInteraction.user.id != author.id) {
							const errorEmbed = new EmbedBuilder()
								.setTitle("Магазин любовных профилей")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.colorError)
								.setDescription(`${ButtonInteraction.user}, вы не можете этого сделать`);
							await ButtonInteraction.reply({
								embeds: [errorEmbed],
								ephemeral: true
							})
						}
						await ButtonInteraction.deferUpdate()
						collector1.resetTimer()
						if (ButtonInteraction.customId == 'buttonMarryProfileBuy0' || ButtonInteraction.customId === 'buttonMarryProfileBuy1' || ButtonInteraction.customId === 'buttonMarryProfileBuy2' || ButtonInteraction.customId === 'buttonMarryProfileBuy3') {
							status = 'editMarryProfileBuy'
							id = parseInt(ButtonInteraction.customId.replace('buttonMarryProfileBuy', ''))
							const rowAccept = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileAccept')
										.setEmoji(config.emojis.yes)
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileReject')
										.setEmoji(config.emojis.no)
										.setStyle(2),
								)
							const Embed = new EmbedBuilder()
								.setTitle("Покупка любовного профиля")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.color)
								.setDescription(`${author}, вы уверенны, что хотите купить этот любовный профиль за ${prices[page][id]} ${emoji}?`)
								.setFooter({text: 'Обратите внимание, за уже купленный лав профиль средства не возвращаются'})
							await interaction.editReply({
								embeds: [Embed],
								components: [rowAccept],
								files: []
							})
						}
						if (ButtonInteraction.customId == 'buttonMarryProfileLeft') {
							page--
							const rowEditProfile = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy0`)
										.setLabel(`${page*4+1}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+1))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy1`)
										.setLabel(`${page*4+2}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+2))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy2`)
										.setLabel(`${page*4+3}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+3))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy3`)
										.setLabel(`${page*4+4}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+4))
										.setStyle(2),
								)
							const rowPages = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileLeft')
										.setEmoji(config.emojis.left)
										.setStyle(2)
										.setDisabled(lockLeft()),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileRight')
										.setEmoji(config.emojis.right)
										.setStyle(2)
										.setDisabled(lockRight()),
								);
							const test = new AttachmentBuilder(`./images/lovepage${page+1}.png`, {name: 'image.png'})
							const Embed = new EmbedBuilder()
								.setTitle("Магазин любовных профилей")
								.setThumbnail(author.user.displayAvatarURL())
								.setImage('attachment://image.png')
								.addFields(
									{name: `[${page*4+1}] - ${prices[page][0]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+2}] - ${prices[page][1]}${emoji}`, value: ` `, inline: true},
									{name: ` `, value: ` `, inline: false},
									{name: `[${page*4+3}] - ${prices[page][2]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+4}] - ${prices[page][3]}${emoji}`, value: ` `, inline: true},
								)
								.setColor(config.color);
							await interaction.editReply({
								embeds: [Embed],
								components: [rowEditProfile, rowPages],
								files: [test]
							})
						} 
						if (ButtonInteraction.customId == 'buttonMarryProfileRight') {
							page++
							const rowEditProfile = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy0`)
										.setLabel(`${page*4+1}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+1))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy1`)
										.setLabel(`${page*4+2}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+2))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy2`)
										.setLabel(`${page*4+3}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+3))
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy3`)
										.setLabel(`${page*4+4}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(lockBuy(page*4+4))
										.setStyle(2),
								)
							const rowPages = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileLeft')
										.setEmoji(config.emojis.left)
										.setStyle(2)
										.setDisabled(lockLeft()),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileRight')
										.setEmoji(config.emojis.right)
										.setStyle(2)
										.setDisabled(lockRight()),
								);
							const file = new AttachmentBuilder(`./images/lovepage${page+1}.png`, {name: 'image.png'})
							const Embed = new EmbedBuilder()
								.setTitle("Магазин любовных профилей")
								.setThumbnail(author.user.displayAvatarURL())
								.setImage('attachment://image.png')
								.addFields(
									{name: `[${page*4+1}] - ${prices[page][0]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+2}] - ${prices[page][1]}${emoji}`, value: ` `, inline: true},
									{name: ` `, value: ` `, inline: false},
									{name: `[${page*4+3}] - ${prices[page][2]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+4}] - ${prices[page][3]}${emoji}`, value: ` `, inline: true},
								)
								.setColor(config.color);
							await interaction.editReply({
								embeds: [Embed],
								components: [rowEditProfile, rowPages],
								files: [file]
							})
						}
						if (ButtonInteraction.customId == 'buttonMarryProfileAccept') {
							status = 'editMarryProfileBuyAccept'
							if (love_money < prices[page][id]) {
								const Embed = new EmbedBuilder()
									.setTitle("Покупка любовного профиля")
									.setThumbnail(author.user.displayAvatarURL())
									.setDescription(`${author}, на вашем балансе пары недостаточно средств\n\n\\Баланс вашей пары: ${love_money} <:love_money:1105184830263676928>`)
									.setColor(config.color);
								await interaction.editReply({
									embeds: [Embed],
									components: [],
									files: []
								})
								return
							}
							await connection
								.query(`UPDATE marry SET love_money = love_money-${prices[page][id]}, love_background = ${page*4+id+1} WHERE partner = ${author.id} OR partner1 = ${author.id};`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
							const Embed = new EmbedBuilder()
								.setTitle("Покупка любовного профиля")
								.setThumbnail(author.user.displayAvatarURL())
								.setDescription(`${author}, вы успешно купили любовный профиль\n\n\\Новый баланс вашей пары: ${love_money-prices[page][id]} <:love_money:1105184830263676928>`)
								.setColor(config.color);
							await interaction.editReply({
								embeds: [Embed],
								components: [],
								files: []
							})
							if (ghost) {
								return
							}
							const EmbedLog = new EmbedBuilder()
								.setTitle("Marry")
								.setColor('#00ff00')
								.setDescription(`[1] ${author} ${author.id}
[2] Покупка лав профиля
[3] Старый ID профиля: ${love_background}
[4] Новый ID профиля: ${page*4+id+1}
[3] Старый баланс пары: ${love_money}
[4] Новый баланс пары: ${love_money-prices[page][id]}`)
								.setFooter({text: `${author.id} • ${interaction.guild.name}`})
								.setTimestamp();
							await logChannel.send({
								embeds: [EmbedLog],
							})
						}
						if (ButtonInteraction.customId == 'buttonMarryProfileReject') {
							status = 'editMarryProfileBuyReject'
							const disagreeEmbed = new EmbedBuilder()
								.setTitle("Покупка любовного профиля")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.color)
								.setDescription(`${author}, операция отменена`);
							await interaction.editReply({
								embeds: [disagreeEmbed],
								components: []
							})
							return
						}
					})
					collector1.on('end', async () => {
						if (status == 'editMarryProfileBuy') {
							const rowAccept = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileAccept')
										.setEmoji(config.emojis.yes)
										.setDisabled(true)
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileReject')
										.setEmoji(config.emojis.no)
										.setDisabled(true)
										.setStyle(2),
								)
							const Embed = new EmbedBuilder()
								.setTitle("Покупка любовного профиля")
								.setThumbnail(author.user.displayAvatarURL())
								.setColor(config.color)
								.setDescription(`${author}, вы уверенны, что хотите купить этот любовный профиль за ${prices[page][id]} ${emoji}?`)
								.setFooter({text: 'Обратите внимание, за уже купленный лав профиль средства не возвращаются'})
							await ButtonInteraction.editReply({
								embeds: [Embed],
								components: [rowAccept],
								files: []
							})
						}
						if (status == 'MarryProfileShop') {
							const rowEditProfile = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy0`)
										.setLabel(`${page*4+1}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(true)
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy1`)
										.setLabel(`${page*4+2}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(true)
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy2`)
										.setLabel(`${page*4+3}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(true)
										.setStyle(2),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId(`buttonMarryProfileBuy3`)
										.setLabel(`${page*4+4}`)
										.setEmoji(config.emojis.buy)
										.setDisabled(true)
										.setStyle(2),
								)
							const rowPages = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileLeft')
										.setEmoji(config.emojis.left)
										.setStyle(2)
										.setDisabled(true),
								)
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonMarryProfileRight')
										.setEmoji(config.emojis.right)
										.setStyle(2)
										.setDisabled(true),
								);
							const rowReturn1 = new ActionRowBuilder()
								.addComponents(
									new ButtonBuilder()
										.setCustomId('buttonProfileReturn1')
										.setLabel('назад')
										.setEmoji('<:return:1105481081597206580>')
										.setDisabled(true)
										.setStyle(1),
								)
							const file = new AttachmentBuilder(`./images/lovepage${page+1}.png`, {name: 'image.png'})
							const Embed = new EmbedBuilder()
								.setTitle("Магазин любовных профилей")
								.setThumbnail(author.user.displayAvatarURL())
								.setImage('attachment://image.png')
								.addFields(
									{name: `[${page*4+1}] - ${prices[page][0]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+2}] - ${prices[page][1]}${emoji}`, value: ` `, inline: true},
									{name: ` `, value: ` `, inline: false},
									{name: `[${page*4+3}] - ${prices[page][2]}${emoji}`, value: ` `, inline: true},
									{name: `[${page*4+4}] - ${prices[page][3]}${emoji}`, value: ` `, inline: true},
								)
								.setColor(config.color);
							await interaction.editReply({
								embeds: [Embed],
								components: [rowEditProfile, rowPages, rowReturn1],
								files: [file]
							})
						}
					})
				}
				if (buttonId === 'buttonProfileReturn') {
					await ButtonInteraction.deferUpdate()
					if (status == 'MarryProfile') {
						status = 'start'
						await interaction.editReply({
							//embeds: [StartEmbed],
							components: [rowStart1, rowStart2],
							files: []
						})
					}
				}
			})
			collector.on('end', async () => {
				if (status == 'start') {
					for (let i = 0; i<rowStart1.components.length;i++) {
						rowStart1.components[i].setDisabled(true)
					}
					for (let i = 0; i<rowStart2.components.length;i++) {
						rowStart2.components[i].setDisabled(true)
					}
					await interaction.editReply({
						components: [rowStart1, rowStart2],
					})
				}
			})
		} catch(err) {
			if (err.code != 10062) {
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
			console.log(author)
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