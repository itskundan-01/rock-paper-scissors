const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const Matchmaking = require('../models/Matchmaking');

// POST endpoint to initiate matchmaking
router.post('/start-game', async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if there is another player waiting
        const waitingPlayer = await Matchmaking.findOne();

        if (waitingPlayer) {
            // Found a match - create a new game
            const newGame = new Game({
                players: [waitingPlayer.userId, userId],
                scores: { player1: 0, player2: 0, tie: 0 },
                status: 'ongoing',
            });
            await newGame.save();

            // Remove matched players from matchmaking queue
            await Matchmaking.deleteMany({ _id: { $in: [waitingPlayer._id, userId] } });

            return res.json({ message: 'Match found!', gameId: newGame._id });
        } else {
            // No match found, add player to matchmaking queue
            const newMatchmaking = new Matchmaking({ userId });
            await newMatchmaking.save();

            return res.json({ message: 'Waiting for another player...' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while starting the game.' });
    }
});

// POST endpoint to handle player moves
router.post('/move', async (req, res) => {
    try {
        const { userId, move, gameId } = req.body; // 'move' can be "rock", "paper", or "scissors"

        // Retrieve game data (assume both players are matched in this step)
        const game = await Game.findById(gameId);

        if (!game) return res.status(400).json({ message: 'Game not found.' });

        // Record the move for this player
        if (userId === game.players[0].toString()) game.move1 = move;
        else if (userId === game.players[1].toString()) game.move2 = move;
        else return res.status(400).json({ message: 'Player not part of this game.' });

        // Check if both players have made their move
        if (game.move1 && game.move2) {
            // Determine round result
            const result = determineWinner(game.move1, game.move2);

            // Update the score based on the round result
            if (result === 'player1') {
                game.scores.player1 += 1;
            } else if (result === 'player2') {
                game.scores.player2 += 1;
            } else {
                game.scores.tie += 1;
            }

            // Reset moves for next round
            game.move1 = null;
            game.move2 = null;

            // Check if there is a match winner (player1 or player2 has won 3 rounds)
            if (game.scores.player1 === 3 || game.scores.player2 === 3) {
                game.status = 'completed';
                game.winner = game.scores.player1 === 3 ? game.players[0] : game.players[1];
                await game.save();
                
                // Emit the game over event with the winner's information
                io.to(gameId).emit('gameOver', { winner: game.winner });

                return res.json({ message: `${game.winner} wins the game!`, winner: game.winner });
            }
        }

        // Save the game after processing the move
        await game.save();
        res.json({ message: 'Move recorded.', game });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the move.' });
    }
});

// GET player’s match history
router.get('/history/:userId', async (req, res) => {
    try {
        // Retrieve all completed games where the user was a player
        const games = await Game.find({
            players: req.params.userId,
            status: 'completed', // Ensure we only get completed games
        })
            .populate('players', 'username') // Populate player details (only usernames here)
            .sort({ createdAt: -1 }) // Sort by the most recent games
            .limit(10); // Limit the result to the 10 most recent games

        res.status(200).json(games);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving match history.' });
    }
});

// Helper function to determine the winner of the round
function determineWinner(move1, move2) {
    if (move1 === move2) return 'tie';
    if (
        (move1 === 'rock' && move2 === 'scissors') ||
        (move1 === 'scissors' && move2 === 'paper') ||
        (move1 === 'paper' && move2 === 'rock')
    ) {
        return 'player1';
    } else {
        return 'player2';
    }
}

module.exports = router;
