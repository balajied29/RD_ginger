const rateLimit = require('express-rate-limit');

const limitBody = (error) => ({ success: false, data: null, error });

/** Login: 5 attempts/min per IP (Section 2.2 #7). */
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json(limitBody('Too many login attempts. Try again in a minute.')),
});

/**
 * General API: 100 req/min per user (Section 4.2).
 * Mounted AFTER requireAuth, so req.user always exists here.
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user._id),
  handler: (req, res) =>
    res.status(429).json(limitBody('Too many requests. Slow down.')),
});

module.exports = { loginLimiter, apiLimiter };
