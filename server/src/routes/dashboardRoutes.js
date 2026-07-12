const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimits');
const { dashboardQuery } = require('../schemas/common');
const c = require('../controllers/dashboardController');

router.use(requireAuth, apiLimiter);
router.get('/', validate(dashboardQuery, 'query'), c.get);

module.exports = router;
