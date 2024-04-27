const { SlashCommandBuilder , EmbedBuilder, ActionRowBuilder, ButtonBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const { get } = require('mongoose');
const config = require('../config.json');
const { QueryTypes } = require('sequelize');
const fs = require('fs')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('создать розыгрыш')
        .addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Создание розыгрыша")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("manage")
                .setDescription("Управление розыгрышем")
                .addStringOption(option => 
                    option.setName('message_id')
                    .setDescription('ID розыгрыша')
                    .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, connection, lockedCommands) {
		const { default: chalk } = await import('chalk')
        const author = interaction.member;
        const msgId = interaction.options.getUser('message_id');
        const subcommand = interaction.options._subcommand
        const emoji = config.emoji;
        const logChannel = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logEvents}`)
        const giveawayChannel = await interaction.guild.channels.fetch(config.giveawayChannel)
        let sqlResult
        let title
        let prize = '[Приз]'
        let time = 0
        let membersCount
        let winners = 0
        let link
        let sponsor
        let message
        let message1
        switch (subcommand) {
            case 'create': title=`Создание розыгрыша`;break;
            case 'manage': title=`Управление розыгрышем`;break;
        }
        let timeConvert = (time) => {
            if (time) {
                return `<t:${time}:R>(<t:${time}:f>)`
            }
            return `<t:${Math.floor(Date.now()/1000)}:R>(<t:${Math.floor(Date.now()/1000)}:f>)`
        }
        let addGiveaway = async (key, value) => {
            fs.readFile('./db.json', 'utf-8', (err, data) => {
                if (!err) {
                    const dataJSON = JSON.parse(data)
                    dataJSON.giveaways[key] = value
                    fs.writeFile('./db.json', JSON.stringify(dataJSON, null, 4), err => {
                        if (err) console.log(err)
                    })
                }
            })
        }
        let addMember = async (messageId, memberId) => {
            fs.readFile('./db.json', 'utf-8', (err, data) => {
                if (!err) {
                    const dataJSON = JSON.parse(data)
                    dataJSON.giveaways[messageId].members.push(memberId)
                    dataJSON.giveaways[messageId].members.membersCount++
                    fs.writeFile('./db.json', JSON.stringify(dataJSON, null, 4), err => {
                        if (err) console.log(err)
                    })
                }
            })
        }
        let readFromFile = (key) => {
            console.log(13)
            fs.readFileSync('./db.json', 'utf-8', (err, data) => {
                console.log(err)
                if (!err) {
                    console.log(1, JSON.parse(data).giveaways[key])
                    return JSON.parse(data).giveaways[key]
                }
            })
        }
        let text = (prize, time, membersCount, winners, link, sponsor) => {
            if (link || sponsor) {
                if (!sponsor) {
                    sponsor = author
                }
                if (link && link.includes('https://discord.gg')) {
                    return `Розыгрыш ${prize}  <a:E_zkrytilka:728361442582986772>

<a:_23_:1060596818519523338>  **Заканчивается:** ${timeConvert(time)}
<a:_23_:1060596818519523338>  **Участников:** ${membersCount ?? 0}
<a:_23_:1060596818519523338>  **Победителей:** ${winners}

Чтобы поучаствовать в розыгрыше вам необходимо:

 <a:_23_:1060596818519523338>  Находиться в любом голосовом канале со включенным микрофоном.  (Трибуна тоже считается за войс ) 
 <a:_23_:1060596818519523338>  Нажать на кнопку снизу
 <a:_23_:1060596818519523338>  Необходимо зайти на [сервер](${link}) спонсора: (Будет проверяться)

<a:950337336670060544:1056657718011756554>  Советуем внимательно ознакомиться с условиями конкурса, так как всё будет проверяться.

<a:53:1046125880914739210> Спонсор: ${sponsor}`
                } else {
                    return `Розыгрыш ${prize}  <a:E_zkrytilka:728361442582986772>

<a:_23_:1060596818519523338>  **Заканчивается:** ${timeConvert(time)}
<a:_23_:1060596818519523338>  **Участников:** ${membersCount ?? 0}
<a:_23_:1060596818519523338>  **Победителей:** ${winners}

Чтобы поучаствовать в розыгрыше вам необходимо:

 <a:_23_:1060596818519523338>  Находиться в любом голосовом канале со включенным микрофоном.  (Трибуна тоже считается за войс ) 
 <a:_23_:1060596818519523338>  Нажать на кнопку снизу
 <a:_23_:1060596818519523338>  Необходимо зайти в [сервер](${link}) спонсора: (Будет проверяться)

<a:950337336670060544:1056657718011756554>  Советуем внимательно ознакомиться с условиями конкурса, так как всё будет проверяться.

<a:53:1046125880914739210> Спонсор: ${sponsor}`
                }
            } else {
                return `Розыгрыш ${prize}  <a:E_zkrytilka:728361442582986772>

<a:_23_:1060596818519523338>  **Заканчивается:** ${timeConvert(time)}
<a:_23_:1060596818519523338>  **Участников:** ${membersCount ?? 0}
<a:_23_:1060596818519523338>  **Победителей:** ${winners}

Чтобы поучаствовать в розыгрыше вам необходимо:

 <a:_23_:1060596818519523338>  Находиться в любом голосовом канале со включенным микрофоном.  (Трибуна тоже считается за войс ) 
 <a:_23_:1060596818519523338>  Нажать на кнопку снизу

<a:950337336670060544:1056657718011756554>  Советуем внимательно ознакомиться с условиями конкурса, так как всё будет проверяться.`
            }
        }
        if (author.id !== config.owner_id && author.id !== '366561339726102530' && author.id !== '455817057565540365') {
            await interaction.reply({
                content: `${author}, ты щас пизды получишь! Не тройгай эту команду`,
                ephemeral: true
            }) 
            console.log(`Event: ${author.username} tried to use commands giveaway`)
            return
        }
        try {
            if (subcommand === 'create') {
                const row1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawayPrize')
                            .setLabel('Установить приз')
                            .setStyle(4),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawayLink')
                            .setLabel('Установить ссылку')
                            .setStyle(2),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawayTime')
                            .setLabel('Установить время')
                            .setStyle(4),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawayWinners')
                            .setLabel('Установить количество победителей')
                            .setStyle(4),
                    )
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawaySponsor')
                            .setLabel('Установить спонсора')
                            .setStyle(2),
                    )
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('buttonGiweawaySend')
                            .setLabel('Отправить')
                            .setStyle(2)
                            //.setDisabled(true),
                    )
                const embed = new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(text(prize, time, membersCount, winners, link, sponsor))
                    .setColor(config.color);
                await interaction.reply({
                    embeds: [embed],
                    components: [row1, row2],
                    fetchReply: true
                })
                .then ((send) => {
                    message = send
                })
                const filter = ButtonInteraction => ButtonInteraction.customId === 'buttonGiweawayPrize' || ButtonInteraction.customId === 'buttonGiweawayLink' || ButtonInteraction.customId === 'buttonGiweawayTime' || ButtonInteraction.customId === 'buttonGiweawayWinners' || ButtonInteraction.customId === 'buttonGiweawaySponsor'  || ButtonInteraction.customId === 'buttonGiweawaySend';

                const collector = message.createMessageComponentCollector({ filter, time: 600000 });

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
                    collector.resetTimer()
                    if (ButtonInteraction.customId === 'buttonGiweawayPrize') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalGiweawayPrize')
                            .setTitle(title);
                        const Input = new TextInputBuilder()
                            .setCustomId('modalGiweawayPrizeInput')
                            .setLabel('Введите приз')
                            .setPlaceholder('Приз')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(Input)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalGiweawayPrize';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            prize = ModalInteraction.components[0].components[0].value
                            row1.components[0].setStyle(3)
                            if (row1.components[0].data.style != 4 && row1.components[1].data.style != 4 && row1.components[2].data.style != 4 && row1.components[3].data.style != 4 && row1.components[4].data.style != 4) {
                                row2.components[0].setDisabled(false)
                            }
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row1, row2]
                            })
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonGiweawayLink') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalGiweawayLink')
                            .setTitle(title);
                        const Input = new TextInputBuilder()
                            .setCustomId('modalGiweawayLinkInput')
                            .setLabel('Введите ссылку')
                            .setPlaceholder('https://www.bestlink.com')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(Input)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalGiweawayLink';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            await ModalInteraction.deferUpdate()
                            link = ModalInteraction.components[0].components[0].value
                            row1.components[1].setStyle(3)
                            if (row1.components[4].data.style == 2) {
                                row1.components[4].setStyle(4)
                            }
                            if (row1.components[0].data.style != 4 && row1.components[1].data.style != 4 && row1.components[2].data.style != 4 && row1.components[3].data.style != 4 && row1.components[4].data.style != 4) {
                                row2.components[0].setDisabled(false)
                            }
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row1, row2]
                            })
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonGiweawayTime') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalGiweawayTime')
                            .setTitle(title);
                        const Input = new TextInputBuilder()
                            .setCustomId('modalGiweawayTimeInput')
                            .setLabel('Введите timestamp')
                            .setPlaceholder(`${Math.floor(Date.now()/1000)}`)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(Input)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalGiweawayTime';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            if (parseInt(ModalInteraction.components[0].components[0].value) != ModalInteraction.components[0].components[0].value) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, введите корректное значение`);
                                await ModalInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ModalInteraction.deferUpdate()
                            time = ModalInteraction.components[0].components[0].value
                            row1.components[2].setStyle(3)
                            if (row1.components[0].data.style != 4 && row1.components[1].data.style != 4 && row1.components[2].data.style != 4 && row1.components[3].data.style != 4 && row1.components[4].data.style != 4) {
                                row2.components[0].setDisabled(false)
                            }
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row1, row2]
                            })
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonGiweawayWinners') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalGiweawayWinners')
                            .setTitle(title);
                        const Input = new TextInputBuilder()
                            .setCustomId('modalGiweawayWinnersInput')
                            .setLabel('Введите количество победителей')
                            .setPlaceholder('1')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(Input)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalGiweawayWinners';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            if (parseInt(ModalInteraction.components[0].components[0].value) != ModalInteraction.components[0].components[0].value || parseInt(ModalInteraction.components[0].components[0].value)<0) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, введите корректное значение`);
                                await ModalInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ModalInteraction.deferUpdate()
                            winners = ModalInteraction.components[0].components[0].value
                            row1.components[3].setStyle(3)
                            if (row1.components[0].data.style != 4 && row1.components[1].data.style != 4 && row1.components[2].data.style != 4 && row1.components[3].data.style != 4 && row1.components[4].data.style != 4) {
                                row2.components[0].setDisabled(false)
                            }
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row1, row2]
                            })
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonGiweawaySponsor') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalGiweawaySponsor')
                            .setTitle(title);
                        const Input = new TextInputBuilder()
                            .setCustomId('modalGiweawaySponsorInput')
                            .setLabel('Введите ID спонсора')
                            .setPlaceholder(author.id)
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(Input)
                        modal.addComponents(firstActionRow)
                        await ButtonInteraction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalGiweawaySponsor';
                        ButtonInteraction.awaitModalSubmit({ filter, time: 360000 })
                        .then(async ModalInteraction => {
                            let sponsorId = ModalInteraction.components[0].components[0].value
                            let sponsor = await interaction.guild.members.fetch(sponsorId)
                            if (!sponsor) {
                                const errorEmbed = new EmbedBuilder()
                                    .setTitle(title)
                                    .setColor(config.colorError)
                                    .setDescription(`${author}, введите корректное значение`);
                                await ModalInteraction.reply({
                                    embeds: [errorEmbed],
                                    ephemeral: true
                                })
                                return
                            }
                            await ModalInteraction.deferUpdate()
                            row1.components[4].setStyle(3)
                            if (row1.components[1].data.style == 2) {
                                row1.components[1].setStyle(4)
                            }
                            if (row1.components[0].data.style != 4 && row1.components[1].data.style != 4 && row1.components[2].data.style != 4 && row1.components[3].data.style != 4 && row1.components[4].data.style != 4) {
                                row2.components[0].setDisabled(false)
                            }
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await interaction.editReply({
                                embeds: [embed],
                                components: [row1, row2]
                            })
                        })
                    }
                    if (ButtonInteraction.customId === 'buttonGiweawaySend') {
                        await ButtonInteraction.reply(`${author}, розыгрыш создан`)
                        const rowParticipate = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('buttongiweawayParticipate')
                                    .setLabel('Учавствовать')
                                    .setStyle(2)
                            )
                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            .setColor(config.color);
                        message1 = await giveawayChannel.send({
                            embeds: [embed],
                            components: [rowParticipate],
                        })
                        let value = {
                            prize: prize,
                            time: time,
                            membersCount: membersCount,
                            winners: winners,
                            link: link,
                            sponsor: sponsor,
                            members: [],
                            membersCount: 0,
                            winner: undefined
                        }
                        await addGiveaway(message1.id, value)
                        let now = Date.now()
                        const collector1 = message1.createMessageComponentCollector({ time: time*1000-now });

                        collector1.on('collect', async ButtonInteraction => {
                            const ButtonMember = ButtonInteraction.member;
                            const dict = readFromFile(message1.id)
                            console.log(2, dict)
                            if (dict.members.includes(ButtonMember.id)) {
                                await ButtonInteraction.reply({
                                    content: `${ButtonMember}, вы уже учавствуйте в розыгрыше`,
                                    ephemeral: true
                                })
                                return
                            }
                            addMember(message1.id, ButtonMember.id)
                            await ButtonInteraction.reply({
                                content: `${ButtonMember}, вы учавствуйте в розыгрыше`,
                                ephemeral: true
                            })
                            membersCount++
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor))
                            await message1.edit({
                                embeds: [embed],
                            })
                        })
                        collector1.on('end', async () => {
                            let winner
                            let channelId
                            config.giveaways[message1.id].membersCount = membersCount
                            while (!channelId || config.giveaways[message1.id].members.length != 0) {
                                winner = config.giveaways[message1.id].members[Math.floor(Math.random()*membersCount)]
                                channelId = winner.voice.channelId
                            }
                            if (config.giveaways[message1.id].members.length == 0) {

                            }
                            await author.send(`${author}, розыгрыш окончен, победитель: ${winner}`)
                            embed.setDescription(text(prize, time, membersCount, winners, link, sponsor).replace('Победителей', 'Победители'))
                            await message1.edit({
                                embeds: [embed],
                            })
                        })
                    }
                })
            }
            if (subcommand === 'manage') {

            }
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