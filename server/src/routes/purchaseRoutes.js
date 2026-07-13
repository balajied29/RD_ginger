const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { requireRole } = require('../middleware/requireRole');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimits');
const { listQuery } = require('../schemas/common');
const schemas = require('../schemas/purchaseSchemas');
const c = require('../controllers/purchaseController');

router.use(requireAuth, apiLimiter);
router.post('/', validate(schemas.createPurchase), c.create);
router.get('/', validate(listQuery, 'query'), c.list);
// PATCH is staff-accessible so the paying staff can add a missing
// price; the service restricts staff to exactly that one operation.
router.patch('/:id', validate(schemas.updatePurchase), c.update);
router.delete('/:id', requireRole('admin'), c.remove);

module.exports = router;
