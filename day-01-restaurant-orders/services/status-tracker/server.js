const express = require('express');
const bodyParser = require('body-parser');
const {
  initDatabase,
  logState,
  getCurrentState,
  getStateHistory,
  getDailyAnalytics
} = require('./db');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3004;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'status-tracker' });
});

// Log state change (internal)
app.post('/status/log', async (req, res) => {
  try {
    const { order_id, state } = req.body;

    if (!order_id || !state) {
      return res.status(400).json({ error: 'order_id and state are required' });
    }

    await logState(order_id, state);
    res.json({ success: true, message: 'State logged' });
  } catch (error) {
    console.error('Error logging state:', error);
    res.status(500).json({ error: 'Failed to log state' });
  }
});

// Get current status
app.get('/status/:orderId', async (req, res) => {
  try {
    const state = await getCurrentState(req.params.orderId);
    if (!state) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(state);
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// Get state history
app.get('/status/history/:orderId', async (req, res) => {
  try {
    const history = await getStateHistory(req.params.orderId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get daily analytics
app.get('/analytics/daily', async (req, res) => {
  try {
    const analytics = await getDailyAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Start server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Status Tracker Service listening on port ${PORT}`);
  });
}

start();
