const { fail } = require('../utils/respond');

/**
 * Zod validation middleware (Section 4.2): every input validated BEFORE
 * any DB call. Schemas use .strict() so unknown keys are rejected.
 * On success, req[source] is replaced with the parsed (typed) data.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.join('.') || 'input'}: ${i.message}`)
      .join('; ');
    return fail(res, 400, msg);
  }
  req[source] = result.data;
  return next();
};

module.exports = { validate };
