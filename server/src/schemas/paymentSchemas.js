const { z } = require('zod');
const { objectId } = require('./common');

const createPayment = z
  .object({
    farmerId: objectId,
    date: z.coerce.date(),
    amount: z.number().min(1, 'Amount must be at least ₹1'),
    mode: z.enum(['cash', 'upi', 'bank']),
    notes: z.string().trim().default(''),
  })
  .strict();

const updatePayment = createPayment
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No fields to update');

module.exports = { createPayment, updatePayment };
