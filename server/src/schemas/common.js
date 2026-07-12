const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

/** ?farmerId=&from=&to=&page= for purchase/payment lists (25/page). */
const listQuery = z
  .object({
    farmerId: objectId.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).default(1),
  })
  .strict();

/** ?page= for the audit log viewer. */
const pageQuery = z
  .object({ page: z.coerce.number().int().min(1).default(1) })
  .strict();

/** ?period= for the dashboard (Section 2.3). */
const dashboardQuery = z
  .object({ period: z.enum(['today', 'month', 'year']).default('today') })
  .strict();

module.exports = { objectId, listQuery, pageQuery, dashboardQuery };
