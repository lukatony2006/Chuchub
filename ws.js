const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');
const chat = new EventEmitter()
// exports.chat = chat
const messages = {};
var output
const server = http.createServer((req, res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk
    })
    req.on('end', () => {
        res.setHeader('Content-Type', 'text/plain');
        const path = req.url.slice(1)
        // console.log(path, req.method);
        switch (req.method) {
            case 'POST':
                var data = JSON.parse(body)
                switch (path) {
                    case 'chat':
                        chat.emit('inGame', data.sender, data.msg)
                        break
                }
                break
            case 'GET':
                const msgs = messages[path]
                if (!msgs) {
                    res.writeHead(404)
                    res.end()
                    return
                }
                if (msgs) {
                    res.writeHead(200)
                    res.end(JSON.stringify(msgs))
                    // console.log(msgs)
                    messages[path] = []
                }
                break
        }
        res.end()
    })

});

server.listen(9000);


chat.on('discord', (sender, tag, msg) => {
    let formatted = `§8[§9Discord§8] §7${sender}#${tag}: §f${msg}`;
    addMessage('chat', formatted)
})
chat.on('command', (sender, tag, msg) => {
    let formatted = `[Discord] ${sender}#${tag}: ${msg}`;
    addMessage('chat', formatted)
})

function addMessage(path, message) {
    if (!messages[path]) messages[path] = []
    messages[path].push(message.slice(0, 400))
}
module.exports = {
    addMessage,
    chat
}