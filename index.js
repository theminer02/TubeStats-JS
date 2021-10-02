// I do know that this does not work yet and is in no way the final code. Parts of this are still written in Python (HTTP requests)

const Discord = require("discord.js");
const client = new Discord.Client();
const keepAlive = require("./server");
const { DiscordInteractions } = require("slash-commands");

const botVersion = "v3.0-dev";

// ---

function showHelp() {
  commands =
    "__The commands:__\n\n**$help** - Shows this message.\n**$stats `channel`** - Provides stats for the specified YouTube channel. Use the channel ID (not the whole URL) or the name.\n---\n**Invite to your server** - <https://bit.ly/3AiZaUM>\n**Vote** - <https://bit.ly/2Xcsa29>";
  return commands;
}

// ---

function getChannelID(channel_name) {
  response = requests.get(
    "https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=relevance&q=" +
      channel_name +
      "&type=channel&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  return data["items"][0]["snippet"]["channelId"];
}

function getName(channel_id) {
  response = requests.get(
    "https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=relevance&q=" +
      channel_id +
      "&type=channel&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  try {
    return data["items"][0]["snippet"]["title"];
  } catch {
    return "n/a";
  }
}

function getProfilePic(channel_id) {
  response = requests.get(
    "https://www.googleapis.com/youtube/v3/channels?part=snippet&fields=items%2Fsnippet%2Fthumbnails%2Fdefault&id=" +
      channel_id +
      "&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  return data["items"][0]["snippet"]["thumbnails"]["default"]["url"];
}

function formatNumber(number) {
  parsedNr = int(number);
  locale.setlocale(locale.LC_ALL, "");
  formattedNumber = locale.format_string("%d", parsedNr, (grouping = True));
  return formattedNumber;
}

// Data for $stats

function stats_getSubs(channel_id) {
  response = requests.get(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" +
      channel_id +
      "&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  try {
    return data["items"][0]["statistics"]["subscriberCount"];
  } catch {
    return 0;
  }
}

function stats_getVideos(channel_id) {
  response = requests.get(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" +
      channel_id +
      "&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  return data["items"][0]["statistics"]["videoCount"];
}

function stats_getViews(channel_id) {
  response = requests.get(
    "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=" +
      channel_id +
      "&key=" +
      os.getenv("GOOGLEAPI")
  );
  data = json.loads(response.text);
  return data["items"][0]["statistics"]["viewCount"];
}

// ---

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    status: "online",
    activity: {
      name: "$help",
      type: "LISTENING",
      url: "https://www.youtube.com/theminer02",
    },
  });
});

// ---

client.on("message", (msg) => {
  if (msg.author.bot) return;


  // ---------------------------------------------------------------
  // $help - Shows how to use $stats.
  // ---------------------------------------------------------------

  if (msg.content === "$help") {
    msg.channel.send(showHelp());
    console.log(msg.guild.name + " / " + msg.channel.name + " - Help sent");
    return;
  }

  // ---------------------------------------------------------------
  // $stats - Provides the stats.
  // ---------------------------------------------------------------

  if (msg.content.startswith === "$stats") {
    var unknown_channel =
      "`I don't know this channel. Please try another one.`";
    try {
      channelName = msg.content.split("$stats ", 1)[1];
    } catch {
      msg.channel.send(unknown_channel);
      print(msg.guild.name + " / " + msg.channel.name + " - Empty channel");
      return;
    }

    var channel = getChannelID(channelName);
    var actualName = getName(channel);

    // Response:
    var yt_subs = stats_getSubs(channel);
    var yt_videos = stats_getVideos(channel);
    var yt_views = stats_getViews(channel);
    // ---
    var statsMessage = discord.Embed(
      (title = "YouTube Stats"),
      (description =
        "**Channel: ** [" +
        actualName +
        "](https://www.youtube.com/channel/" +
        channel +
        ")"),
      (color = 0xf50000)
    );
    statsMessage.set_thumbnail((url = getProfilePic(channel)));
    statsMessage.add_field(
      (name = "Subscribers"),
      (value = formatNumber(yt_subs)),
      (inline = False)
    );
    statsMessage.add_field(
      (name = "Total videos"),
      (value = formatNumber(yt_videos)),
      (inline = False)
    );
    statsMessage.add_field(
      (name = "Total views"),
      (value = formatNumber(yt_views)),
      (inline = False)
    );
    // ---
    msg.channel.send((embed = statsMessage));
    print(
      msg.guild.name + " / " + msg.channel.name + " - Stats sent - Channel: " + actualName + " (" + channel + ")");
    return;
  }

  keepAlive();
  client.login(process.env.TOKEN);
});
