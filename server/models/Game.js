const mongoose = require('mongoose');

// Define the Game schema
const GameSchema = new mongoose.Schema({
    // Player IDs referencing the User model
    playerOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true, // Player one is mandatory
    },
    playerTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true, // Player two is mandatory
    },
    
    // Player scores
    playerOneScore: {
        type: Number,
        default: 0, // Initial score is 0
    },
    playerTwoScore: {
        type: Number,
        default: 0, // Initial score is 0
    },

    // Array of rounds - stores each round's moves and result
    moves: [
        {
            round: {
                type: Number, 
                required: true, // Round number is required
            },
            playerOneMove: {
                type: String, 
                enum: ['rock', 'paper', 'scissors'], // Valid moves
                required: true, // Player one move is mandatory
            },
            playerTwoMove: {
                type: String, 
                enum: ['rock', 'paper', 'scissors'], // Valid moves
                required: true, // Player two move is mandatory
            },
            winner: {
                type: String, 
                enum: ['playerOne', 'playerTwo', 'draw'], // Round winner
                required: true, // Winner is mandatory
            },
        },
    ],

    // The overall winner of the game
    winner: {
        type: String,
        enum: ['playerOne', 'playerTwo', 'draw', null], // Possible winners or draw
        default: null, // Default is null when the game is ongoing
    },

    // Game status (ongoing or completed)
    status: {
        type: String,
        enum: ['ongoing', 'completed'], // The game can be either ongoing or completed
        default: 'ongoing', // Default is ongoing
    },

}, {
    // Timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
});

// Add an index on the 'createdAt' field for optimized sorting/filtering by date
GameSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Game', GameSchema);
