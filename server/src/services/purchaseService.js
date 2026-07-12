const Farmer = require('../models/Farmer');
const Purchase = require('../models/Purchase');
const { httpError } = require('../utils/respond');
const { logAudit } = require('./auditService');

const PAGE_SIZE = 25;
const DAY_MS = 24 * 60 * 60 * 1000;

async function assertFarmerExists(farmerId) {
  const farmer = await Farmer.findById(farmerId);
  if (!farmer) throw httpError(404, 'Farmer not found');
}

/** Totals are recomputed by the model's pre-validate hook on save. */
async function createPurchase(data, actor) {
  await assertFarmerExists(data.farmerId);
  const purchase = await Purchase.create({ ...data, createdBy: actor._id });
  await logAudit({
    actorId: actor._id,
    action: 'CREATE',
    collectionName: 'purchases',
    documentId: purchase._id,
    after: purchase.toObject(),
  });
  return purchase;
}

/** `to` is treated as an inclusive date: filter is date < to + 1 day. */
function dateFilter(from, to) {
  const f = {};
  if (from) f.$gte = from;
  if (to) f.$lt = new Date(to.getTime() + DAY_MS);
  return Object.keys(f).length ? f : null;
}

async function listPurchases({ farmerId, from, to, page = 1 }) {
  const filter = {};
  if (farmerId) filter.farmerId = farmerId;
  const df = dateFilter(from, to);
  if (df) filter.date = df;

  const [items, total] = await Promise.all([
    Purchase.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('farmerId', 'name village')
      .lean(),
    Purchase.countDocuments(filter),
  ]);
  return { items, page, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Loads + save()s (never findOneAndUpdate) so totals recompute. Audited. */
async function updatePurchase(id, patch, actor) {
  const purchase = await Purchase.findById(id);
  if (!purchase) throw httpError(404, 'Purchase not found');
  if (patch.farmerId) await assertFarmerExists(patch.farmerId);

  const before = purchase.toObject();
  Object.assign(purchase, patch);
  await purchase.save();

  await logAudit({
    actorId: actor._id,
    action: 'UPDATE',
    collectionName: 'purchases',
    documentId: purchase._id,
    before,
    after: purchase.toObject(),
  });
  return purchase;
}

async function deletePurchase(id, actor) {
  const purchase = await Purchase.findById(id);
  if (!purchase) throw httpError(404, 'Purchase not found');

  const before = purchase.toObject();
  await purchase.deleteOne();

  await logAudit({
    actorId: actor._id,
    action: 'DELETE',
    collectionName: 'purchases',
    documentId: before._id,
    before,
  });
}

module.exports = { createPurchase, listPurchases, updatePurchase, deletePurchase, dateFilter, PAGE_SIZE };
