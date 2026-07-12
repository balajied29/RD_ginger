const { asyncHandler } = require('../utils/asyncHandler');
const { ok } = require('../utils/respond');
const { listAuditLogs } = require('../services/auditService');

const list = asyncHandler(async (req, res) => {
  ok(res, await listAuditLogs(req.query.page));
});

module.exports = { list };
