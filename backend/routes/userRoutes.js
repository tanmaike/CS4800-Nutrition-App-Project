const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper function to get next userId
const getNextUserId = async () => {
    const lastUser = await User.findOne().sort({ userId: -1 });
    return lastUser ? lastUser.userId + 1 : 1;
};

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        
        console.log('Registration attempt for username:', username);

        // Validate input
        if (!username || !password || !displayName) {
            return res.status(400).json({ 
                message: 'All fields are required: username, password, displayName' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Get next userId
        const userId = await getNextUserId();
        console.log('Generated userId:', userId);

        // Create new user
        const user = new User({
            userId,
            username,
            password,
            displayName
        });

        // Save user (password will be hashed automatically)
        await user.save();
        console.log('User saved successfully, userId:', user.userId);

        // Create session
        req.session.user = {
            id: user._id,
            userId: user.userId,
            username: user.username,
            displayName: user.displayName
        };

        res.status(201).json({
            message: 'User created successfully',
            user: {
                userId: user.userId,
                username: user.username,
                displayName: user.displayName
            }
        });
    } catch (error) {
        console.error('Registration error details:', error);
        res.status(500).json({ 
            message: 'Error creating user', 
            error: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create session
        req.session.user = {
            id: user._id,
            userId: user.userId,
            username: user.username,
            displayName: user.displayName
        };

        res.json({
            message: 'Login successful',
            user: {
                userId: user.userId,
                username: user.username,
                displayName: user.displayName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user, isAuthenticated: true });
    } else {
        res.json({ user: null, isAuthenticated: false });
    }
});

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({ available: !user });
    } catch (error) {
        res.status(500).json({ message: 'Error checking username' });
    }
});

module.exports = router;