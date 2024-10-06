const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rounds: [{ type: String }], // Array to track each round's outcome
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, default: 'pending' }, // pending, ongoing, completed
});

module.exports = mongoose.model('Game', gameSchema);
