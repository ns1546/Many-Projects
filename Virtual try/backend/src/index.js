const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const tryonRoutes = require('./routes/tryon');
const healthRoutes = require('./routes/health');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Routes
app.use('/api', healthRoutes);
app.use('/api/tryon', tryonRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    request_id: req.id || 'unknown'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
