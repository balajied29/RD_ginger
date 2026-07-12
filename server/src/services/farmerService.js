const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const { httpError } = require('../utils/respond');
const { logAudit } = require('./auditService');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Aggregation stages appending totalPurchased / totalPaid / balance to
 * farmer docs. Balance is ALWAYS derived, never stored (Section 4.6).
 */
const balanceStages = [
  {
    $lookup: {
      from: 'purchases',
      let: { fid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$farmerId', '$$fid'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ],
      as: '_purchases',
    },
  },
  {
    $lookup: {
      from: 'payments',
      let: { fid: '$_id' },
      pipeline: [
        { $match: { $expr: { $eq: ['$farmerId', '$$fid'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ],
      as: '_payments',
    },
  },
  {
    $addFields: {
      totalPurchased: { $ifNull: [{ $arrayElemAt: ['$_purchases.total', 0] }, 0] },
      totalPaid: { $ifNull: [{ $arrayElemAt: ['$_payments.total', 0] }, 0] },
    },
  },
  {
    $addFields: {
      balance: { $round: [{ $subtract: ['$totalPurchased', '$totalPaid'] }, 2] },
    },
  },
  { $project: { _purchases: 0, _payments: 0 } },
];

async function createFarmer(data, actor) {
  const farmer = await Farmer.create({ ...data, createdBy: actor._id });
  await logAudit({
    actorId: actor._id,
    action: 'CREATE',
    collectionName: 'farmers',
    documentId: farmer._id,
    after: farmer.toObject(),
  });
  return { ...farmer.toObject(), totalPurchased: 0, totalPaid: 0, balance: 0 };
}

/**
 * List is 3 flat queries merged in memory (farmers + one $group over
 * purchases + one over payments) instead of 2 pipeline $lookups per
 * farmer — constant query count however many farmers exist.
 */
async function listFarmers(search = '') {
  const match = search
    ? { name: { $regex: escapeRegex(search), $options: 'i' } }
    : {};
  const [farmers, purchaseTotals, paymentTotals] = await Promise.all([
    Farmer.find(match).sort({ name: 1 }).lean(),
    Purchase.aggregate([{ $group: { _id: '$farmerId', total: { $sum: '$totalAmount' } } }]),
    Payment.aggregate([{ $group: { _id: '$farmerId', total: { $sum: '$amount' } } }]),
  ]);
  const bought = new Map(purchaseTotals.map((r) => [String(r._id), r.total]));
  const paid = new Map(paymentTotals.map((r) => [String(r._id), r.total]));
  return farmers.map((f) => {
    const totalPurchased = bought.get(String(f._id)) || 0;
    const totalPaid = paid.get(String(f._id)) || 0;
    return {
      ...f,
      totalPurchased,
      totalPaid,
      balance: Math.round((totalPurchased - totalPaid) * 100) / 100,
    };
  });
}

async function getFarmer(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, 'Farmer not found');
  const [farmer] = await Farmer.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    ...balanceStages,
  ]);
  if (!farmer) throw httpError(404, 'Farmer not found');
  return farmer;
}

async function getFarmerBalance(farmerId) {
  const farmer = await getFarmer(String(farmerId));
  return farmer.balance;
}

module.exports = { createFarmer, listFarmers, getFarmer, getFarmerBalance };
