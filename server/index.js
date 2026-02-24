const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { startNotificationJobs } = require('./jobs/notificationJobs');
const { seedDefaultCategories } = require('./utils/seedData');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/warranty-tracker');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Import route files
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/services', require('./routes/services'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ------------------------------------------------------------------------------------------
// PROD DEPLOYMENT CONFIG (Unified Server Architecture)
// ------------------------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // Set explicit static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Catch-all route to hand off routing to the React App
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  // Fallback for local development
  app.get('/', (req, res) => {
    res.send('Warranty Tracker API is running locally (Vite handles frontend)');
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Seed default categories
  await seedDefaultCategories();

  // Schedule notification checks
  startNotificationJobs();
});