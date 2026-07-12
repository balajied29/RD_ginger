const router = require('express').Router();
const { requireAuth } = require('../middleware/requireAuth');
const { validate } = require('../middleware/validate');
const { apiLimiter } = require('../middleware/rateLimits');
const schemas = require('../schemas/farmerSchemas');
const c = require('../controllers/farmerController');

router.use(requireAuth, apiLimiter);
router.post('/', validate(schemas.createFarmer), c.create);
router.get('/', validate(schemas.searchQuery, 'query'), c.list);
router.get('/:id', c.get);
router.get('/:id/ledger', validate(schemas.ledgerQuery, 'query'), c.ledger);

module.exports = router;
