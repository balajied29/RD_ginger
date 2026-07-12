const mongoose = require('mongoose');

/**
 * Farmer — a person the business procures crops from.
 * NOTE: there is NO balance field. Balance is ALWAYS derived:
 * Σ purchases.totalAmount − Σ payments.amount (canonical business rule).
 */
const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    village: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Farmer', farmerSchema);
