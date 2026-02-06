const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const {
  connect,
  addToQueue,
  getActiveOrders,
  getQueueCount,
  removeFromQueue
} = require('./redis');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3002;
const STATUS_TRACKER_URL = process.env.STATUS_TRACKER_URL || 'http://status-tracker:3004';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'queue-manager' });
});

// Add order to queue (internal)
app.post('/queue/add', async (req, res) => {
  try {
    const order = req.body;

    await addToQueue(order);

    // Log to status tracker
    try {
      await axios.post(`${STATUS_TRACKER_URL}/status/log`, {
        order_id: order.id,
        state: 'queued'
      });
    } catch (error) {
      console.error('Failed to log status:', error.message);
    }

    // Check for alert condition
    const count = await getQueueCount();
    if (count > 10) {
      console.warn(`⚠️  ALERT: Queue has ${count} orders (exceeds threshold of 10)`);
    }

    res.json({ success: true, message: 'Order added to queue', queueCount: count });
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ error: 'Failed to add order to queue' });
  }
});

// Get active orders
app.get('/queue/active', async (req, res) => {
  try {
    const orders = await getActiveOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ error: 'Failed to fetch active orders' });
  }
});

// Get queue statistics
app.get('/queue/stats', async (req, res) => {
  try {
    const count = await getQueueCount();
    res.json({
      activeCount: count,
      alert: count > 10
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Remove order from queue (internal)
app.delete('/queue/remove/:id', async (req, res) => {
  try {
    await removeFromQueue(req.params.id);
    res.json({ success: true, message: 'Order removed from queue' });
  } catch (error) {
    console.error('Error removing from queue:', error);
    res.status(500).json({ error: 'Failed to remove order from queue' });
  }
});

// Start server
async function start() {
  await connect();
  app.listen(PORT, () => {
    console.log(`Queue Manager Service listening on port ${PORT}`);
  });
}

start();
