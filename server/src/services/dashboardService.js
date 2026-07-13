const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const { istPeriodStart } = require('../utils/istDates');

const round2 = (n) => Math.round(n * 100) / 100;

async function periodTotals(start) {
  const [[p], [pay]] = await Promise.all([
    Purchase.aggregate([
      { $match: { date: { $gte: start } } },
      {
        $group: {
          _id: null,
          totalKg: { $sum: '$totalKg' },
          totalPayable: { $sum: '$totalAmount' },
          purchaseCount: { $sum: 1 },
        },
      },
    ]),
    Payment.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: null, totalPaid: { $sum: '$amount' } } },
    ]),
  ]);
  return {
    totalKg: round2(p ? p.totalKg : 0),
    totalPayable: round2(p ? p.totalPayable : 0),
    purchaseCount: p ? p.purchaseCount : 0,
    totalPaid: round2(pay ? pay.totalPaid : 0),
  };
}

/** Outstanding is all-time by definition: Σ all purchases − Σ all payments. */
async function allTimeOutstanding() {
  const [[p], [pay]] = await Promise.all([
    Purchase.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);
  return round2((p ? p.total : 0) - (pay ? pay.total : 0));
}

async function recentTransactions() {
  const [purchases, payments] = await Promise.all([
    Purchase.find().sort({ date: -1, createdAt: -1 }).limit(10).populate('farmerId', 'name').lean(),
    Payment.find().sort({ date: -1, createdAt: -1 }).limit(10).populate('farmerId', 'name').lean(),
  ]);
  return [
    ...purchases.map((p) => ({
      type: 'purchase',
      id: p._id,
      date: p.date,
      farmerId: p.farmerId ? p.farmerId._id : null,
      farmerName: p.farmerId ? p.farmerId.name : '—',
      amount: p.totalAmount || 0,
      unpriced: p.totalAmount == null,
      totalKg: p.totalKg,
      crop: p.crop,
    })),
    ...payments.map((p) => ({
      type: 'payment',
      id: p._id,
      date: p.date,
      farmerId: p.farmerId ? p.farmerId._id : null,
      farmerName: p.farmerId ? p.farmerId.name : '—',
      amount: p.amount,
      mode: p.mode,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
}

/** Dashboard payload per Section 2.3; period boundaries in IST. */
async function getDashboard(period) {
  const start = istPeriodStart(period);
  const [totals, outstanding, recent] = await Promise.all([
    periodTotals(start),
    allTimeOutstanding(),
    recentTransactions(),
  ]);
  return { ...totals, outstanding, recentTransactions: recent };
}

module.exports = { getDashboard };
