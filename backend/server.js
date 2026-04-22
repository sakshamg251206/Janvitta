require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route imports
const schemeRoutes = require('./routes/schemes');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Main Routes
app.use('/api/schemes', schemeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Database connection & Data Seeding
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schemes')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Seed initial schemes if the collection is empty
    const Scheme = require('./models/Scheme');
    const count = await Scheme.countDocuments();
    if (count === 0) {
      try {
        const fs = require('fs');
        const path = require('path');
        const rawData = fs.readFileSync(path.join(__dirname, '../database/schemes_data.json'));
        const data = JSON.parse(rawData);
        await Scheme.insertMany(data.schemes);
        console.log('Seeded database with initial schemes data.');
      } catch (err) {
        console.error('Error seeding data:', err);
      }
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
