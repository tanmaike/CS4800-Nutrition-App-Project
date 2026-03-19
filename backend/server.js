// backend/server.js
const express = require('express');
const connectDB = require('./config/db');  // Updated path
const itemRoutes = require('./routes/itemRoutes');  // Updated path
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', itemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});