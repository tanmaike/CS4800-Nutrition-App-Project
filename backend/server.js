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

// CORS configuration - allow your production IP
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5001',
    'http://127.0.0.1:5173',
    // Add your production IP(s) here
    'http://54.183.194.8',
    // You can also use a wildcard for development
    // '*'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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