const { fail } = require('../utils/respond');

/**
 * Final error middleware (Section 4.3). Known errors map to their HTTP
 * code; everything else logs server-side and returns a generic 500 —
 * stack traces are never leaked to the client.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.status) return fail(res, err.status, err.message);
  // CastError from Mongoose queries; BSONError from explicit ObjectId
  // construction (e.g. in aggregation matches) — both are bad client ids.
  if (err.name === 'CastError' || err.name === 'BSONError') {
    return fail(res, 400, 'Invalid id format');
  }
  if (err.name === 'ValidationError') return fail(res, 400, err.message);
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'Malformed JSON body');

  console.error('[error]', err);
  return fail(res, 500, 'Server error');
}

module.exports = { errorHandler };
