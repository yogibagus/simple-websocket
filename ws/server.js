// Initialize a WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8090 });

// Initialize an Express.js server
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

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
console.log('Server started on port 8090');

const path = require('path');
// Serve the index.html file
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '..', 'index.html');
  res.sendFile(indexPath);
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

// Listen for new socket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Listen for messages from clients
  ws.on('message', (message, isBinary) => {
    // log client from which the message was received
    idMessage = ws._socket.remoteAddress + ":" + ws._socket.remotePort;
    console.log(`Received message from [${idMessage}]: ${message}`);
    // Broadcast the received message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        console.log(`Broadcasting message to [${client._socket.remoteAddress}:${client._socket.remotePort}] with message: ${message}`);
        client.send(message, { binary: isBinary });
      }
    });
  });
  // Handle client disconnect
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});