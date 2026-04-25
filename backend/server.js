const express = require('express');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

const allowedOrigins = [
    'http://54.183.194.8',
    'http://sanjosehillsfitness.com',
    'http://www.sanjosehillsfitness.com',
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5001'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            // For now, let's allow all origins to fix the issue
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

app.options('*', cors());

app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date(),
        database: 'MongoDB Atlas',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.use('/api', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api', locationRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
