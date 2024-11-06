// Handle registration form submission
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sending the request for registration
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // Handle the response from the server
        const data = await response.json();

        // Check if the response is OK and log the result
        if (response.ok) {
            console.log('Registration successful:', data.message);
            alert(data.message || 'Registration successful!');
            window.location.href = 'login.html'; // Redirect to login page on success
        } else {
            console.error('Registration failed:', data.message || data.error);
            alert(data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        // Handle network errors or other unexpected issues
        console.error('Network error during registration:', error);
        alert('Network error. Please try again.');
    }
});

// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sending the request for login
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        // Handle the response from the server
        const data = await response.json();

        // Check if the response is OK and log the result
        if (response.ok) {
            console.log('Login successful:', data.message);
            localStorage.setItem('token', data.token); // Save the token to localStorage
            window.location.href = 'index.html'; // Redirect to the homepage on success
        } else {
            console.error('Login failed:', data.message || data.error);
            alert(data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        // Handle network errors or other unexpected issues
        console.error('Network error during login:', error);
        alert('Network error. Please try again.');
    }
});

// Function to generate headers with authorization token
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'), // Add the JWT token from localStorage
    };
}

// Example usage of token in a protected route
async function makeMove(playerMove, opponentMove) {
    try {
        const response = await fetch('http://localhost:5000/api/game/make-move', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ playerMove, opponentMove }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Move made successfully:', data.message);
            // Handle successful move, e.g., update UI, show results, etc.
        } else {
            console.error('Move failed:', data.message || data.error);
            alert(data.message || 'Failed to make the move.');
        }
    } catch (error) {
        console.error('Error while making move:', error);
        alert('Network error. Please try again.');
    }
}

// Example for making a move (call this in your UI logic, passing the player and opponent's move)
document.getElementById('rock').addEventListener('click', () => makeMove('rock', 'opponentMove'));
document.getElementById('paper').addEventListener('click', () => makeMove('paper', 'opponentMove'));
document.getElementById('scissors').addEventListener('click', () => makeMove('scissors', 'opponentMove'));
