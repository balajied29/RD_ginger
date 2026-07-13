const Farmer = require('../models/Farmer');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const { httpError } = require('../utils/respond');

const DAY_MS = 24 * 60 * 60 * 1000;
const round2 = (n) => Math.round(n * 100) / 100;

async function sumBefore(Model, field, farmerId, before) {
  if (!before) return 0;
  const [r] = await Model.aggregate([
    { $match: { farmerId, date: { $lt: before } } },
    { $group: { _id: null, total: { $sum: `$${field}` } } },
  ]);
  return r ? r.total : 0;
}

/**
 * Merged purchases (debit) + payments (credit) for one farmer,
 * chronological, with running balance (S6). When `from` is set, the
 * pre-range activity is folded into openingBalance so the running
 * column stays truthful.
 */
async function getLedger(farmerId, from, to) {
  const farmer = await Farmer.findById(farmerId).lean();
  if (!farmer) throw httpError(404, 'Farmer not found');

  const dateFilter = {};
  if (from) dateFilter.$gte = from;
  if (to) dateFilter.$lt = new Date(to.getTime() + DAY_MS); // `to` inclusive
  const rangeMatch = {
    farmerId: farmer._id,
    ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
  };

  const [purchases, payments, openingPurchased, openingPaid] = await Promise.all([
    Purchase.find(rangeMatch).sort({ date: 1, createdAt: 1 }).lean(),
    Payment.find(rangeMatch).sort({ date: 1, createdAt: 1 }).lean(),
    sumBefore(Purchase, 'totalAmount', farmer._id, from),
    sumBefore(Payment, 'amount', farmer._id, from),
  ]);

  const entries = [
    ...purchases.map((p) => ({
      type: 'purchase',
      id: p._id,
      date: p.date,
      crop: p.crop,
      bagCount: p.bags.length,
      bags: p.bags, // per-bag weights, shown to the paying staff
      totalKg: p.totalKg,
      debit: p.totalAmount || 0,
      unpriced: p.totalAmount == null, // bags recorded, money not yet added
      credit: 0,
      notes: p.notes,
      createdAt: p.createdAt,
    })),
    ...payments.map((p) => ({
      type: 'payment',
      id: p._id,
      date: p.date,
      mode: p.mode,
      debit: 0,
      credit: p.amount,
      notes: p.notes,
      createdAt: p.createdAt,
    })),
  ].sort((a, b) => a.date - b.date || a.createdAt - b.createdAt);

  const openingBalance = round2(openingPurchased - openingPaid);
  let running = openingBalance;
  for (const e of entries) {
    running = round2(running + e.debit - e.credit);
    e.balance = running;
  }

  return { farmer, openingBalance, entries, closingBalance: running };
}

module.exports = { getLedger };
