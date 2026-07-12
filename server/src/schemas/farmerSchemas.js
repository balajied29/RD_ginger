const { z } = require('zod');

const createFarmer = z
  .object({
    name: z.string().trim().min(1, 'Farmer name is required'),
    phone: z.string().trim().default(''),
    village: z.string().trim().default(''),
  })
  .strict();

const searchQuery = z
  .object({ search: z.string().trim().default('') })
  .strict();

const ledgerQuery = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

module.exports = { createFarmer, searchQuery, ledgerQuery };
