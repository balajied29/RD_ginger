const mongoose = require('mongoose');

/**
 * AuditLog — append-only trail of every CREATE / UPDATE / DELETE on
 * farmers, purchases, and payments (Section 4.1). No route may modify
 * or delete these; model-level hooks below enforce it as a backstop.
 */
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    before: { type: Object, default: null },
    after: { type: Object, default: null },
    at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { collection: 'audit_logs' }
);

// Append-only backstop: block every update/delete path through Mongoose.
const blocked = [
  'updateOne',
  'updateMany',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'deleteOne',
  'deleteMany',
  'findOneAndDelete',
];
blocked.forEach((op) => {
  auditLogSchema.pre(op, function rejectMutation(next) {
    next(new Error('Audit logs are append-only.'));
  });
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
