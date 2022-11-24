const bedrock = require('bedrock-protocol')
process.env.DEBUG = 'minecraft-protocol'
const { EventEmitter } = require('stream');
const fetch = require("node-fetch");
const uuid = require('uuid');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
var id = 0
const chat = new EventEmitter();
exports.chat = chat;
var client

if (config.realm) {
    client = bedrock.createClient({
        username: config.name,
        offline: false,
        realms: {
            realmInvite: config.invite
        }
    })
}


const sendCommand = async (command, timeout = 15000) => {
    return new Promise((resolve, reject) => {
        const requestId = uuid.v4()
        client.queue('command_request', {
            command,
            origin: {
                type: 'player',
                uuid: requestId,
                request_id: requestId,
            },
        })
    })
}


chat.on('command', (sender, tag, msg) => {
    sendCommand(msg)
})
chat.on('discord', (sender, tag, msg) => {
    sendCommand(`tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §7${sender}#${tag}: §f${msg}"}]}`)
})



client.on('text', (packet) => { // Listen for chat messages
    if (packet.source_name) {
        console.log(packet)
        chat.emit('inGame', packet.source_name, packet.message)
    }

})