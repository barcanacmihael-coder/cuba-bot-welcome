require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot je aktivan!'));
app.listen(process.env.PORT || 3000, () => console.log('Web server je spreman.'));

const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionsBitField, 
    ChannelType,
    MessageFlags
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// ================= === PODEŠAVANJA ====================
const CONFIG = {
    TOKEN: process.env.DISCORD_TOKEN,
    WELCOME_CHANNEL_ID: '1534981849775079435',
    RULES_CHANNEL_ID: '1534981980679180300',
    DONATIONS_CHANNEL_ID: '1534972479687364688',
    TICKET_PANEL_CHANNEL_ID: '1534983734539849950',
    IP_CHANNEL_ID: '1534981459473993918',

    // ================= ULOGE (ROLES) =================
    ROLES: {
        TICKET_SUPPORT: '1534972197620289636', 
        DISCORD_DEV: '1535594365391478794',     
        JEDINI_ZA_DONACIJE: '1534972300384931910',
        GLAVNI_ZA_STAFF: '1534972173918142484',
        ELECTRON_AC: '1534972176225140856',
        GLAVNI_ZA_LIDERE: '1534972180889338056'
    },
    // ================================================
     
    CATEGORIES: {
        pitanja: '1534972382379249764',
        donacije: '1534972381032874115',
        staff: '1534972379674181834',
        unban: '1534972383352328223',
        org: '1535056664468918342',
        zalbe: '1535056821088161832',
        cheater: '1535056980690075678'
    },
     
    THUMBNAIL_URL: 'https://i.imgur.com/iswtxsc.png', 
    TICKET_IMAGE_URL: 'https://imgur.com/FOJT2Yo.png'
};
// ======================================================

client.once('ready', () => {
    console.log(`[USPEH] Bot je online kao: ${client.user.tag}`);
});

// 1. WELCOME PORUKA
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#007AFF')
        .setAuthor({ 
            name: 'Cuba Roleplay', 
            iconURL: CONFIG.THUMBNAIL_URL 
        })
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { 
                name: 'Pravila', 
                value: `Sva pravila možeš pronaći u <#${CONFIG.RULES_CHANNEL_ID}>` 
            },
            { 
                name: 'Donacije', 
                value: `Sve informacije o donacijama možeš pronaći u <#${CONFIG.DONATIONS_CHANNEL_ID}>` 
            },
            { 
                name: 'IP Servera', 
                value: `IP servera i upute za ulazak možeš pronaći u <#${CONFIG.IP_CHANNEL_ID}>` 
            }
        )
        .setFooter({ 
            text: client.user.username, 
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

    const buttonsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel('Otvori Ticket')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${member.guild.id}/${CONFIG.TICKET_PANEL_CHANNEL_ID}`)
            .setEmoji('🎟️'),
        new ButtonBuilder()
            .setLabel('Donacije')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${member.guild.id}/${CONFIG.DONATIONS_CHANNEL_ID}`)
            .setEmoji('💸'),
        new ButtonBuilder()
            .setLabel('IP Servera')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${member.guild.id}/${CONFIG.IP_CHANNEL_ID}`)
            .setEmoji('🌐')
    );

    await channel.send({ 
        content: `${member} Dobrodošli na Cuba Roleplay!`, 
        embeds: [welcomeEmbed],
        components: [buttonsRow]
    }).catch(err => console.error('Greška pri slanju welcome poruke:', err));
});

// 2. KOMANDE (!setup-ticket I !close)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup-ticket') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const ticketPanelEmbed = new EmbedBuilder()
            .setColor('#1E1E1E')
            .setTitle('🎟️ CUBA ROLEPLAY - TICKET SISTEM')
            .setDescription(
                'Klikni na dugme ispod da otvoriš ticket:\n\n' +
                '❓ **Pitanja**\n' +
                '💸 **Donacije**\n' +
                '🛡️ **Prijava za staff**\n' +
                '🔨 **Unban**\n' +
                '👑 **Prijava za Org**\n' +
                '🚩 **Žalbe**\n' +
                '🚫 **Prijava Cheatera**'
            )
            .setImage(CONFIG.TICKET_IMAGE_URL);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_pitanja').setLabel('Pitanja').setEmoji('❓').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_donacije').setLabel('Donacije').setEmoji('💸').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_staff').setLabel('Prijava za staff').setEmoji('🛡️').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_unban').setLabel('Unban').setEmoji('🔨').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_org').setLabel('Prijava za Org').setEmoji('👑').setStyle(ButtonStyle.Primary)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_zalbe').setLabel('Žalbe').setEmoji('🚩').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_cheater').setLabel('Prijava Cheatera').setEmoji('🚫').setStyle(ButtonStyle.Danger)
        );

        await message.channel.send({ embeds: [ticketPanelEmbed], components: [row1, row2] });
        message.delete().catch(() => {});
    }

    if (message.content === '!close') {
        const allowedRolesList = Object.values(CONFIG.ROLES);
        const hasPermissionRole = message.member.roles.cache.some(role => allowedRolesList.includes(role.id));
        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasPermissionRole && !isAdmin) {
            return message.reply('Nemaš ovlašćenje za zatvaranje tiketa!');
        }

        await message.channel.send('Tiket će biti obrisan za 5 sekundi...');
         
        const channelId = message.channel.id;
        setTimeout(async () => {
            const ch = message.guild.channels.cache.get(channelId) || await message.guild.channels.fetch(channelId).catch(() => null);
            if (ch) ch.delete().catch(() => {});
        }, 5000);
    }
});

// 3. RUKOVANJE TIKETIMA I PRISTUPNIM DOZVOLAMA
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId.startsWith('ticket_')) {
        const categoryType = interaction.customId.replace('ticket_', '');
         
        const categoriesData = {
            'pitanja': { 
                name: 'Pitanja / Pomoć', 
                prefix: 'pitanja', 
                catId: CONFIG.CATEGORIES.pitanja,
                allowedRoles: [CONFIG.ROLES.TICKET_SUPPORT, CONFIG.ROLES.DISCORD_DEV]
            },
            'donacije': { 
                name: 'Donacije', 
                prefix: 'donacije', 
                catId: CONFIG.CATEGORIES.donacije,
                allowedRoles: [CONFIG.ROLES.DISCORD_DEV, CONFIG.ROLES.JEDINI_ZA_DONACIJE]
            },
            'staff': { 
                name: 'Prijava Za Staff', 
                prefix: 'staff', 
                catId: CONFIG.CATEGORIES.staff,
                allowedRoles: [CONFIG.ROLES.GLAVNI_ZA_STAFF, CONFIG.ROLES.DISCORD_DEV]
            },
            'unban': { 
                name: 'Zahtev za unban', 
                prefix: 'unban', 
                catId: CONFIG.CATEGORIES.unban,
                allowedRoles: [CONFIG.ROLES.DISCORD_DEV, CONFIG.ROLES.ELECTRON_AC, CONFIG.ROLES.TICKET_SUPPORT]
            },
            'org': { 
                name: 'Prijava Org', 
                prefix: 'prijava-org', 
                catId: CONFIG.CATEGORIES.org,
                allowedRoles: [CONFIG.ROLES.GLAVNI_ZA_LIDERE, CONFIG.ROLES.DISCORD_DEV]
            },
            'zalbe': { 
                name: 'Žalbe', 
                prefix: 'zalba', 
                catId: CONFIG.CATEGORIES.zalbe,
                allowedRoles: [CONFIG.ROLES.DISCORD_DEV, CONFIG.ROLES.GLAVNI_ZA_STAFF]
            },
            'cheater': { 
                name: 'Prijava Cheatera', 
                prefix: 'cheater', 
                catId: CONFIG.CATEGORIES.cheater,
                allowedRoles: [CONFIG.ROLES.DISCORD_DEV, CONFIG.ROLES.TICKET_SUPPORT]
            }
        };

        const selected = categoriesData[categoryType];
        if (!selected) return;

        const cleanUsername = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        const channelName = `${selected.prefix}-${cleanUsername}`;

        const existingChannel = interaction.guild.channels.cache.find(c => c.name === channelName);
        if (existingChannel) {
            return interaction.reply({ 
                content: `Već imate otvoren ticket u kategoriji **${selected.name}**: ${existingChannel}`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const permissionOverwrites = [
            {
                id: interaction.guild.id, 
                deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
                id: interaction.user.id, 
                allow: [
                    PermissionsBitField.Flags.ViewChannel, 
                    PermissionsBitField.Flags.SendMessages, 
                    PermissionsBitField.Flags.AttachFiles,
                    PermissionsBitField.Flags.ReadMessageHistory
                ]
            }
        ];

        selected.allowedRoles.forEach(roleId => {
            if (roleId) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel, 
                        PermissionsBitField.Flags.SendMessages, 
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ]
                });
            }
        });

        const targetCategory = interaction.guild.channels.cache.get(selected.catId);

        const ticketChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: targetCategory ? targetCategory.id : null,
            permissionOverwrites: permissionOverwrites
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#00FFFF')
            .setTitle(`🎟️ Tiket - ${selected.name}`)
            .setDescription(`Zdravo ${interaction.user} !\n\nNadležni tim će ti odgovoriti uskoro.\nKoristi dugmad ispod ili komandu **!close** za upravljanje tiketom.`)
            .setImage(CONFIG.TICKET_IMAGE_URL);

        const controlButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('claim_ticket')
                .setLabel('Preuzmi tiket')
                .setEmoji('✋')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Zatvori tiket')
                .setEmoji('🔒')
                .setStyle(ButtonStyle.Danger)
        );

        const pingRoles = selected.allowedRoles.map(r => `<@&${r}>`).join(' ');

        await ticketChannel.send({ 
            content: `${pingRoles ? pingRoles + ' | ' : ''}Tiket otvorio: ${interaction.user}`,
            embeds: [ticketEmbed], 
            components: [controlButtons] 
        });

        await interaction.editReply({ content: `Vaš ticket (${selected.name}) je uspešno otvoren: ${ticketChannel}` });
    }

    // --- PREUZIMANJE TIKETA ---
    if (interaction.customId === 'claim_ticket') {
        const allowedRolesList = Object.values(CONFIG.ROLES);
        const hasPermissionRole = interaction.member.roles.cache.some(role => allowedRolesList.includes(role.id));
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasPermissionRole && !isAdmin) {
            return interaction.reply({ 
                content: 'Nemaš dozvolu da preuzmeš ovaj tiket!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const originalRow = interaction.message.components[0];
        const updatedRow = new ActionRowBuilder();

        originalRow.components.forEach(component => {
            const button = ButtonBuilder.from(component);
            if (button.data.custom_id === 'claim_ticket') {
                button.setDisabled(true);
                button.setLabel(`Preuzeo/la: ${interaction.user.username}`);
            }
            updatedRow.addComponents(button);
        });

        await interaction.update({ components: [updatedRow] });
        await interaction.followUp({ content: `✋ Tiket je preuzeo/la ${interaction.user}.` });
    }

    // --- ZATVARANJE TIKETA DUGMETOM ---
    if (interaction.customId === 'close_ticket') {
        const allowedRolesList = Object.values(CONFIG.ROLES);
        const hasPermissionRole = interaction.member.roles.cache.some(role => allowedRolesList.includes(role.id));
        const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

        if (!hasPermissionRole && !isAdmin) {
            return interaction.reply({ 
                content: 'Nemaš dozvolu da zatvoriš ovaj tiket!', 
                flags: MessageFlags.Ephemeral 
            });
        }

        await interaction.reply({ content: 'Tiket će biti obrisan za 5 sekundi...' });
         
        const channelId = interaction.channelId;
        const guild = interaction.guild;

        setTimeout(async () => {
            const ch = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
            if (ch) ch.delete().catch(() => {});
        }, 5000);
    }
});

client.login(CONFIG.TOKEN);
