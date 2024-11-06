// Initialize socket connection to the server
const socket = io('http://localhost:5000');

// Example to get user ID and game ID (you'll need to handle this logic in your app)
const userId = getUserId(); // Replace with actual user ID fetching logic
const gameId = getGameId(); // Replace with actual game ID logic

// Sound effects for winning and losing rounds
const winSound = new Audio('/sounds/win.mp3');
const loseSound = new Audio('/sounds/lose.mp3');

// Function to play sound based on the round result
function playSound(result) {
    if (result === 'win') {
        winSound.play();
    } else if (result === 'lose') {
        loseSound.play();
    }
}

// Fetch and display leaderboard
async function getLeaderboard() {
    try {
        const response = await fetch('/api/user/leaderboard');
        const leaderboard = await response.json();

        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = ''; // Clear existing leaderboard

        // Display each player in the leaderboard
        leaderboard.forEach(player => {
            const listItem = document.createElement('li');
            listItem.innerText = `${player.username} - Wins: ${player.gamesWonCount}`;
            leaderboardList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}

// Call getLeaderboard on page load
getLeaderboard();

// Fetch and display match history
async function getMatchHistory(userId) {
    try {
        const response = await fetch(`/api/game/history/${userId}`);
        const history = await response.json();

        const historyList = document.getElementById('historyList');
        historyList.innerHTML = ''; // Clear existing history

        // Display each game in the match history
        history.forEach(game => {
            const listItem = document.createElement('li');
            listItem.innerText = `Game ID: ${game._id}, Winner: ${game.winner ? game.winner.username : 'Draw'}`;
            historyList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching match history:', error);
    }
}

// Call this function after login to populate history
getMatchHistory(userId);

// Emit player move through Socket.IO
function makeMove(move) {
    socket.emit('moveMade', { gameId, userId, move });
    displayMove(move, 'waiting'); // Display player move with a placeholder for opponent
}

// Listen for opponent's move in real-time
socket.on('moveUpdate', (opponentMove) => {
    displayMove('waiting', opponentMove); // Display opponent's move when received
});

// Listen for round results (from server-side logic)
socket.on('roundResult', (result) => {
    displayRoundResult(result);
    updateScores(result);
    playSound(result); // Play sound based on round result (win/lose)
});

// Listen for game updates (score, opponent move, etc.)
socket.on('gameUpdate', (data) => {
    // Update the score and opponent's move based on the data received
    updateScore(data.playerScore, data.opponentScore);
    displayMove(data.playerMove, data.opponentMove); // Update both moves based on received data
});

socket.on('gameOver', (data) => {
    const winner = data.winner;
    document.getElementById('gameStatus').innerText = winner ? `Winner: ${winner}` : 'It\'s a draw!';
});

// Update the UI with player's move and opponent's move
function displayMove(playerMove, opponentMove) {
    document.getElementById('playerMoveDisplay').innerText = `You chose: ${playerMove}`;
    document.getElementById('opponentMoveDisplay').innerText = `Opponent chose: ${opponentMove}`;
}

// Update the UI with player's move
function displayMyMove(move) {
    document.getElementById('yourMove').textContent = move;
}

// Display the result of the round (win, loss, or tie)
function displayRoundResult(result) {
    let resultText = '';
    if (result === 'win') {
        resultText = 'You win the round!';
    } else if (result === 'lose') {
        resultText = 'You lose the round!';
    } else {
        resultText = 'It\'s a tie!';
    }
    document.getElementById('result').textContent = resultText;
}

// Update the score display
function updateScores(result) {
    const yourScore = parseInt(document.getElementById('yourScore').textContent);
    const opponentScore = parseInt(document.getElementById('opponentScore').textContent);
    
    if (result === 'win') {
        document.getElementById('yourScore').textContent = yourScore + 1;
    } else if (result === 'lose') {
        document.getElementById('opponentScore').textContent = opponentScore + 1;
    }

    // Check if someone won the game
    if (yourScore === 3) {
        alert('You win the game!');
    } else if (opponentScore === 3) {
        alert('Your opponent wins the game!');
    }
}

// Update the score display (updated function from your code)
function updateScore(playerScore, opponentScore) {
    document.getElementById('yourScore').innerText = playerScore;
    document.getElementById('opponentScore').innerText = opponentScore;
}

// Call `makeMove` with 'rock', 'paper', or 'scissors' based on player's choice
document.getElementById('rock').addEventListener('click', () => makeMove('rock'));
document.getElementById('paper').addEventListener('click', () => makeMove('paper'));
document.getElementById('scissors').addEventListener('click', () => makeMove('scissors'));

// Example of how to get user ID and game ID (you can replace these with actual session or game state management logic)
function getUserId() {
    // Replace with actual logic to get the logged-in user's ID
    return 'user123';
}

function getGameId() {
    // Replace with actual logic to get the current game ID
    return 'game456';
}

// Protect game routes using authentication middleware (for example in game.js route file)
const authenticateToken = require('../middleware/auth');

// Example Game route (game.js) applying authentication
const express = require('express');
const router = express.Router();

// Apply authentication middleware to game routes
router.post('/make-move', authenticateToken, async (req, res) => {
    const { move } = req.body;
    const userId = req.user.userId;  // Access authenticated userId from JWT token
    const gameId = req.body.gameId;

    try {
        // Process the move and update the game state
        // Add your game logic here (checking opponent's move, determining winner, etc.)
        const result = await processGameMove(userId, move, gameId); // You'd define this logic separately

        res.status(200).json({ message: 'Move made successfully', result });
    } catch (error) {
        console.error('Error making move:', error);
        res.status(500).json({ message: 'Error processing move', error: error.message });
    }
});

module.exports = router;
