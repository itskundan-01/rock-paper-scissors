document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Logging email and password for confirmation
    console.log('Attempting login with Email:', email);
    console.log('Password:', password);

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        
        if (response.ok) {
            // Successful login
            localStorage.setItem('token', data.token);
            window.location.href = 'index.html';
        } else {
            // Log the message from the server if login fails
            console.error('Login failed:', data.message || 'Unknown error');
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred. Please try again.');
    }
});
