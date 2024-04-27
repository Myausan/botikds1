const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize');
const Canvas = require('canvas')
const { Image, loadImage, FontFace } = require('canvas')
const axios = require('axios')
const sharp = require('sharp')
const opentype = require('opentype.js');
const { auth } = require('google-auth-library');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile1')
		.setDescription('посмотреть профиль'),
	async execute(interaction, connection, DB) {
		const { default: chalk } = await import('chalk')
		const author = interaction.member;
		const emoji = config.emoji;
		const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logMembersEconomy}`)
		let balance = 0;
		let bank = 0;
		let jailtime = 0;
		let position = 0;
		let baneconomy = 0;
		let exp = 0;
		let level = 0;
		let levelReward = 0;
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
        let id;
		let profile
		let page = 0;
		let maxPage = 1;
		let profiles = ['Night sky']
		let status;
		let currentProfile
		let prices = [
            [0, 1000, 2500, 3000],
            [5000, 7500, 10000, 25000]
        ]
		let now = Date.now()
		if (DB.lockedCommands.includes(interaction.commandName)) {
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
		try {
			await connection
				.query(`SELECT money.money, money.profile, money.exp, money.lvl, money.baneconomy, money.ghost, money.jailtime, money.messages, money.voice_online, marry.partner, marry.partner1, marry.love_background, marry.love_money, marry.love_time, marry.love_create, marry.love_online FROM money LEFT JOIN marry ON money.id = marry.partner OR money.id = marry.partner1 WHERE money.id = ${author.id}`, {
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
			await interaction.deferReply()
			if (sqlResult[0] === undefined) {
				await connection
					.query(`INSERT INTO money (id, money) VALUES (${author.id}, 0);`, {
						type: QueryTypes.INSERT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
					})
			} else {
				balance = sqlResult[0].money;
				profile = sqlResult[0].profile;
				exp = sqlResult[0].exp;
				levelReward = sqlResult[0].lvl
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
			while ((level+1)*2000 <= exp) {
				level++;
				exp-=level*2000
			}
			let partner = async () => {
				if(!partner1Id) {
					return "Отсутствует"
				}
				if (author.id === partner1Id) {
					let partner = await interaction.guild.members.fetch(partner2Id)
					return partner
				}
				let partner = await interaction.guild.members.fetch(partner1Id)
				return partner
			}
			let lockMarryProfile = (partner1Id) => {
				if (partner1Id == null) {
					return true
				} else {
					return false
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
                let text = ``;
                for (let i = page*6; i < page*6+6; i++) {
                    if (profiles[i]) {
                        text+=`[${i+1}] ${profiles[i].name} (${rareText(profiles[i].rare)})\n`;
                    } else {
                        return text
                    }
                }
                return text
            }
            let rareText = (number) => {
                switch(number) {
                    case 1: return "Обычный"
                    case 2: return "Редкий"
                    case 3: return "Эпический"
                    case 4: return "Легендарный"
                    case 5: return "Мифический"
                }
            }
            let rare = (name) => {
                let profiles = config.profiles
                for (let i = 0; i < profiles.common.length; i++) {
                    if (profiles.common[i].name == name) return 1
                }
                for (let i = 0; i < profiles.rare.length; i++) {
                    if (profiles.rare[i].name == name) return 2
                }
                for (let i = 0; i < profiles.epic.length; i++) {
                    if (profiles.epic[i].name == name) return 3
                }
                for (let i = 0; i < profiles.legendary.length; i++) {
                    if (profiles.legendary[i].name == name) return 4
                }
                for (let i = 0; i < profiles.mythical.length; i++) {
                    if (profiles.mythical[i].name == name) return 5
                }
                return 1
            }
			let progressBarColor = (name) => {
                let profiles = config.profiles
                for (let i = 0; i < profiles.common.length; i++) {
                    if (profiles.common[i].name == name) return profiles.common[i].color
                }
                for (let i = 0; i < profiles.rare.length; i++) {
                    if (profiles.rare[i].name == name) return profiles.rare[i].color
                }
                for (let i = 0; i < profiles.epic.length; i++) {
                    if (profiles.epic[i].name == name) return profiles.epic[i].color
                }
                for (let i = 0; i < profiles.legendary.length; i++) {
                    if (profiles.legendary[i].name == name) return profiles.legendary[i].color
                }
                for (let i = 0; i < profiles.mythical.length; i++) {
                    if (profiles.mythical[i].name == name) return profiles.mythical[i].color
                }
                return 1
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
			let rowProfile = (disabled) => {
				const rowProfileStart = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('buttonProfileBuyCoins')
							.setLabel('Магазин')
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
							.setDisabled(disabled)
							.setStyle(2)
					)
					.addComponents(
						new ButtonBuilder()
							.setCustomId('buttonProfileToMarryProfile')
							.setLabel('Открыть любовный профиль')
							.setEmoji(config.emojis.loveCreate)
							.setDisabled(lockMarryProfile(partner1Id) && !(disabled))
							.setStyle(2)
					)
				return [rowProfileStart]
				if (levelReward < level) {
					const rowReward = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileGetReward')
								.setLabel(`Получить награды (${level-levelReward})`)
								.setDisabled(disabled)
								.setStyle(3)
						)
					return [rowProfileStart, rowReward]
				}
				return [rowProfileStart]
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
			await connection
            .query(`SELECT COUNT(id) as count FROM money WHERE bank>${bank};`, {
                type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
            })
            .then((result) => sqlResult = result)
            position = sqlResult[0].count + 1;
			const canvasava1 = Canvas.createCanvas(512, 512);
			const ctxava1 = canvasava1.getContext('2d');
			const canvasava2 = Canvas.createCanvas(512, 512);
			const ctxava2 = canvasava2.getContext('2d');
			const canvas = Canvas.createCanvas(1888, 1056);
			const ctx = canvas.getContext('2d');
			let loadImg = () => {
				if (profile) return `profile\\${profile}.png`
				return `profile/Default.png`
			}
			const background = await Canvas.loadImage(loadImg())
			const round = await Canvas.loadImage('images/round.png')
			const square = await Canvas.loadImage('images/profile.png')
			const partnerObject = await partner();
			const partnerNick = partnerObject
			let imageResponse = await axios.get(author.displayAvatarURL({extension:'png', size: 512}), {
				responseType: 'arraybuffer',
			});
			let img = await sharp(imageResponse.data).toFormat('png').toBuffer()
			let avatar = await loadImage(img)
			ctx.textAlign = "center";
			ctxava2.fillStyle = '#fff'
			ctxava2.fillRect(0, 0, 512, 512)
			ctxava2.globalCompositeOperation = 'source-in'
			ctxava2.drawImage(square, 0, 0, 512, 512)
			ctxava2.drawImage(avatar, 0, 0, 512, 512)
			ctxava2.globalCompositeOperation = 'source-over';
			const temp = canvasava2.height-200
			for (let y = 0; y < temp; y++) {
				const alpha = (temp - y) / temp*0.8;
				ctxava1.globalAlpha = alpha;
				ctxava1.drawImage(canvasava2, 0, y, canvasava1.width, 1, 0, y, canvasava1.width, 1);
			}
			ctxava2.clearRect(0, 0, canvasava2.width, canvasava2.height);
			ctxava2.fillStyle = '#fff'
			ctxava2.fillRect(0, 0, 512, 512)
			ctxava2.globalCompositeOperation = 'source-in'
			ctxava2.drawImage(round, 0, 0, 512, 512)
			ctxava2.drawImage(avatar, 0, 0, 512, 512)
			ctxava2.globalCompositeOperation = 'source-over';
			ctx.drawImage(background, 0, 0);
			ctx.drawImage(canvasava1, 65, 65, 525, 525)
			ctx.drawImage(canvasava2, 228, 229, 199.05, 196);
			if (partnerNick != 'Отстутствует') {
				const imageResponse = await axios.get(partnerObject.displayAvatarURL({extension:'png', size: 512}), {
					responseType: 'arraybuffer',
				});
				const img = await sharp(imageResponse.data).toFormat('png').toBuffer()
				const avatar = await loadImage(img)
				ctxava2.clearRect(0, 0, canvasava2.width, canvasava2.height);
				ctxava2.fillStyle = '#fff'
				ctxava2.fillRect(0, 0, 512, 512)
				ctxava2.globalCompositeOperation = 'source-in'
				ctxava2.drawImage(round, 0, 0, 512, 512)
				ctxava2.drawImage(avatar, 0, 0, 512, 512)
				ctxava2.globalCompositeOperation = 'source-over';
				ctx.drawImage(canvasava2, 720, 830, 106, 107);
			}
			function drawCircularProgressBarLine( x, y, radius, color, progress) {
				const angle = (2 * Math.PI * progress) / 100;
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(-Math.PI / 2);
				ctx.beginPath();
				ctx.arc(0, 0, radius - 8, 0, angle, false);
				ctx.lineWidth = 8;
				ctx.lineCap = 'round';
				ctx.strokeStyle = color;
				ctx.stroke();
				ctx.restore();
			}
			drawCircularProgressBarLine(327.5, 327.5, 117, progressBarColor(profile), exp/((level+1)*2000)*100);
			ctx.fillStyle = '#fff'
			ctx.font = `38px Inter`;
			ctx.fillText(`${level}`, 517, 551, 82)
			ctx.textAlign = "left";
			let displayName = author.displayName;
			let metrics = ctx.measureText(displayName);
			let textWidth = metrics.width;
			if (textWidth > 280) {/// такую же хрень для партнёра и клана
				displayName+='...'
			}
			while (textWidth > 280) {
				displayName = displayName.slice(0,displayName.length-4) + displayName.slice(displayName.length-3);
				metrics = ctx.measureText(displayName);
				textWidth = metrics.width;
			}
			ctx.fillText(`${displayName}`, 140, 549, 272)
			ctx.font = `bold 36px Inter`;
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
			ctx.fillText(`${balance}`, 247, 732)
			ctx.fillText(`${0}`, 247, 925)//кристаллы
			ctx.fillText(`${top()}`, 830, 208)
			ctx.fillText(`${online(voice_online)}`, 830, 391)
			ctx.fillText(`${messages}`, 1438, 208)
			ctx.fillText(`${0}`, 1438, 391)//достижения
			displayName = author.displayName;
			metrics = ctx.measureText(displayName);
			textWidth = metrics.width;
			if (textWidth > 323) {/// такую же хрень для партнёра и клана
				displayName+='...'
			}
			while (textWidth > 323) {
				displayName = displayName.slice(0,displayName.length-4) + displayName.slice(displayName.length-3);
				metrics = ctx.measureText(displayName);
				textWidth = metrics.width;
			}
			ctx.fillText(`${displayName}`, 849, 897)
			ctx.fillText(`${'Отсутствует'}`, 1472, 897)
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
			await interaction.editReply ({
				//embeds: [StartEmbed],
				components: rowProfile(false),
				files: [
                    {
                        attachment: canvas.toBuffer(), name: 'test.png', description: 'desc'
                    }
                ]
			})
			.then ((send) => {
				message = send
			})

			const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonProfileBuyCoins' || ButtonInteraction.customId === 'buttonProfileInventory' || ButtonInteraction.customId === 'buttonProfileEditImage' || ButtonInteraction.customId === 'buttonProfileToMarryProfile' || ButtonInteraction.customId === 'buttonProfileGetReward' || ButtonInteraction.customId === 'replenishAccountMarryProfile' || ButtonInteraction.customId === 'butttonMarryProfileEditProfile' || ButtonInteraction.customId === 'buttonProfileReturn';

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
				if (buttonId === 'buttonProfileGetReward') {
					let level25 = () => {

					}
					let reward = (level) => {
						switch(level) {
							case 5: return {
								text: `и 5 кейсов с профилями`,
								reward: 5
							}
							case 10: return {
								text: `и 10 кейсов с профилями\nТак же вам теперь доступно заключение брака и создание роли`,
								reward: 5
							}
							case 20: return {
								text: `и 15 кейсов с профилями`,
								reward: 5
							}
							case 25: {
								level25()
								return {
									text: `и 25 кейсов с профилями\nТак же у вас открыто достижение`,
									reward: 5
								}
							}
							case 30: return {
								text: `и 5 кейсов с профилями`,
								reward: 5
							}
							case 40: return {
								text: `и 5 кейсов с профилями`,
								reward: 5
							}
							case 50: return {
								text: `и 5 кейсов с профилями`,
								reward: 5
							}
							default: return {
								text: ``,
								reward: 0
							}
						}
					}
					let text = ``;
					let gifts = 0;
					let rewardMoney = 0;
					for (let i = levelReward+1; i <= level; i++) {
						const object = reward(i)
						text += `${author}, вы достигли ${i} уровня и получаете: ${100*i}${emoji}${object.text}\n\n`
						rewardMoney+=100*i
						gifts+=object.reward
					}
					const Embed = new EmbedBuilder()
						.setColor(config.color)
						.setDescription(text)
					await message.reply({
						embeds: [Embed]
					})
				}
				if (buttonId === 'buttonProfileEditImage') {
					let profiles = ['Default']
					await ButtonInteraction.deferUpdate()
					status = 'editImage'
					await connection
						.query(`SELECT * FROM profiles WHERE id = ${author.id}`, {
							type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
						})
					.then((result) => sqlResult = result)
					for (let i = 0; i < sqlResult.length;i++) {
						const profileObject = {
							name: sqlResult[i].profile,
							rare: rare(sqlResult[i].profile)
						}
						profiles.push(profileObject)
					}
					maxPage = Math.floor((profiles.length-1)/6)
					profiles.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
					status = 'editImage'
					const selectMenu = new StringSelectMenuBuilder()
						.setCustomId('selectMenuProfileItems')
						.setPlaceholder('Выберите фон')
						.setMaxValues(1)
					let max = (number) => {
						if (number > profiles.length) {
							return profiles.length
						}
						return number
					}
					for (let i = page*6; i < max(page*6+6); i++) {
						selectMenu.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel(`${i+1}. ${profiles[i].name}`)
								.setValue(String(i))
						)
					} 
					const selectMenu1 = new StringSelectMenuBuilder()
						.setCustomId('selectMenuProfileSort')
						.setPlaceholder('Сортировать по')
						.setMaxValues(1)
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Сортировать по названию')
								.setValue('alphabetical order')
								.setEmoji(config.emojis.sort1)
								.setDefault(true)
						)
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Сортировать по названию')
								.setValue('alphabetical order r')
								.setEmoji(config.emojis.sort2)
						)
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Сортировать по редкости')
								.setValue('rare order')
								.setEmoji(config.emojis.sort1)
						)
						.addOptions(
							new StringSelectMenuOptionBuilder()
								.setLabel('Сортировать по редкости')
								.setValue('rare order r')
								.setEmoji(config.emojis.sort2)
						)
					const rowArrows = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileLeftAll')
								.setEmoji(config.emojis.leftAll)
								.setStyle(2)
								.setDisabled(lockLeft()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileLeft')
								.setEmoji(config.emojis.leftNew)
								.setStyle(2)
								.setDisabled(lockLeft()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileBin')
								.setEmoji(config.emojis.bin)
								.setStyle(4),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileRight')
								.setEmoji(config.emojis.rightNew)
								.setStyle(2)
								.setDisabled(lockRight()),
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileRightAll')
								.setEmoji(config.emojis.rightAll)
								.setStyle(2)
								.setDisabled(lockRight()),
						)
					const rowReturn = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('buttonProfileReturn1')
								.setLabel('Назад')
								.setStyle(2),
						)
					const canvasava = Canvas.createCanvas(512, 512);
					const ctxava = canvasava.getContext('2d');
					const canvasProfile = Canvas.createCanvas(1888, 1056);
					const ctxProfile = canvasProfile.getContext('2d');
					const canvasNumber = Canvas.createCanvas(66, 66);
					const ctxNumber = canvas.getContext('2d');
					const canvasEditImage = Canvas.createCanvas(1888, 1056);
					const ctx = canvasEditImage.getContext('2d');
					const background = await Canvas.loadImage('images/chooseProfile.png')
					ctx.drawImage(background, 0, 0);
					const round = await Canvas.loadImage('images/round.png')
					const outline = await Canvas.loadImage('images/cutProfile.png')
					const squareNumber = await Canvas.loadImage('images/squareNumber.png')
					let imageResponse = await axios.get(author.displayAvatarURL({extension:'png', size: 512}), {
						responseType: 'arraybuffer',
					});
					let img = await sharp(imageResponse.data).toFormat('png').toBuffer()
					let avatar = await loadImage(img)
					ctx.textAlign = "center";
					ctx.font = `31px Inter`;
					ctx.fillStyle = '#6A6A6A'
					ctx.fillText(`Страница ${page+1} из ${maxPage+1}`, 948, 141)
					ctx.font = `38px Inter`;
					ctx.fillStyle = '#B5B5B5'
					ctx.textAlign = "left";
					let displayName = author.displayName;
					let metrics = ctx.measureText(displayName);
					let textWidth = metrics.width;
					if (textWidth > 339) {
						displayName+='...'
					}
					while (textWidth > 339) {
						displayName = displayName.slice(0,displayName.length-4) + displayName.slice(displayName.length-3);
						metrics = ctx.measureText(displayName);
						textWidth = metrics.width;
					}
					ctx.fillText(`${displayName}`, 1466, 144)
					ctx.textAlign = "center";
					ctxava.fillStyle = '#fff'
					ctxava.fillRect(0, 0, 512, 512)
					ctxava.globalCompositeOperation = 'source-in'
					ctxava.drawImage(round, 0, 0, 512, 512)
					ctxava.drawImage(avatar, 0, 0, 512, 512)
					ctxava.globalCompositeOperation = 'source-over';
					ctx.drawImage(canvasava, 1368, 88, 81, 81);
					const coords = {
						"0": {
							"profile": {
								x: 95,
								y: 271
							},
							"number": {
								x: 130,
								y: 306
							}
						},
						"1": {
							"profile": {
								x: 672,
								y: 271
							},
							"number": {
								x: 707,
								y: 306
							}
						},
						"2": {
							"profile": {
								x: 1247,
								y: 271
							},
							"number": {
								x: 1282,
								y: 306
							}
						},
						"3": {
							"profile": {
								x: 95,
								y: 625
							},
							"number": {
								x: 130,
								y: 660
							}
						},
						"4": {
							"profile": {
								x: 672,
								y: 625
							},
							"number": {
								x: 707,
								y: 660
							}
						},
						"5": {
							"profile": {
								x: 1247,
								y: 625
							},
							"number": {
								x: 1282,
								y: 660
							}
						}
					}
					for (let i = 0; i < max(page*6+6); i++) {
						const profile = await Canvas.loadImage(`profile/${profiles[i].name}.png`)
						ctxProfile.fillStyle = '#fff'
						ctxProfile.fillRect(0, 0, 1888, 1056)
						ctxProfile.globalCompositeOperation = 'source-in'
						ctxProfile.drawImage(outline, 0, 0, 1888, 1056)
						ctxProfile.drawImage(profile, 0, 0, 1888, 1056)
						ctxProfile.globalCompositeOperation = 'source-over';
						ctx.drawImage(canvasProfile, coords[String(i)].profile.x, coords[String(i)].profile.y, 547.75, 306.5);
						ctx.drawImage(squareNumber, coords[String(i)].number.x, coords[String(i)].number.y, 58, 58);
						ctx.fillText(`${i+1}`, coords[String(i)].number.x+28, coords[String(i)].number.y+42)
						ctxProfile.clearRect(0, 0, ctxProfile.width, ctxProfile.height);
					}
					const rowProfiles = new ActionRowBuilder().addComponents(selectMenu)
					const rowSort = new ActionRowBuilder().addComponents(selectMenu1)
					await interaction.editReply({
						embeds: [],
						components: [rowProfiles, rowSort, rowArrows, rowReturn],
						files: [
							{
								attachment: canvasEditImage.toBuffer(), name: 'test.png', description: 'desc'
							}
						]
					})
					const filter = ButtonInteraction => ButtonInteraction.customId === 'selectMenuProfileItems' || ButtonInteraction.customId === 'selectMenuProfileSort' || ButtonInteraction.customId === 'buttonProfileLeftAll' || ButtonInteraction.customId === 'buttonProfileLeft' || ButtonInteraction.customId === 'buttonProfileBin' || ButtonInteraction.customId === 'buttonProfileRight' || ButtonInteraction.customId === 'buttonProfileRightAll' || ButtonInteraction.customId === 'buttonProfileReturn1';

					const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

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
						await ButtonInteraction.deferUpdate()
						if (ButtonInteraction.customId === 'selectMenuProfileItems') {
							status = 'editProfile'
							collector1.stop()
							const numberProfile = ParseInt(ButtonInteraction.values[0]);
							const Embed = new EmbedBuilder()
								.setTitle('Изменение фона')
								.setColor(config.color)
								.setDescription(`${author}, вы изменили фон профиля на \`${profiles[numberProfile].name}\``);
							await interaction.editReply({
								embeds: [Embed],
								components: []
							})
							await connection
								.query(`UPDATE money SET profile = '${profiles[numberProfile].name}' WHERE id = ${author.id}}';`, {
									type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
								})
								return
						} else if (ButtonInteraction.customId === 'selectMenuProfileSort') {
							collector1.resetTimer()
							const sort = ButtonInteraction.values[0];
							if (sort === 'alphabetical order') {
								rowSort.components[0].options[0].setDefault(true)
								rowSort.components[0].options[1].setDefault(false)
								rowSort.components[0].options[2].setDefault(false)
								rowSort.components[0].options[3].setDefault(false)
								profiles.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
							}
							if (sort === 'alphabetical order r') {
								rowSort.components[0].options[0].setDefault(false)
								rowSort.components[0].options[1].setDefault(true)
								rowSort.components[0].options[2].setDefault(false)
								rowSort.components[0].options[3].setDefault(false)
								profiles.sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
							}
							if (sort === 'rare order') {
								rowSort.components[0].options[0].setDefault(false)
								rowSort.components[0].options[1].setDefault(false)
								rowSort.components[0].options[2].setDefault(true)
								rowSort.components[0].options[3].setDefault(false)
								profiles.sort((a, b) => a.rare - b.rare);
							}
							if (sort === 'rare order r') {
								rowSort.components[0].options[0].setDefault(false)
								rowSort.components[0].options[1].setDefault(false)
								rowSort.components[0].options[2].setDefault(false)
								rowSort.components[0].options[3].setDefault(true)
								profiles.sort((a, b) => b.rare - a.rare);
							}
							page = 0;
							rowArrows.components[0].setDisabled(true)
							rowArrows.components[1].setDisabled(true)
							rowArrows.components[3].setDisabled(lockRight())
							rowArrows.components[4].setDisabled(lockRight())
							rowProfiles.components[0].setOptions([])
							ctx.clearRect(0, 0, ctx.width, ctx.height);
							ctx.drawImage(background, 0, 0);
							ctx.textAlign = "center";
							ctx.font = `31px Inter`;
							ctx.fillStyle = '#6A6A6A'
							ctx.fillText(`Страница ${page+1} из ${maxPage+1}`, 948, 141)
							ctx.font = `38px Inter`;
							ctx.fillStyle = '#B5B5B5'
							ctx.textAlign = "left";
							ctx.fillText(`${displayName}`, 1466, 144)
							ctx.textAlign = "center";
							ctx.drawImage(canvasava, 1368, 88, 81, 81);
							for (let i = 0; i < max(page*6+6); i++) {
								const profile = await Canvas.loadImage(`profile/${profiles[i].name}.png`)
								ctxProfile.fillStyle = '#fff'
								ctxProfile.fillRect(0, 0, 1888, 1056)
								ctxProfile.globalCompositeOperation = 'source-in'
								ctxProfile.drawImage(outline, 0, 0, 1888, 1056)
								ctxProfile.drawImage(profile, 0, 0, 1888, 1056)
								ctxProfile.globalCompositeOperation = 'source-over';
								ctx.drawImage(canvasProfile, coords[String(i)].profile.x, coords[String(i)].profile.y, 547.75, 306.5);
								ctx.drawImage(squareNumber, coords[String(i)].number.x, coords[String(i)].number.y, 58, 58);
								ctx.fillText(`${i+1}`, coords[String(i)].number.x+28, coords[String(i)].number.y+42)
								ctxProfile.clearRect(0, 0, ctxProfile.width, ctxProfile.height);
							}
							for (let i = page*6; i < max(page*6+6); i++) {
								selectMenu.addOptions(
									new StringSelectMenuOptionBuilder()
										.setLabel(`${i+1}. ${profiles[i].name}`)
										.setValue(String(i))
								)
							} 
							rowProfiles.setComponents(selectMenu)
							await interaction.editReply({
								embeds: [],
								components: [rowProfiles, rowSort, rowArrows, rowReturn],
								files: [
									{
										attachment: canvasEditImage.toBuffer(), name: 'test.png', description: 'desc'
									}
								]
							})
							return
						} else if (ButtonInteraction.customId === 'buttonProfileReturn1') {
							status = 'start'
							collector.resetTimer()
							await interaction.editReply ({
								components: rowProfile(false),
								files: [
									{
										attachment: canvas.toBuffer(), name: 'test.png', description: 'desc'
									}
								]
							})
						} else if (ButtonInteraction.customId === 'buttonProfileBin') {
							collector1.stop()
							await message.delete()
						} else {
							collector1.resetTimer()
							if (ButtonInteraction.customId === 'buttonProfileLeftAll') {
								page = 0
							}
							if (ButtonInteraction.customId === 'buttonProfileeLeft') {
								page--
							}
							if (ButtonInteraction.customId === 'buttonProfileRight') {
								page++
							}
							if (ButtonInteraction.customId === 'buttonProfileRightAll') {
								page = maxPage
							}
							rowArrows.components[0].setDisabled(lockLeft())
							rowArrows.components[1].setDisabled(lockLeft())
							rowArrows.components[3].setDisabled(lockRight())
							rowArrows.components[4].setDisabled(lockRight())
							rowProfiles.components[0].setOptions([])
							ctx.clearRect(0, 0, ctx.width, ctx.height);
							ctx.drawImage(background, 0, 0);
							ctx.textAlign = "center";
							ctx.font = `31px Inter`;
							ctx.fillStyle = '#6A6A6A'
							ctx.fillText(`Страница ${page+1} из ${maxPage+1}`, 948, 141)
							ctx.font = `38px Inter`;
							ctx.fillStyle = '#B5B5B5'
							ctx.textAlign = "left";
							ctx.fillText(`${displayName}`, 1466, 144)
							ctx.textAlign = "center";
							ctx.drawImage(canvasava, 1368, 88, 81, 81);
							for (let i = 0; i < max(page*6+6); i++) {
								const profile = await Canvas.loadImage(`profile/${profiles[i].name}.png`)
								ctxProfile.fillStyle = '#fff'
								ctxProfile.fillRect(0, 0, 1888, 1056)
								ctxProfile.globalCompositeOperation = 'source-in'
								ctxProfile.drawImage(outline, 0, 0, 1888, 1056)
								ctxProfile.drawImage(profile, 0, 0, 1888, 1056)
								ctxProfile.globalCompositeOperation = 'source-over';
								ctx.drawImage(canvasProfile, coords[String(i)].profile.x, coords[String(i)].profile.y, 547.75, 306.5);
								ctx.drawImage(squareNumber, coords[String(i)].number.x, coords[String(i)].number.y, 58, 58);
								ctx.fillText(`${i+1}`, coords[String(i)].number.x+28, coords[String(i)].number.y+42)
								ctxProfile.clearRect(0, 0, ctxProfile.width, ctxProfile.height);
							}
							for (let i = page*6; i < max(page*6+6); i++) {
								selectMenu.addOptions(
									new StringSelectMenuOptionBuilder()
										.setLabel(`${i+1}. ${profiles[i].name}`)
										.setValue(String(i))
								)
							} 
							rowProfiles.setComponents(selectMenu)
							await interaction.editReply({
								embeds: [],
								components: [rowProfiles, rowSort, rowArrows, rowReturn],
								files: [
									{
										attachment: canvasEditImage.toBuffer(), name: 'test.png', description: 'desc'
									}
								]
							})
						}
					})
					collector1.on('end', async () => {
						if (status == 'editProfile') {
							rowProfiles, rowSort, rowArrows, rowReturn
							rowProfiles.components[0].setDisabled(true)
							rowSort.components[0].setDisabled(true)
							rowReturn.components[0].setDisabled(true)
							for (let i = 0; i<rowArrows.components.length;i++) {
								rowArrows.components[i].setDisabled(true)
							}
							await interaction.editReply({
								components: [rowProfiles, rowSort, rowArrows],
							})
						}
					})
				}
				if (buttonId === 'buttonProfileToMarryProfile') {
					status = 'MarryProfile'
					const rowMarryProfile = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('replenishAccountMarryProfile')
								.setLabel('Пополнить счёт')
								.setEmoji(config.emojis.replenishBalance)
								.setStyle(2),
						)
						.addComponents(
							new ButtonBuilder()
							.setCustomId('butttonMarryProfileEditProfile')
								.setLabel('Кастомизация профиля')
								.setEmoji(config.emojis.editLoveProfile)
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
					let imageResponse = await axios.get(author.displayAvatarURL({extension:'png', size: 512}), {
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
					imageResponse = await axios.get(partnerObject.displayAvatarURL({extension:'png', size: 512}), {
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
							{name: `${config.emojis.love} Пара:`, value: `\`\`\`${author.user.username}💗${partnerObject.user.username}\`\`\``, inline: false},
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
					const filter = ButtonInteraction => ButtonInteraction.customId === 'replenishAccountMarryProfile' || ButtonInteraction.customId === 'butttonMarryProfileEditProfile' || ButtonInteraction.customId === 'buttonProfileReturn';

					const collector1 = message.createMessageComponentCollector({ filter, time: 60000 });

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
		
							const collector2 = message.createMessageComponentCollector({ filter, time: 60000 });
		
							collector2.on('collect', async ButtonInteraction => {
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
								collector2.resetTimer()
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
							collector2.on('end', async () => {
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
								collector.resetTimer()
								await interaction.editReply ({
									components: rowProfile(false),
									files: [
										{
											attachment: canvas.toBuffer(), name: 'test.png', description: 'desc'
										}
									]
								})
							}
						}
					})
				}
			})
			collector.on('end', async () => {
				if (status == 'start') {
					await interaction.editReply({
						components: rowProfile(true)
					})
				}
			})
		} catch(err) {
			if (err.code != 10062) {
				DB.lockedCommands.push(interaction.commandName)
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