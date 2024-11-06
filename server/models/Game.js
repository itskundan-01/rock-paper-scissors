const mongoose = require('mongoose');

// Define the Game schema
const GameSchema = new mongoose.Schema({
    playerOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    playerTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    playerOneScore: {
        type: Number,
        default: 0,
    },
    playerTwoScore: {
        type: Number,
        default: 0,
    },
    moves: [
        {
            round: Number,
            playerOneMove: String,
            playerTwoMove: String,
            winner: String, // 'playerOne', 'playerTwo', or 'draw'
        },
    ],
    winner: {
        type: String,
        enum: ['playerOne', 'playerTwo', 'draw', null],
        default: null,
    },
}, {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
});

// Add an index on the 'createdAt' field for optimized sorting/filtering by date
GameSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Game', GameSchema);
