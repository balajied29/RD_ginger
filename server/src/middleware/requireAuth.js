const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/respond');

/**
 * Verifies the Bearer JWT, loads the user, checks active (Section 2.2).
 * Invalid/expired token -> 401. Valid token, inactive/missing user -> 403.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return fail(res, 401, 'Invalid or expired token');
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return fail(res, 403, 'Account inactive or not found');
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };
