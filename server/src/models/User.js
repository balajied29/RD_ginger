const mongoose = require('mongoose');

/**
 * User — staff and admin accounts.
 * passwordHash uses select: false — it is NEVER returned by any query
 * unless explicitly requested with .select('+passwordHash') (login only).
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // bcrypt, cost 12
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      default: 'staff',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
