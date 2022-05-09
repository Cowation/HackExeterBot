require("dotenv").config();
const cron = require("node-cron");
const Discord = require("discord.js");
const fs = require("fs/promises");
const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES
  ],
  partials: [
    "CHANNEL"
  ]
});

const getUsers = async () => {
  const guild = await client.guilds.fetch("960286927741919263");
  const members = await guild.members.fetch();
  const users = members.map(member => member.user);

  return users;
}

const infoEmbed = {
  title: "HackExeter 2022",
  color: "#C70039",
  description: "A hackathon hosted by Phillips Exeter Academy.",
  thumbnail: {
    url: "https://cdn.discordapp.com/app-icons/843140101663621162/12dcc36445b6936bd6e2e47dd8f81e3f.png?size=128"
  },
  fields: [
    {
      name: "Schedule:",
      value: "[Visit #schedule](https://discord.com/channels/960286927741919263/960286928119423073)",
      inline: true
    },
    {
      name: "Questions:",
      value: "[Visit #questions](https://discord.com/channels/960286927741919263/960286928429781014)",
      inline: true
    },
    {
      name: "Coding help:",
      value: "[Visit #coding-help](https://discord.com/channels/960286927741919263/960286928429781015)",
      inline: true
    },
    {
      name: "General info:",
      value: "[Visit Devpost](https://hack-exeter-2022.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Upcoming)",
      inline: true
    }
  ],
  timestamp: new Date(),
  footer: {
    text: "HACKEXETER.COM"
  }
}

const notifyAll = async (event) => {
  const users = await getUsers();
  for (const user of users) {
    user.send({
      content: "EVENT: " + event.name,
      embeds: [event.embed]
    })
      .catch(`Couldn't notify ${user.tag}`);
  }
}

client.once("ready", async () => {
  console.log("Bot ready!");
  client.user.setActivity({ name: "dm !help for info", type: "PLAYING" });

  const events = JSON.parse(await fs.readFile("./events.json"));
  for (const event of events) {
    cron.schedule(event.startTime, async () => {
      await notifyAll(event);
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.channel.type != "DM") return;

  try {
    switch (message.content.toLowerCase()) {
      case "!help":
        message.channel.send({
          embeds: [infoEmbed]
        });
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.BOT_TOKEN);