const express = require('express');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const locationRoutes = require('./routes/locationRoutes');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Session configuration with connect-mongo v5
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-development',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrition_app',
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day in seconds
    }),
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test route to verify connection
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date(),
        database: 'MongoDB Atlas',
        session: req.session.user ? { username: req.session.user.username } : null
    });
});

// Routes
app.use('/api', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api', locationRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});