const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Matchmaking = require('../models/Matchmaking');
const authMiddleware = require('../middleware/auth');

// Matchmaking route
router.post('/find-match', async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if there's another player waiting in the queue
        const waitingPlayer = await Matchmaking.findOne();

        if (waitingPlayer) {
            // Match found, create a new game
            const newGame = new Game({
                playerOne: waitingPlayer.userId,
                playerTwo: userId,
                playerOneScore: 0,
                playerTwoScore: 0,
            });

            // Save the new game and remove the waiting player from matchmaking
            await newGame.save();
            await Matchmaking.findByIdAndDelete(waitingPlayer._id);

            res.status(200).json({ message: 'Match found!', gameId: newGame._id });
        } else {
            // No match found, add current player to matchmaking queue
            const newMatch = new Matchmaking({ userId });
            await newMatch.save();

            res.status(200).json({ message: 'Waiting for another player...' });
        }
    } catch (error) {
        console.error('Error in matchmaking:', error);
        res.status(500).json({ message: 'An error occurred in matchmaking.' });
    }
});

// Route to make a move in a game
router.post('/make-move', authMiddleware, async (req, res) => {
    const { gameId, playerMove } = req.body;
    const userId = req.user._id;

    try {
        // Find the game
        const game = await Game.findById(gameId);
        if (!game || game.status === 'completed') {
            return res.status(400).json({ message: 'Invalid or completed game.' });
        }

        // Identify players and determine the opponent
        const isPlayerOne = game.playerOne.equals(userId);
        const opponentMoveField = isPlayerOne ? 'playerTwoMove' : 'playerOneMove';
        const playerMoveField = isPlayerOne ? 'playerOneMove' : 'playerTwoMove';

        // Update round data with player’s move
        game.moves.push({
            round: game.moves.length + 1,
            [playerMoveField]: playerMove,
        });

        // Save and update scores if both moves are available
        if (game.moves[game.moves.length - 1][opponentMoveField]) {
            const playerOneMove = game.moves[game.moves.length - 1].playerOneMove;
            const playerTwoMove = game.moves[game.moves.length - 1].playerTwoMove;
            const result = determineWinner(playerOneMove, playerTwoMove);
            
            // Update the score based on round result
            if (result === 'playerOne') game.playerOneScore += 1;
            if (result === 'playerTwo') game.playerTwoScore += 1;

            game.moves[game.moves.length - 1].winner = result;
            
            // Check if someone has won the game (3 points)
            if (game.playerOneScore === 3 || game.playerTwoScore === 3) {
                game.status = 'completed';
                game.winner = game.playerOneScore === 3 ? game.playerOne : game.playerTwo;
            }
        }

        await game.save();
        res.status(200).json({ message: 'Move recorded', game });
    } catch (error) {
        console.error('Error processing move:', error);
        res.status(500).json({ message: 'Error processing move', error: error.message });
    }
});

// Function to determine the winner of a round based on Rock-Paper-Scissors rules
function determineWinner(move1, move2) {
    if (move1 === move2) return 'draw';
    if (
        (move1 === 'rock' && move2 === 'scissors') ||
        (move1 === 'scissors' && move2 === 'paper') ||
        (move1 === 'paper' && move2 === 'rock')
    ) return 'playerOne';
    return 'playerTwo';
}

module.exports = router;
