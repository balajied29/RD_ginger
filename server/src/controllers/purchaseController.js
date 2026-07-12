const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const purchaseService = require('../services/purchaseService');

const create = asyncHandler(async (req, res) => {
  ok(res, await purchaseService.createPurchase(req.body, req.user), { status: 201 });
});

const list = asyncHandler(async (req, res) => {
  ok(res, await purchaseService.listPurchases(req.query));
});

const update = asyncHandler(async (req, res) => {
  ok(res, await purchaseService.updatePurchase(req.params.id, req.body, req.user));
});

const remove = asyncHandler(async (req, res) => {
  await purchaseService.deletePurchase(req.params.id, req.user);
  ok(res, { deleted: true });
});

module.exports = { create, list, update, remove };
