const net = require('net');

const socket = new net.Socket();
console.log("Connecting to interchange.proxy.rlwy.net:30041...");
socket.connect(30041, 'interchange.proxy.rlwy.net', () => {
  console.log("TCP socket connection established successfully!");
  socket.destroy();
});

socket.on('error', (err) => {
  console.error("Socket error:", err.message);
});

socket.on('close', () => {
  console.log("Socket closed");
});
