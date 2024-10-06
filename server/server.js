const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();  // Initialize app before use
const server = http.createServer(app);
const io = socketIo(server);

// This is for routing the request
const cors = require('cors');
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json());

// Database Connection
mongoose.connect('mongodb://localhost:27017/rock-paper-scissors', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Set up a basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Socket.io Connection Handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join game session
    socket.on('joinGame', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle player's move
    socket.on('makeMove', ({ roomId, move }) => {
        // Broadcast the move to the other player in the room
        socket.to(roomId).emit('opponentMove', move);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Importing authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
