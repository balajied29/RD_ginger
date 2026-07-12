const mongoose = require('mongoose');
const Farmer = require('../models/Farmer');
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

async function listFarmers(search = '') {
  const match = search
    ? { name: { $regex: escapeRegex(search), $options: 'i' } }
    : {};
  return Farmer.aggregate([{ $match: match }, { $sort: { name: 1 } }, ...balanceStages]);
}

async function getFarmer(id) {
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
