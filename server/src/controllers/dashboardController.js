const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const dashboardService = require('../services/dashboardService');

const get = asyncHandler(async (req, res) => {
  ok(res, await dashboardService.getDashboard(req.query.period));
});

module.exports = { get };
