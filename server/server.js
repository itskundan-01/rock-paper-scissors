const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();

// Create an HTTP server and attach socket.io
const server = http.createServer(app);
const io = socketIO(server);

const compression = require('compression');
app.use(compression());

// Set up middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/rock-paper-scissors', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    // Listen for disconnections
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Listen for game moves and emit the move to the other player
    socket.on('moveMade', (data) => {
        const { gameId, playerMove } = data;
        // Emit move update to the specific game room
        io.to(gameId).emit('moveUpdate', playerMove);
    });
});

// Express route for authentication and other routes
app.use('/api/auth', require('./routes/auth'));

// Set up the port for the server
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
