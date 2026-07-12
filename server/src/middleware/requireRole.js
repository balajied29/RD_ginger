const { fail } = require('../utils/respond');

/** Role gate; must run after requireAuth. Deny by default (Section 4.2). */
const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return fail(res, 403, 'Insufficient permissions');
  }
  return next();
};

module.exports = { requireRole };
