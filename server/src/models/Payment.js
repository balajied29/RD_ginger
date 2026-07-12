const mongoose = require('mongoose');

/**
 * Payment — money paid to a farmer (full or partial).
 * Overpayment (amount > current balance) is ALLOWED at the model level;
 * the payments service detects it and returns warning: "OVERPAYMENT"
 * so the UI can confirm with the user (canonical business rule).
 */
const paymentSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    mode: {
      type: String,
      enum: ['cash', 'upi', 'bank'],
      required: true,
    },
    notes: { type: String, default: '' },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Required by Section 4.6 for ledger and per-farmer queries.
paymentSchema.index({ farmerId: 1, date: -1 });

// Normalize to 2dp so ledger arithmetic never accumulates float noise.
paymentSchema.pre('validate', function roundAmount(next) {
  if (typeof this.amount === 'number') {
    this.amount = Math.round(this.amount * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
