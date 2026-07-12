require('dotenv').config();
const { connectDB } = require('./db/connect');
const { createApp } = require('./app');

(async () => {
  if (!process.env.JWT_SECRET) {
    console.error('[server] JWT_SECRET is not set. Aborting.');
    process.exit(1);
  }
  await connectDB();
  const port = process.env.PORT || 4000;
  createApp().listen(port, () => {
    console.log(`[server] LEDGER API listening on port ${port}`);
  });
})();
