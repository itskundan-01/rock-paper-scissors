const express = require('express');
const bcrypt = require('bcryptjs'); // Ensure bcrypt is required here
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Registration Route
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Hashed Password: ${hashedPassword}`);

        // Create a new user with the hashed password
        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Entered Password: ${password}`);
        console.log(`Stored Hashed Password: ${user.password}`);

        const isMatch = await user.comparePassword(password);
        console.log(`Password Match: ${isMatch}`);
        if (!isMatch) {
            console.log('Invalid credentials');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login error' });
    }
});

module.exports = router;
