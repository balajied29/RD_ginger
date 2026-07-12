/**
 * One-time seed: creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD.
 * Safe to re-run — does nothing if the admin already exists (Section 2.2 #5).
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./connect');
const User = require('../models/User');

(async () => {
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Admin';

  if (!email || !password) {
    console.error('[seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('[seed] ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] User ${email} already exists — nothing to do.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email, passwordHash, name, role: 'admin' });
  console.log(`[seed] Admin created: ${email}`);
  process.exit(0);
})();
