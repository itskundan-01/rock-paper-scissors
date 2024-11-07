// server.js

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const socketIo = require('socket.io'); // Import socket.io
const gameRoutes = require('./routes/game');
const userRoutes = require('./routes/user'); // Correct path

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create the HTTP server to support socket.io
const io = socketIo(server, { cors: { origin: '*' } }); // Initialize socket.io with CORS support

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from public directory

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rock-paper-scissors', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

// Use routes
app.use('/api/auth', authRoutes); // User authentication routes
app.use('/api/game', gameRoutes); // Game-related routes
app.use('/api/payment', paymentRoutes); // Payment processing routes
// app.use('/api/user', userRoutes); // Optional: User profile or user-specific routes

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Event to handle moves made by players
    socket.on('moveMade', ({ gameId, userId, move }) => {
        // Broadcast the move to the opponent in the same game room
        socket.to(gameId).emit('moveUpdate', { userId, move });
    });

    // Event to handle game-over notification
    socket.on('gameOver', ({ gameId, winner }) => {
        io.to(gameId).emit('gameOver', { winner });
    });

    // Handle when the user disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server with Socket.io support
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
