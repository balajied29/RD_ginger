const Payment = require('../models/Payment');
const { httpError } = require('../utils/respond');
const { logAudit } = require('./auditService');
const { getFarmerBalance } = require('./farmerService');
const { dateFilter, PAGE_SIZE } = require('./purchaseService');

/**
 * Overpayment is ALLOWED; when amount exceeds the farmer's balance at
 * the time of recording, the response carries warning: "OVERPAYMENT"
 * (canonical business rule). Balance is checked BEFORE inserting.
 * balanceAfter feeds the receipt the UI shows once payment is saved.
 */
async function createPayment(data, actor) {
  const balance = await getFarmerBalance(data.farmerId); // throws 404 if farmer missing
  const payment = await Payment.create({ ...data, createdBy: actor._id });

  await logAudit({
    actorId: actor._id,
    action: 'CREATE',
    collectionName: 'payments',
    documentId: payment._id,
    after: payment.toObject(),
  });

  return {
    payment,
    warning: data.amount > balance ? 'OVERPAYMENT' : undefined,
    balanceAfter: Math.round((balance - payment.amount) * 100) / 100,
  };
}

async function listPayments({ farmerId, from, to, page = 1 }) {
  const filter = {};
  if (farmerId) filter.farmerId = farmerId;
  const df = dateFilter(from, to);
  if (df) filter.date = df;

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('farmerId', 'name village')
      .lean(),
    Payment.countDocuments(filter),
  ]);
  return { items, page, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

async function updatePayment(id, patch, actor) {
  const payment = await Payment.findById(id);
  if (!payment) throw httpError(404, 'Payment not found');
  if (patch.farmerId) await getFarmerBalance(patch.farmerId); // existence check

  const before = payment.toObject();
  Object.assign(payment, patch);
  await payment.save();

  await logAudit({
    actorId: actor._id,
    action: 'UPDATE',
    collectionName: 'payments',
    documentId: payment._id,
    before,
    after: payment.toObject(),
  });
  return payment;
}

async function deletePayment(id, actor) {
  const payment = await Payment.findById(id);
  if (!payment) throw httpError(404, 'Payment not found');

  const before = payment.toObject();
  await payment.deleteOne();

  await logAudit({
    actorId: actor._id,
    action: 'DELETE',
    collectionName: 'payments',
    documentId: before._id,
    before,
  });
}

module.exports = { createPayment, listPayments, updatePayment, deletePayment };
