const express = require('express');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();

// Simple CORS - allow all origins during development
app.use(cors());

// Alternative: More specific CORS
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
//   credentials: true
// }));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

// Routes
app.use('/api', itemRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});