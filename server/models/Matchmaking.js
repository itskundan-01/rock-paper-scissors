// models/Matchmaking.js

const mongoose = require('mongoose');

const matchmakingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Matchmaking', matchmakingSchema);
