const mongoose = require('mongoose');

/**
 * Serverless-safe connection: caches the mongoose connection across
 * warm invocations and never exits the process (unlike connect.js,
 * which is for the long-running local server).
 */
let cached = null;

async function ensureConnection() {
  if (cached && mongoose.connection.readyState === 1) return cached;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  mongoose.set('strictQuery', true);
  cached = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return cached;
}

module.exports = { ensureConnection };
