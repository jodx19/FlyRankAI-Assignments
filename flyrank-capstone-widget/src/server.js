const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve static files for the widget delivery
app.use(express.static(path.join(__dirname, '../public')));

// Routes
const publicRoutes = require('./routes/public');
const privateRoutes = require('./routes/private');

app.use('/api/public', publicRoutes);
app.use('/api', privateRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Fallback for 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  // Ensure we don't expose stack traces, and never return 500 for bad input payload sizes (express.json handles payload limits too if configured)
  if (err.type === 'entity.too.large') {
    return res.status(400).json({ error: 'Payload too large' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
