const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimits');
const { listQuery } = require('../schemas/common');
const schemas = require('../schemas/paymentSchemas');
const c = require('../controllers/paymentController');

router.use(requireAuth, apiLimiter);
router.post('/', validate(schemas.createPayment), c.create);
router.get('/', validate(listQuery, 'query'), c.list);
router.patch('/:id', requireRole('admin'), validate(schemas.updatePayment), c.update);
router.delete('/:id', requireRole('admin'), c.remove);

module.exports = router;
