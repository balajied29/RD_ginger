const { z } = require('zod');
const { objectId } = require('./common');

/**
 * NOTE: totalKg is deliberately absent — it is server-computed from bags
 * and .strict() rejects it if sent. totalAmount is the final negotiated
 * price, entered directly (owner-approved change, 2026-07-12).
 */
const bag = z
  .object({
    bagNo: z.number().int().positive('Bag number must be positive'),
    weightKg: z.number().min(0.1, 'Bag weight must be at least 0.1 kg'),
    condition: z.enum(['dry', 'wet']).default('dry'),
    grade: z.enum(['high', 'mid', 'low']).default('high'),
  })
  .strict();

const createPurchase = z
  .object({
    farmerId: objectId,
    date: z.coerce.date(),
    crop: z.string().trim().min(1, 'Crop is required'),
    bags: z.array(bag).min(1, 'At least 1 bag is required'),
    totalAmount: z.number().min(1, 'Money must be at least ₹1').optional(),
    notes: z.string().trim().default(''),
  })
  .strict();

const updatePurchase = createPurchase
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No fields to update');

module.exports = { createPurchase, updatePurchase };
