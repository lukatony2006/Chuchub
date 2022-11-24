const fs = require('fs')
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
var chat
if (config.realm == true) {
    chat = require('./nonrealms').chat;
}
else {
    chat = require('./ws').chat;
}
const { Client, BitField } = require('discord.js')
const client = new Client({ intents: ["GUILD_MESSAGES", "GUILDS", "MESSAGE_CONTENT"] });
require('dotenv/config')

const { addMessage } = require('./ws')


// const plugin = fs.readFileSync('plugins/chatranks.js', 'utf-8')


client.on('ready', evd => {
    console.log(`Logged in as ${evd.user.username}`)
})

client.on('messageCreate', evd => {
    let prefix = '$';
    let msg = evd.content;
    let sender = evd.author;
    console.log(msg)
    var args = msg.slice(prefix.length).split(' ')
    var cmd = args[0]
    var admins = config.admins
    if (evd.channel.id == config.channel && sender.id != client.user.id) {
        if (msg.startsWith(prefix)) {
            if (!admins.includes(sender.id)) {
                evd.reply('You do not have permission to use in game commands')
                return
            }
            if (evd.channelId == config.channel) {
                chat.emit('command', sender.username, sender.discriminator, msg.slice(prefix.length))
            }
        }
        else {
            if (evd.channelId == config.channel) {
                chat.emit('discord', sender.username, sender.discriminator, msg)
            }
        }
    }

})

chat.on('inGame', (sender, msg) => {
    client.guilds.fetch(config.guild).then(async guild => {
        const channel = await guild.channels.fetch(config.channel)
        channel.send(`[In Game] **${sender}**: ${msg}`)
    })
})

client.login(config.token)
