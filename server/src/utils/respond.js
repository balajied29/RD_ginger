/**
 * Canonical API response shape (Section 4.3):
 * every response is { success, data, error?, warning? }.
 */
function ok(res, data, opts = {}) {
  const body = { success: true, data };
  if (opts.warning) body.warning = opts.warning;
  return res.status(opts.status || 200).json(body);
}

function fail(res, status, error) {
  return res.status(status).json({ success: false, data: null, error });
}

/** Error carrying an HTTP status; the errorHandler maps it to `fail`. */
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { ok, fail, httpError };
