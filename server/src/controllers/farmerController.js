const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const farmerService = require('../services/farmerService');
const ledgerService = require('../services/ledgerService');

const create = asyncHandler(async (req, res) => {
  ok(res, await farmerService.createFarmer(req.body, req.user), { status: 201 });
});

const list = asyncHandler(async (req, res) => {
  ok(res, await farmerService.listFarmers(req.query.search));
});

const get = asyncHandler(async (req, res) => {
  ok(res, await farmerService.getFarmer(req.params.id));
});

const ledger = asyncHandler(async (req, res) => {
  ok(res, await ledgerService.getLedger(req.params.id, req.query.from, req.query.to));
});

module.exports = { create, list, get, ledger };
