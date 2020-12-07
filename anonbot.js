// Global Variables
var anonymousMsg = "";
let msgSender = null;
let senderID = null;
let common = [];
let emojis = ['🐶', '🐱', '🐭', '🐹']
let numEmojis = 0;

const channelName = "anonbot";

const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.BOT_TOKEN);

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {
  // Takes the message from user
  if (message.channel.type === 'dm' && !message.author.bot) {
    anonMsg = message;
    anonymousMsg = message.content;
    msgSender = message.author.username
    senderID = message.author.id
    common = [];
    getCommon(message);
  }

  if (message.author.bot && message.channel.type === 'dm') {
    for (i = 0; i < numEmojis; i++) {
      message.react(emojis[i]);
    }

    const filter = (reaction, user) => {
      return emojis.includes(reaction.emoji.name) && user.id === anonMsg.author.id;
    };

    message.awaitReactions(filter, {max: 1, time: 60000, error: ['time'] })
    .then(collected => {
      const reaction = collected.first();

      if (reaction.emoji.name === emojis[0]) {
        sendMessage(common[0].serverID, anonymousMsg)
      } else if (reaction.emoji.name === emojis[1]) {
        sendMessage(common[1].serverID, anonymousMsg)
      } else if (reaction.emoji.name === emojis[2]) {
        sendMessage(common[2].serverID, anonymousMsg)
      } else if (reaction.emoji.name === emojis[3]) {
        sendMessage(common[3].serverID, anonymousMsg)
      }
    })
    .catch(collected => {
      message.reply("took too long.");
    })
  }
});

// To get a list of mutual servers
async function getCommon(orignalMessage) {
  let count = 0;
  client.guilds.cache.forEach(counting => {
    count++;
  });
  let lastGuild = null;
  let innerCounter = 0;
  client.guilds.cache.forEach(guild => {
    innerCounter++;
    if (innerCounter == count) {
      lastGuild = guild;
    }
  });
  
  client.guilds.cache.forEach(guild => {
    guild.members.fetch(senderID).then(_ => {
  
      guild.members.cache.each(member => {
  
        if (member.user.id == senderID) {
          let toAdd = {
            "serverID": guild.id,
            "serverName": guild.name,
            "userID": member.user.id,
            "userName": member.user.username
          };
  
          addCommon(toAdd);
        }
      });
      if (lastGuild == guild) {
        numEmojis = common.length;
        let chooseServer = "To which server would you like to write to?";
        for (i = 0; i < common.length; i++)  {
          chooseServer += "\n" + emojis[i] + common[i].serverName;
        }
        orignalMessage.author.send(chooseServer)
      }
    })
  });
}


function addCommon(element) {
  let serverID = element["serverID"];
  let add = true;
  common.forEach(server => {
    if (server["serverID"] == serverID) {
      add = false;
    }
  });
  if (add) {
    common.push(element);
  }
}

function sendMessage(serverID, message){
  let guild = client.guilds.cache.get(serverID);
  const channel = guild.channels.cache.find(channel => channel.name === channelName)
    channel.send(message);
}