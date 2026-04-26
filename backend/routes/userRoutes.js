const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Helper function to get next userId
const getNextUserId = async () => {
    const lastUser = await User.findOne().sort({ userId: -1 });
    return lastUser ? lastUser.userId + 1 : 1;
};

// Helper function to get detailed error messages
const getDetailedErrors = (errors) => {
    const errorMessages = {};
    errors.forEach(err => {
        errorMessages[err.path] = err.msg;
    });
    return errorMessages;
};

// Register user with detailed error messages
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .custom(async (username) => {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                throw new Error('Username already taken. Please choose another one.');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
        //.matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        //.withMessage('Password must contain at least one letter and one number'),
    body('displayName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Display name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Display name can only contain letters, numbers, spaces, hyphens, and underscores')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const detailedErrors = getDetailedErrors(errors.array());
        
        // Determine the specific error type for better response
        let errorMessage = 'Registration failed. Please fix the following issues:';
        let statusCode = 400;
        
        if (detailedErrors.username) {
            if (detailedErrors.username.includes('already taken')) {
                statusCode = 409; // Conflict
            }
        }
        
        console.log('Registration validation errors:', detailedErrors);
        
        return res.status(statusCode).json({
            success: false,
            message: errorMessage,
            errors: detailedErrors,
            fields: Object.keys(detailedErrors)
        });
    }

    try {
        const { username, password, displayName } = req.body;
        
        console.log('Registration attempt for username:', username);

        // Double-check user doesn't exist (in case of race condition)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken',
                errors: {
                    username: 'This username is already taken. Please choose another one.'
                },
                fields: ['username']
            });
        }

        // Get next userId
        const userId = await getNextUserId();

        // Create new user
        const user = new User({
            userId,
            username: username.trim(),
            password,
            displayName: displayName.trim()
        });

        await user.save();
        console.log('User saved successfully, userId:', user.userId);

        // Create session
        req.session.user = {
            id: user._id,
            userId: user.userId,
            username: user.username,
            displayName: user.displayName
        };

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Account created but session error occurred',
                    error: 'Please try logging in manually'
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Account created successfully!',
                user: {
                    userId: user.userId,
                    username: user.username,
                    displayName: user.displayName
                }
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error (MongoDB error code 11000)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Username already taken',
                errors: {
                    username: 'This username is already taken. Please choose another one.'
                },
                fields: ['username']
            });
        }
        
        // Handle validation errors from mongoose
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({
                success: false,
                message: 'Please check your input',
                errors: validationErrors,
                fields: Object.keys(validationErrors)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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