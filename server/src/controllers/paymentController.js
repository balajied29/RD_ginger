const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const paymentService = require('../services/paymentService');

const create = asyncHandler(async (req, res) => {
  const { payment, warning, balanceAfter } = await paymentService.createPayment(req.body, req.user);
  ok(res, { ...payment.toObject(), balanceAfter }, { status: 201, warning });
});

const list = asyncHandler(async (req, res) => {
  ok(res, await paymentService.listPayments(req.query));
});

const update = asyncHandler(async (req, res) => {
  ok(res, await paymentService.updatePayment(req.params.id, req.body, req.user));
});

const remove = asyncHandler(async (req, res) => {
  await paymentService.deletePayment(req.params.id, req.user);
  ok(res, { deleted: true });
});

module.exports = { create, list, update, remove };
