const { Events, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits, PermissionsBitField, PermissionOverwrites } = require('discord.js');
const config = require('../config.json');
const wait = require('node:timers/promises').setTimeout;
const { QueryTypes } = require('sequelize')

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    async execute(interaction, connection) {
        try {
            if (interaction.isButton()) {
                const author = interaction.member
                const voice = author.voice.channel
                let sqlResult
                if (interaction.customId === 'ButtonSettingsEditName' || interaction.customId === 'ButtonSettingsEditLimit' || interaction.customId === 'ButtonSettingsLockAll' || interaction.customId === 'ButtonSettingsUnlockAll' || interaction.customId === 'ButtonSettingsLockMember' || interaction.customId === 'ButtonSettingsUnlockMember' || interaction.customId === 'ButtonSettingsKick' || interaction.customId === 'ButtonSettingsOwner') {
                    const Embed = new EmbedBuilder()
                        .setTitle("Управление голосовым каналом")
                    if (!voice) {
                        Embed
                            .setDescription(`${author}, вы должны находиться в войсе`)
                            .setColor(config.colorError);
                        await interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                        return
                    }
                    await connection
                        .query(`SELECT * FROM autovoice WHERE channelid  = ${voice.id}`, {
                            type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                    })
                    .then((result) => sqlResult = result)
                    .catch((err) => {
                        console.log(`SQL: Error ${err}`)
                        Embed
                            .setDescription(`${author}, вы должны находиться в созданном войсе`)
                            .setColor(config.colorError);
                        interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        }) 
                        return
                    })
                    if (!sqlResult[0]) {
                        Embed
                            .setDescription(`${author}, вы должны находиться в созданном войсе`)
                            .setColor(config.colorError);
                        interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (sqlResult[0].memberid !== author.id) {
                        Embed
                            .setDescription(`${author}, вы должны находиться в созданном войсе`)
                            .setColor(config.colorError);
                        interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        }) 
                        return
                    }
                    if (interaction.customId === 'ButtonSettingsEditName') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceEditName')
                            .setTitle('Изменить название голосового канала');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceEditNameInput')
                            .setLabel('Введите новое название')
                            .setPlaceholder('Голсовой канал')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(30)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceEditName';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            let nameInput = ModalInteraction.components[0].components[0].value
                            await voice.edit({
                                name: nameInput
                            })
                            Embed
                                .setDescription(`${author}, название канала успешно изменено`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsEditLimit') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceEditLimit')
                            .setTitle('Изменить лимит голосового канала');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceEditLimitInput')
                            .setLabel('Введите новый лимит')
                            .setPlaceholder('1')
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(2)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceEditLimit';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            let limitInput = ModalInteraction.components[0].components[0].value
                            if (limitInput != parseInt(limitInput) || limitInput < 0 || limitInput > 100) {
                                Embed
                                    .setDescription(`${author}, введите корректное число от 0 до 99`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            await voice.setUserLimit(parseInt(limitInput))
                            Embed
                                .setDescription(`${author}, лимит успешно изменён`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsLockAll') {
                        if (voice.parentId === '1144740682280480889') {
                            await voice.permissionOverwrites.edit(interaction.guild.id, {
                                Connect: false
                            });
                        } else {
                            await connection
                                .query(`SELECT roleid FROM clans WHERE categoryid  = ${voice.parentId}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            .then((result) => sqlResult = result)
                            .catch((err) => {
                                console.log(`SQL: Error ${err}`)
                                Embed
                                    .setDescription(`${author}, вы должны находиться в созданном войсе`)
                                    .setColor(config.colorError);
                                interaction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                }) 
                                return
                            })
                            await voice.permissionOverwrites.edit(sqlResult[0].roleid, {
                                Connect: false
                            });
                        }
                        Embed
                            .setDescription(`${author}, канал закрыт для всех`)
                            .setColor(config.color);
                        await interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsUnlockAll') {
                        if (voice.parentId === '1144740682280480889') {
                            await voice.permissionOverwrites.edit(interaction.guild.id, {
                                Connect: null
                            });
                        } else {
                            await connection
                                .query(`SELECT roleid FROM clans WHERE categoryid  = ${voice.parentId}`, {
                                    type: QueryTypes.SELECT, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            .then((result) => sqlResult = result)
                            .catch((err) => {
                                console.log(`SQL: Error ${err}`)
                                Embed
                                    .setDescription(`${author}, вы должны находиться в созданном войсе`)
                                    .setColor(config.colorError);
                                interaction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                }) 
                                return
                            })
                            await voice.permissionOverwrites.edit(sqlResult[0].roleid, {
                                Connect: true
                            });
                        }
                        Embed
                            .setDescription(`${author}, канал открыт для всех`)
                            .setColor(config.color);
                        await interaction.reply({
                            embeds: [Embed],
                            ephemeral: true
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsLockMember') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceLockMember')
                            .setTitle('Забрать доступ к комнате у пользователя');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceLockMemberInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(20)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceLockMember';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            const idInput = ModalInteraction.components[0].components[0].value
                            const member = await interaction.guild.members.fetch(idInput)
                            if (!member) {
                                Embed
                                    .setDescription(`${author}, пользователь не найден`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            await voice.permissionOverwrites.edit(member, {
                                Connect: false
                            });
                            Embed
                                .setDescription(`${author}, канал закрыт для ${member}`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsUnlockMember') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceUnlockMember')
                            .setTitle('Вернуть доступ к комнате пользователю');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceUnlockMemberInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(20)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceUnlockMember';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            const idInput = ModalInteraction.components[0].components[0].value
                            const member = await interaction.guild.members.fetch(idInput)
                            if (!member) {
                                Embed
                                    .setDescription(`${author}, пользователь не найден`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            await voice.permissionOverwrites.edit(member, {
                                Connect: true
                            });
                            Embed
                                .setDescription(`${author}, канал открыт для ${member}`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsKick') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceKickMember')
                            .setTitle('Кикнуть пользователя');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceKickMemberInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(20)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceKickMember';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            const idInput = ModalInteraction.components[0].components[0].value
                            const member = await interaction.guild.members.fetch(idInput)
                            if (!member) {
                                Embed
                                    .setDescription(`${author}, пользователь не найден`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            console.log(!member.voice.channelId, member.voice.channelId !== voice.id)
                            if (!member.voice.channelId || member.voice.channelId !== voice.id) {
                                Embed
                                    .setDescription(`${author}, пользователь должен находится в вашем войсе`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            await voice.permissionOverwrites.edit(member, {
                                Connect: false
                            });
                            await member.voice.disconnect()
                            Embed
                                .setDescription(`${author}, вы кикнули ${member} из голосового канала`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    if (interaction.customId === 'ButtonSettingsOwner') {
                        const modal = new ModalBuilder()
                            .setCustomId('modalAutoVoiceOwner')
                            .setTitle('Сменить владельца комнаты');
                        const input = new TextInputBuilder()
                            .setCustomId('modalAutoVoiceOwnerInput')
                            .setLabel('Введите ID пользователя')
                            .setPlaceholder(`${author.id}`)
                            .setStyle(TextInputStyle.Short)
                            .setMaxLength(20)
                            .setRequired(true)
                        const firstActionRow = new ActionRowBuilder().addComponents(input)
                        modal.addComponents(firstActionRow)
                        await interaction.showModal(modal);
                        const filter = (ModalInteraction) => ModalInteraction.customId === 'modalAutoVoiceOwner';
                        interaction.awaitModalSubmit({ filter, time: 300000 })
                        .then(async ModalInteraction => {
                            const idInput = ModalInteraction.components[0].components[0].value
                            const member = await interaction.guild.members.fetch(idInput)
                            if (!member) {
                                Embed
                                    .setDescription(`${author}, пользователь не найден`)
                                    .setColor(config.colorError);
                                await ModalInteraction.reply({
                                    embeds: [Embed],
                                    ephemeral: true
                                })
                                return
                            }
                            await connection
                                .query(`UPDATE autovoice SET memberid = ${member.id} WHERE channelid = ${voice.id}`, {
                                    type: QueryTypes.UPDATE, //тип запроса: SELECT | INSERT | UPDATE | DELETE ...
                            })
                            Embed
                                .setDescription(`${author}, вы передали владение комнатой ${member}`)
                                .setColor(config.color);
                            await ModalInteraction.reply({
                                embeds: [Embed],
                                ephemeral: true
                            })
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                }
                if (interaction.customId === 'ButtonVerefBoy' || interaction.customId === 'ButtonVerefGirl' || interaction.customId === 'ButtonVerefNA') {
                    const author = interaction.member
                    let msg;
                    const logChannelRoles = await interaction.guild.channels.cache.find(channel1 => channel1.name === `${config.logRoles}`);
                    const Embed = new EmbedBuilder()
                        .setTitle("Выдача гендера")
                        .setDescription(`\`\`\`ini
ведите [ID] пользователя
\`\`\``)
                        .setColor(config.color)
                    await interaction.reply({
                        content: `${interaction.member}`,
                        embeds: [Embed],
                        ephemeral: true,
                        fetchReply: true
                    })
                    .then ((mes) => {
                        msg = mes
                    })
                    const filter = messageEditRole => messageEditRole.author.id === author.id;

                    const collector1 = interaction.channel.createMessageCollector({filter, time: 60000 });

                    collector1.on('collect', async message => {
                        collector1.stop()
                        await message.delete()
                        .catch((err) => {
    
                        })
                        let member = await interaction.guild.members.fetch(message.content)
                        if (!member) {
                            await interaction.editReply({
                                content: 'пользователь не найден',
                                embeds: [],
                                ephemeral: true,
                            })
                            return
                        }
                        let roleGirl = await interaction.guild.roles.fetch('1111399415836585984')
                        .catch((err) => {

                        })
                        let roleBoy = await interaction.guild.roles.fetch('1111399030266806372')
                        .catch((err) => {

                        })
                        let roleNA = await interaction.guild.roles.fetch('1111399549995589724')
                        .catch((err) => {

                        })
                        if (interaction.customId === 'ButtonVerefNA') {
                            await member.roles.add(roleNA)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleGirl)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleNA}(${roleNA.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                        if (member.user.createdTimestamp > Date.now()-1000*60*60*24*5) {
                            const embed = new EmbedBuilder()
                                .setTitle("Внимание!")
                                .setThumbnail('https://media.discordapp.net/attachments/896101179870818374/1106206539481628743/warning.png')
                                .setDescription(`\`\`\`ini
Данный аккаунт создан менее [5 дней] назад, верефикация невозможна
\`\`\``)
                                .setColor(config.colorError)
                            await interaction.editReply({
                                embeds: [embed],
                                ephemeral: true
                            })
                            return
                        }
                        if (interaction.customId === 'ButtonVerefGirl') {
                            await member.roles.add(roleGirl)
                            await member.roles.remove(roleBoy)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleGirl}(${roleGirl.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        } else if (interaction.customId === 'ButtonVerefBoy') {
                            await member.roles.add(roleBoy)
                            await member.roles.remove(roleGirl)
                            await member.roles.remove(roleNA)
                            const LogEmbed = new EmbedBuilder()
                                .setTitle("**Member role add**")
                                .setColor("#00ff00")
                                .setDescription(`[1] ${author}(${author.id})\n[2] Member role add\n[3] ${member}(${member.id})\n[4] ${roleBoy}(${roleBoy.id})\n[5] Verefication`)
                                .setFooter({text: `${author.id} • ${interaction.guild.name}`})
                                .setTimestamp();
                            await logChannelRoles.send({
                                embeds: [LogEmbed]
                            })
                            return
                        }
                    })
                }
            }
        } catch(err) {
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
            console.log(`[${time}] Event: interation create ${err}`)
        }
    },
};