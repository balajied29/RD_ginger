const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { fail } = require('./utils/respond');

function createApp() {
  const app = express();

  // CORS locked to the frontend origin (Section 4.2).
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/purchases', purchaseRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/audit', auditRoutes);

  // Deny by default: any route not in the Section 2.3 table does not exist.
  app.use((req, res) => fail(res, 404, 'Not found'));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
