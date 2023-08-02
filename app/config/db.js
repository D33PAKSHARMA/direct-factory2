const mongoose = require('mongoose');
const config = require('./dbconfig');

async function connectToDatabase() {
  try {
    await mongoose.connect(config.DB_URI, {
      dbName: config.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  mongooseConnection: mongoose.connection,
};