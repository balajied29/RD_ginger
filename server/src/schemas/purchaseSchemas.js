const { z } = require('zod');
const { objectId } = require('./common');

/**
 * NOTE: totalKg/totalAmount are deliberately absent — totals are
 * server-computed (canonical rule) and .strict() rejects them if sent.
 */
const bag = z
  .object({
    bagNo: z.number().int().positive('Bag number must be positive'),
    weightKg: z.number().min(0.1, 'Bag weight must be at least 0.1 kg'),
  })
  .strict();

const createPurchase = z
  .object({
    farmerId: objectId,
    date: z.coerce.date(),
    crop: z.string().trim().min(1, 'Crop is required'),
    bags: z.array(bag).min(1, 'At least 1 bag is required'),
    ratePerKg: z.number().min(0, 'Rate cannot be negative'),
    notes: z.string().trim().default(''),
  })
  .strict();

const updatePurchase = createPurchase
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No fields to update');

module.exports = { createPurchase, updatePurchase };
