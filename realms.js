const bedrock = require('bedrock-protocol')
const { EventEmitter } = require('stream');
const uuid = require('uuid');
const fs = require('fs');
const database = JSON.parse(fs.readFileSync('database.txt', 'utf-8'));
const client = []
var id = 0

const chat = new EventEmitter();
exports.chat = chat;
for (let s = 0; s < database.servers.length; s++) {
    client[s] = new bedrock.createClient({

        username: "Wilco",
        offline: false,
        realms: {
            realmInvite: `https://realms.gg/${database.servers[s].realm}`, // Connect the client to a Realm using the Realms invite URL or code
            // pickRealm: (realms) => realms.find(e => e.name === 'Realm Name') // Connect the client to a Realm using a function that returns a Realm
        }
    })
}



const sendCommand = async (command, s, timeout = 15000) => {
    return new Promise((resolve, reject) => {
        const requestId = uuid.v4()
        // const listenterTimeout = setTimeout(() => {
        //     client.removeListener('command_output', listener);
        //     reject('Recieved no response from server')
        // }, timeout)

        // const listener = (packet) => {
        //     if (packet.origin.uuid === requestId) {
        //         clearTimeout(listenterTimeout)
        //         resolve(packet)
        //     }
        // };

        // client[s].on('command_output', listener => {
        //     console.log(listener)
        //     id = listener.output[0].parameters[0]
        // })
        client[s].queue('command_request', {
            command,
            origin: {
                type: 'player',
                uuid: requestId,
                request_id: requestId,
            },
        })
    })
}

chat.on('command', (sender, tag, msg, s) => {
    sendCommand(msg, s)
})
chat.on('discord', (sender, tag, msg, s) => {
    sendCommand(`tellraw @a {"rawtext":[{"text":"§8[§9Discord§8] §7${sender}#${tag}: §f${msg}"}]}`, s)
})

for (let s = 0; s < database.servers.length; s++) {
    client[s].once('spawn', (p) => {

        sendCommand('scoreboard objectives add id dummy', s)
        sendCommand(`scoreboard players set @s id ${s}`, s).then(evd => {
            console.log(evd)
        })
        // sendCommand('list', s).then(console.log())
    })
}
for (let s = 0; s < database.servers.length; s++) {
    client[s].on('text', (packet) => { // Listen for chat messages
        if (packet.source_name) {
            console.log(packet)
            chat.emit('inGame', packet.source_name, packet.message, s)
        }
        // console.log('Received Text:', packet)
        // if (packet.type == 'json_whisper') {
        //     client.write('text', {
        //         type: 'chat', needs_translation: false, source_name: client.username, xuid: '', platform_chat_id: '',
        //         message: `${packet.source_name} said: ${packet.message} on ${new Date().toLocaleString()})`
        //     })
        // }
    })
}