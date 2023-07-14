require('dotenv').config(); // Загрузка переменных окружения из файла .env
const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS, // Добавляем интент для получения информации о участниках сервера
  ],
});

const prefix = '.';
const boosterChannelId = '1004458626112553032'; // Замените на актуальные идентификаторы каналов
const voiceOnlineChannelId = '1003721463163011092';
const totalOnlineChannelId = '1004458614448214086';

let boosterCount = 0;
let voiceOnlineCount = 0;
let totalOnlineCount = 0;

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  startStatisticsUpdates();
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const { commandName } = interaction;

    if (commandName === 'stats') {
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId('boosters')
          .setLabel('Boosters')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('voiceOnline')
          .setLabel('Voice Online')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setCustomId('totalMembers')
          .setLabel('Total Members')
          .setStyle('PRIMARY')
      );

      const replyOptions = {
        content: 'Server Statistics',
        components: [row],
      };

      await interaction.reply(replyOptions);
    }
  } else if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId === 'boosters') {
      // Обработка нажатия кнопки Boosters
      await interaction.reply(`Boosters: ${boosterCount}`);
    } else if (customId === 'voiceOnline') {
      // Обработка нажатия кнопки Voice Online
      await interaction.reply(`Voice Online: ${voiceOnlineCount}`);
    } else if (customId === 'totalMembers') {
      // Обработка нажатия кнопки Total Members
      await interaction.reply(`Total Members: ${totalOnlineCount}`);
    }
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  const guild = newState.guild;

  if (guild) {
    try {
      if (newState.channel?.type === 'GUILD_VOICE') {
        // Обновляем статистику только если произошло изменение в голосовом состоянии

        voiceOnlineCount = await getVoiceOnlineCount(guild);

        if (voiceOnlineChannelId) {
          const voiceOnlineChannel = await guild.channels.fetch(voiceOnlineChannelId);
          if (voiceOnlineChannel) {
            voiceOnlineChannel.setName(`Голосовой онлайн: ${voiceOnlineCount}`);
          }
        }
      }

      if (totalOnlineChannelId) {
        const totalOnlineChannel = await guild.channels.fetch(totalOnlineChannelId);
        if (totalOnlineChannel) {
          totalOnlineCount = await getTotalOnlineCount(guild);
          totalOnlineChannel.setName(`Участников: ${totalOnlineCount}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    }
  }
});

async function startStatisticsUpdates() {
  const guildId = '872606676908408843';
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.log('Invalid server ID');
    return;
  }

  try {
    boosterCount = await getBoosterCount(guild);
    voiceOnlineCount = await getVoiceOnlineCount(guild);
    totalOnlineCount = await getTotalOnlineCount(guild);

    if (boosterChannelId) {
      const boosterChannel = await guild.channels.fetch(boosterChannelId);
      if (boosterChannel) {
        boosterChannel.setName(`Бустеров: ${boosterCount}`);
      }
    }

    if (voiceOnlineChannelId) {
      const voiceOnlineChannel = await guild.channels.fetch(voiceOnlineChannelId);
      if (voiceOnlineChannel) {
        voiceOnlineChannel.setName(`Голосовой онлайн: ${voiceOnlineCount}`);
      }
    }

    if (totalOnlineChannelId) {
      const totalOnlineChannel = await guild.channels.fetch(totalOnlineChannelId);
      if (totalOnlineChannel) {
        totalOnlineChannel.setName(`Участников: ${totalOnlineCount}`);
      }
    }
  } catch (error) {
    console.error('Ошибка при обновлении статистики:', error);
  }

  setInterval(async () => {
    try {
      boosterCount = await getBoosterCount(guild);
      voiceOnlineCount = await getVoiceOnlineCount(guild);
      totalOnlineCount = await getTotalOnlineCount(guild);

      if (boosterChannelId) {
        const boosterChannel = await guild.channels.fetch(boosterChannelId);
        if (boosterChannel) {
          boosterChannel.setName(`Бустеров: ${boosterCount}`);
        }
      }

      if (voiceOnlineChannelId) {
        const voiceOnlineChannel = await guild.channels.fetch(voiceOnlineChannelId);
        if (voiceOnlineChannel) {
          voiceOnlineChannel.setName(`Голосовой онлайн: ${voiceOnlineCount}`);
        }
      }

      if (totalOnlineChannelId) {
        const totalOnlineChannel = await guild.channels.fetch(totalOnlineChannelId);
        if (totalOnlineChannel) {
          totalOnlineChannel.setName(`Участников: ${totalOnlineCount}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении статистики:', error);
    }
  }, 15000); // Обновление статистики раз в 15 секунд
}

async function getBoosterCount(guild) {
  try {
    const guildPreview = await guild.fetch();
    return guildPreview.premiumSubscriptionCount;
  } catch (error) {
    console.error(error);
    return 'Error fetching booster count';
  }
}

async function getVoiceOnlineCount(guild) {
  let count = 0;

  guild.channels.cache.forEach((channel) => {
    if (channel.type === 'GUILD_VOICE') {
      count += channel.members.size;
    }
  });

  return count;
}

async function getTotalOnlineCount(guild) {
  try {
    await guild.members.fetch();
    return guild.memberCount;
  } catch (error) {
    console.error(error);
    return 'Error fetching total member count';
  }
}

client.login(process.env.TOKEN); // Запуск бота с использованием токена из переменной окружения
