const mongoose = require('mongoose');
const seedDatabase = require('../utils/seedDatabase.js');

let isConnected = false;
let useInMemory = false;

const connectDB = async () => {
  // Check if MongoDB URI is provided
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI === '') {
    console.log('⚠️  MongoDB URI not provided. Using in-memory storage.');
    useInMemory = true;
    // Ensure in-memory data is initialized
    try {
      const { ensureDataInitialized } = require('../storage/inMemoryStore.js');
      await ensureDataInitialized();
    } catch (err) {
      console.error('Error initializing in-memory data:', err);
    }
    return { useInMemory: true };
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s for Atlas
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed the database with demo data
    await seedDatabase();

    return { useInMemory: false, connection: conn };
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.log('📦 Falling back to in-memory storage...');
    useInMemory = true;
    // Ensure in-memory data is initialized
    try {
      const { ensureDataInitialized } = require('../storage/inMemoryStore.js');
      await ensureDataInitialized();
    } catch (err) {
      console.error('Error initializing in-memory data:', err);
    }
    return { useInMemory: true };
  }
};

const getStorageMode = () => useInMemory;
const getConnectionStatus = () => isConnected;

module.exports = connectDB;
module.exports.getStorageMode = getStorageMode;
module.exports.getConnectionStatus = getConnectionStatus;
