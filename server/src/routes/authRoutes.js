const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { loginLimiter, apiLimiter } = require('../middleware/rateLimits');
const schemas = require('../schemas/authSchemas');
const c = require('../controllers/authController');

// Public — the ONLY unauthenticated route in the API (Section 2.2 #5).
router.post('/login', loginLimiter, validate(schemas.login), c.login);

// Staff
router.use(requireAuth, apiLimiter);
router.get('/me', c.me);
router.post('/change-password', validate(schemas.changePassword), c.changePassword);

// Admin
router.use(requireRole('admin'));
router.post('/users', validate(schemas.createUser), c.createUser);
router.get('/users', c.listUsers);
router.patch('/users/:id', validate(schemas.updateUser), c.updateUser);

module.exports = router;
