const mongoose = require('mongoose');

/**
 * Purchase — one procurement event: a farmer sells crops in weighed bags.
 * totalKg is ALWAYS recomputed server-side from bags in the pre-validate
 * hook below. totalAmount is the final negotiated price, entered directly
 * by staff (owner-approved change, 2026-07-12: rate-per-kg removed —
 * negotiation happens before recording). Because the hook only fires on
 * save(), edits MUST load the document and call save() — never
 * findOneAndUpdate().
 */
const bagSchema = new mongoose.Schema(
  {
    bagNo: { type: Number, required: true },
    weightKg: { type: Number, required: true, min: 0.1 },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
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
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    bags: {
      type: [bagSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 1,
        message: 'A purchase must have at least 1 bag.',
      },
    },
    totalKg: { type: Number, required: true },
    totalAmount: { type: Number, required: true, min: 1 },
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
purchaseSchema.index({ farmerId: 1, date: -1 });

// totalKg is server-computed from bags — never trusted from the client.
// totalAmount is staff-entered; only normalized to 2dp here.
// Runs on create AND on every save()-based edit.
purchaseSchema.pre('validate', function computeTotals(next) {
  if (Array.isArray(this.bags) && this.bags.length > 0) {
    const sumKg = this.bags.reduce((sum, b) => sum + (b.weightKg || 0), 0);
    this.totalKg = Math.round(sumKg * 100) / 100;
  }
  if (typeof this.totalAmount === 'number') {
    this.totalAmount = Math.round(this.totalAmount * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);
