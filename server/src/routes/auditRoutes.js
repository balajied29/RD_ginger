const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimits');
const { pageQuery } = require('../schemas/common');
const c = require('../controllers/auditController');

router.use(requireAuth, apiLimiter, requireRole('admin'));
router.get('/', validate(pageQuery, 'query'), c.list);

module.exports = router;
