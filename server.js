// Initialize an Express.js server
require('dotenv').config()
const port = process.env.PORT || 3000;
var express = require('express');
var app = express();

//import the express-ws library and set up WebSocket support on the app instance.
var expressWs = require('express-ws')(app);

// Get the IP address of the server
const os = require('os');
const ifaces = os.networkInterfaces();
let ipAddress = '';
Object.keys(ifaces).forEach((ifname) => {
    ifaces[ifname].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
            ipAddress = iface.address;
        }
    });
});
console.log(`Server IP address: ${ipAddress}`);

const path = require('path');
// Serve the index.html file
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, '', 'index.html');
    res.sendFile(indexPath);
});

app.get('/ping', (req, res) => {
    res.status(200).json({ message: 'pong', status: 200, data: null });
});

app.get('/test', (req, res) => {
    res.status(200).json({ message: 'test', status: 200, data: null });
});

// 'aWss' holds the WebSocketServer object for further configuration and handling.
var aWss = expressWs.getWss('/');

// Listen for new socket connections
app.ws('/', function (ws, req) {
    console.log('Client connected');
    // Listen for messages from clients
    ws.on('message', (message, isBinary) => {
        // log client from which the message was received
        var idMessage = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
        console.log(`Received message from [${idMessage}]: ${message}`);
        // Broadcast the received message to all connected clients
        aWss.clients.forEach(function (client) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(message)
            }
        });

    });
    // Handle client disconnect
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.listen(port, () => {
    console.log(`listening on *:${port}`)
});