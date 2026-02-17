const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'web-ui' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Web UI] Service running on port ${PORT}`);
  console.log(`[Web UI] Open http://localhost:${PORT} in your browser`);
});
