const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { initDatabase, createOrder, getOrder } = require('./db');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;
const QUEUE_MANAGER_URL = process.env.QUEUE_MANAGER_URL || 'http://queue-manager:3002';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'order-intake' });
});

// Submit new order
app.post('/orders', async (req, res) => {
  try {
    const { type, items, customer_info, table_number } = req.body;

    // Validate
    if (!type || !items || items.length === 0) {
      return res.status(400).json({ error: 'type and items are required' });
    }

    if (!['dine-in', 'takeout', 'delivery'].includes(type)) {
      return res.status(400).json({ error: 'type must be dine-in, takeout, or delivery' });
    }

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = {
      id: orderId,
      type,
      items,
      customer_info,
      table_number: type === 'dine-in' ? table_number : null
    };

    // Save to database
    await createOrder(order);

    // Forward to Queue Manager
    try {
      await axios.post(`${QUEUE_MANAGER_URL}/queue/add`, order);
    } catch (error) {
      console.error('Failed to add order to queue:', error.message);
      // Continue even if queue manager fails
    }

    res.status(201).json({
      orderId,
      status: 'received',
      message: 'Order received and queued'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Initialize database and start server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Order Intake Service listening on port ${PORT}`);
  });
}

start();
