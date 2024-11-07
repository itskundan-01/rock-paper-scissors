// Function to handle registration
async function registerUser(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message); // Show success message
            window.location.href = 'login.html'; // Redirect to login page
        } else {
            alert(data.message || 'Registration failed'); // Show error message
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Function to handle login
async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Login successful", data);
            localStorage.setItem('token', data.token); // Store JWT token in localStorage
            localStorage.setItem('userId', data.userId); // Store user ID
            alert('Login successful!');
            window.location.href = 'index.html'; // Redirect to main page
        } else {
            alert(data.message || 'Login failed'); // Show error message
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
}

// Helper function to check if the user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if not authenticated
    }
}

// Function to generate headers with the authorization token

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add 'Bearer ' prefix
    };
}


// Function to make a game move, using authorization headers
async function makeMove(playerMove) {
    try {
        const response = await fetch('http://localhost:5000/api/game/make-move', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ playerMove }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Move made successfully:', data.message);
            // Additional UI updates can go here, like updating move status or score
        } else {
            console.error('Move failed:', data.message || data.error);
            alert(data.message || 'Failed to make the move.');
        }
    } catch (error) {
        console.error('Error while making move:', error);
        alert('Network error. Please try again.');
    }
}

// Event listeners for registration and login form submission
document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    registerUser(email, password);
});

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log("Login email:", email);
    console.log("Login password:", password);
    loginUser(email, password);
});

// Example usage of makeMove in game
document.getElementById('rock')?.addEventListener('click', () => makeMove('rock'));
document.getElementById('paper')?.addEventListener('click', () => makeMove('paper'));
document.getElementById('scissors')?.addEventListener('click', () => makeMove('scissors'));

// Check authentication on page load if this is a protected page
document.addEventListener('DOMContentLoaded', checkAuth);
