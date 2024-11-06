const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
}

// Registration Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    console.log('Received registration request:', { email, password }); // Log incoming data

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email); // Log if user exists
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ email, password });
        await user.save();
        
        console.log('User registered successfully:', email); // Log successful registration
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error); // Log specific error details
        res.status(500).json({ error: 'An error occurred during registration', details: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token using the helper function
        const token = generateToken(user);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error); // Log specific error details
        res.status(500).json({ error: 'Login error', details: error.message });
    }
});

module.exports = router;
