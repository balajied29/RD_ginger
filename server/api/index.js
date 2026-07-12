/**
 * Vercel serverless entry: every route is rewritten here (vercel.json)
 * and handled by the same Express app used locally. DB connection is
 * cached across warm invocations.
 */
const { createApp } = require('../src/app');
const { ensureConnection } = require('../src/db/connectCached');

const app = createApp();

module.exports = async (req, res) => {
  try {
    await ensureConnection();
  } catch (err) {
    console.error('[db]', err.message);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, data: null, error: 'Database unavailable' }));
  }
  return app(req, res);
};
