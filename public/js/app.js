// Connect to Socket.io
const socket = io.connect();

// Log connection
socket.on('connect', () => {
    console.log('Connected to the server with ID:', socket.id);
});
