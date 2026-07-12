const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/respond');

/**
 * Verifies the Bearer JWT, loads the user, checks active (Section 2.2).
 * Invalid/expired token -> 401. Valid token, inactive/missing user -> 403.
 *
 * The user doc is cached for 30s per instance so every request doesn't
 * pay a DB round-trip; deactivation/role changes propagate within 30s.
 */
const USER_TTL_MS = 30 * 1000;
const USER_CACHE_MAX = 500;
const userCache = new Map(); // userId -> { user, exp }

async function loadUser(id) {
  const hit = userCache.get(id);
  if (hit && hit.exp > Date.now()) return hit.user;
  const user = await User.findById(id);
  if (user) {
    if (userCache.size >= USER_CACHE_MAX) userCache.clear();
    userCache.set(id, { user, exp: Date.now() + USER_TTL_MS });
  } else {
    userCache.delete(id);
  }
  return user;
}

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
    const user = await loadUser(payload.sub);
    if (!user || !user.active) return fail(res, 403, 'Account inactive or not found');
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Drop a user from the cache (call after role/active changes). */
function invalidateUserCache(id) {
  userCache.delete(String(id));
}

module.exports = { requireAuth, invalidateUserCache };
