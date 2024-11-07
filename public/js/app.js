// Initialize socket connection to the server
const socket = io('http://localhost:5000');

// Retrieve user ID and game ID (using `localStorage` to simulate actual retrieval)
function getUserId() {
    return localStorage.getItem('userId') || prompt("Enter your User ID"); // Prompt as fallback if not in `localStorage`
}

function getGameId() {
    return localStorage.getItem('gameId') || prompt("Enter your Game ID"); // Prompt as fallback if not in `localStorage`
}

const userId = getUserId();
const gameId = getGameId();

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
        const response = await fetch('http://localhost:5000/api/user/leaderboard');
        const leaderboard = await response.json();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';

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
        const response = await fetch(`http://localhost:5000/api/game/history/${userId}`);
        const history = await response.json();
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';

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
    displayMove(move, 'waiting');
}

// Listen for opponent's move in real-time
socket.on('moveUpdate', (data) => {
    displayMove('waiting', data.move); // Show opponent's move
});

// Listen for round results (from server-side logic)
socket.on('roundResult', (result) => {
    displayRoundResult(result);
    updateScores(result);
    playSound(result);
});

// Listen for game updates (score, opponent move, etc.)
socket.on('gameUpdate', (data) => {
    updateScore(data.playerScore, data.opponentScore);
    displayMove(data.playerMove, data.opponentMove);
});

// Listen for game over event
socket.on('gameOver', (data) => {
    const winner = data.winner;
    document.getElementById('gameStatus').innerText = winner ? `Winner: ${winner}` : 'It\'s a draw!';
});

// Update the UI with player's move and opponent's move
function displayMove(playerMove, opponentMove) {
    document.getElementById('playerMoveDisplay').innerText = `You chose: ${playerMove}`;
    document.getElementById('opponentMoveDisplay').innerText = `Opponent chose: ${opponentMove}`;
}

// Display the result of the round (win, lose, or tie)
function displayRoundResult(result) {
    const resultText = result === 'win' ? 'You win the round!' : result === 'lose' ? 'You lose the round!' : 'It\'s a tie!';
    document.getElementById('result').textContent = resultText;
}

// Update the score display
function updateScores(result) {
    const yourScoreElem = document.getElementById('yourScore');
    const opponentScoreElem = document.getElementById('opponentScore');
    let yourScore = parseInt(yourScoreElem.textContent) || 0;
    let opponentScore = parseInt(opponentScoreElem.textContent) || 0;
    
    if (result === 'win') {
        yourScore += 1;
        yourScoreElem.textContent = yourScore;
    } else if (result === 'lose') {
        opponentScore += 1;
        opponentScoreElem.textContent = opponentScore;
    }

    // Check if someone won the game
    if (yourScore === 3) {
        alert('You win the game!');
        socket.emit('gameOver', { gameId, winner: 'You' });
    } else if (opponentScore === 3) {
        alert('Your opponent wins the game!');
        socket.emit('gameOver', { gameId, winner: 'Opponent' });
    }
}

// Update score display with both players' scores
function updateScore(playerScore, opponentScore) {
    document.getElementById('yourScore').innerText = playerScore;
    document.getElementById('opponentScore').innerText = opponentScore;
}

// Attach click event listeners to buttons for moves
document.getElementById('rock').addEventListener('click', () => makeMove('rock'));
document.getElementById('paper').addEventListener('click', () => makeMove('paper'));
document.getElementById('scissors').addEventListener('click', () => makeMove('scissors'));
