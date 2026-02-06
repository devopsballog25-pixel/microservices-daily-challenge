const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3003;
const QUEUE_MANAGER_URL = process.env.QUEUE_MANAGER_URL || 'http://queue-manager:3002';
const STATUS_TRACKER_URL = process.env.STATUS_TRACKER_URL || 'http://status-tracker:3004';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'kitchen-display' });
});

// Get all orders for kitchen display
app.get('/kitchen/orders', async (req, res) => {
  try {
    const response = await axios.get(`${QUEUE_MANAGER_URL}/queue/active`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Mark order as started (in-progress)
app.patch('/kitchen/orders/:id/start', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Log state change to status tracker
    await axios.post(`${STATUS_TRACKER_URL}/status/log`, {
      order_id: orderId,
      state: 'in-progress'
    });

    res.json({
      success: true,
      message: 'Order marked as in-progress',
      orderId
    });
  } catch (error) {
    console.error('Error starting order:', error.message);
    res.status(500).json({ error: 'Failed to start order' });
  }
});

// Mark order as completed
app.patch('/kitchen/orders/:id/complete', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Remove from queue
    await axios.delete(`${QUEUE_MANAGER_URL}/queue/remove/${orderId}`);

    // Log completion to status tracker
    await axios.post(`${STATUS_TRACKER_URL}/status/log`, {
      order_id: orderId,
      state: 'completed'
    });

    res.json({
      success: true,
      message: 'Order marked as completed',
      orderId
    });
  } catch (error) {
    console.error('Error completing order:', error.message);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

app.listen(PORT, () => {
  console.log(`Kitchen Display Service listening on port ${PORT}`);
});
