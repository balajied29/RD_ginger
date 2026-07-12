const mongoose = require('mongoose');

/**
 * Connects to MongoDB using MONGODB_URI from env.
 * Fails fast: if the URI is missing or the initial connection fails,
 * the process exits — the API must never run without a database.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[db] MONGODB_URI is not set. Aborting.');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected');
  } catch (err) {
    console.error('[db] Initial connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] Connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Disconnected');
  });
}

module.exports = { connectDB };
