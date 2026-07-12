const AuditLog = require('../models/AuditLog');

const PAGE_SIZE = 25;

/**
 * Writes one audit entry (Section 4.1). Called from the same service
 * function as the mutation it records.
 */
async function logAudit({ actorId, action, collectionName, documentId, before = null, after = null }) {
  await AuditLog.create({ actorId, action, collectionName, documentId, before, after });
}

async function listAuditLogs(page = 1) {
  const [items, total] = await Promise.all([
    AuditLog.find()
      .sort({ at: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('actorId', 'name email')
      .lean(),
    AuditLog.countDocuments(),
  ]);
  return { items, page, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

module.exports = { logAudit, listAuditLogs };
