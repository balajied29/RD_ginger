const { z } = require('zod');

const login = z
  .object({
    email: z.string().trim().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

const createUser = z
  .object({
    email: z.string().trim().email('Enter a valid email'),
    name: z.string().trim().min(1, 'Name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['admin', 'staff']).default('staff'),
  })
  .strict();

const updateUser = z
  .object({
    active: z.boolean().optional(),
    role: z.enum(['admin', 'staff']).optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'No fields to update');

const changePassword = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  })
  .strict();

module.exports = { login, createUser, updateUser, changePassword };
