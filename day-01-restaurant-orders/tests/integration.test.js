const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost';
const ORDER_INTAKE_URL = `${BASE_URL}:3001`;
const QUEUE_MANAGER_URL = `${BASE_URL}:3002`;
const KITCHEN_DISPLAY_URL = `${BASE_URL}:3003`;
const STATUS_TRACKER_URL = `${BASE_URL}:3004`;

// Helper to wait
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Restaurant Order Management System', () => {
  let testOrderId;

  test('All services should be healthy', async () => {
    const services = [
      { name: 'Order Intake', url: `${ORDER_INTAKE_URL}/health` },
      { name: 'Queue Manager', url: `${QUEUE_MANAGER_URL}/health` },
      { name: 'Kitchen Display', url: `${KITCHEN_DISPLAY_URL}/health` },
      { name: 'Status Tracker', url: `${STATUS_TRACKER_URL}/health` }
    ];

    for (const service of services) {
      const response = await axios.get(service.url);
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
    }
  });

  test('Should submit a new order via Order Intake', async () => {
    const order = {
      type: 'dine-in',
      items: [
        { name: 'Burger', quantity: 2 },
        { name: 'Fries', quantity: 1 }
      ],
      table_number: 5,
      customer_info: { name: 'John Doe' }
    };

    const response = await axios.post(`${ORDER_INTAKE_URL}/orders`, order);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('orderId');
    expect(response.data.status).toBe('received');

    testOrderId = response.data.orderId;
  });

  test('Order should appear in queue', async () => {
    await sleep(1000); // Wait for order to propagate

    const response = await axios.get(`${QUEUE_MANAGER_URL}/queue/active`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    const order = response.data.find(o => o.id === testOrderId);
    expect(order).toBeDefined();
    expect(order.type).toBe('dine-in');
  });

  test('Kitchen Display should show the order', async () => {
    const response = await axios.get(`${KITCHEN_DISPLAY_URL}/kitchen/orders`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    const order = response.data.find(o => o.id === testOrderId);
    expect(order).toBeDefined();
  });

  test('Should mark order as in-progress', async () => {
    const response = await axios.patch(
      `${KITCHEN_DISPLAY_URL}/kitchen/orders/${testOrderId}/start`
    );
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    await sleep(500);

    // Check status tracker
    const statusResponse = await axios.get(`${STATUS_TRACKER_URL}/status/${testOrderId}`);
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.data.state).toBe('in-progress');
  });

  test('Should mark order as completed', async () => {
    const response = await axios.patch(
      `${KITCHEN_DISPLAY_URL}/kitchen/orders/${testOrderId}/complete`
    );
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);

    await sleep(500);

    // Check status tracker
    const statusResponse = await axios.get(`${STATUS_TRACKER_URL}/status/${testOrderId}`);
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.data.state).toBe('completed');
  });

  test('Status Tracker should show complete state history', async () => {
    const response = await axios.get(`${STATUS_TRACKER_URL}/status/history/${testOrderId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);

    const states = response.data.map(s => s.state);
    expect(states).toContain('queued');
    expect(states).toContain('in-progress');
    expect(states).toContain('completed');
  });

  test('Should trigger alert when queue exceeds 10 orders', async () => {
    // Submit 11 orders
    const orders = [];
    for (let i = 0; i < 11; i++) {
      const order = {
        type: 'takeout',
        items: [{ name: 'Test Item', quantity: 1 }],
        customer_info: { name: `Customer ${i}` }
      };
      orders.push(axios.post(`${ORDER_INTAKE_URL}/orders`, order));
    }

    await Promise.all(orders);
    await sleep(1000);

    const response = await axios.get(`${QUEUE_MANAGER_URL}/queue/stats`);
    expect(response.status).toBe(200);
    expect(response.data.activeCount).toBeGreaterThan(10);
    expect(response.data.alert).toBe(true);
  });

  test('Dine-in orders should have higher priority than takeout', async () => {
    // Clear queue first by getting and completing all orders
    const queueResponse = await axios.get(`${QUEUE_MANAGER_URL}/queue/active`);
    for (const order of queueResponse.data) {
      await axios.patch(`${KITCHEN_DISPLAY_URL}/kitchen/orders/${order.id}/complete`);
    }

    await sleep(500);

    // Submit takeout order first
    const takeoutResponse = await axios.post(`${ORDER_INTAKE_URL}/orders`, {
      type: 'takeout',
      items: [{ name: 'Pizza', quantity: 1 }],
      customer_info: { name: 'Takeout Customer' }
    });
    const takeoutId = takeoutResponse.data.orderId;

    await sleep(100);

    // Submit dine-in order second
    const dineInResponse = await axios.post(`${ORDER_INTAKE_URL}/orders`, {
      type: 'dine-in',
      items: [{ name: 'Pasta', quantity: 1 }],
      table_number: 3,
      customer_info: { name: 'Dine-in Customer' }
    });
    const dineInId = dineInResponse.data.orderId;

    await sleep(1000);

    // Check queue order - dine-in should be first
    const response = await axios.get(`${KITCHEN_DISPLAY_URL}/kitchen/orders`);
    expect(response.status).toBe(200);

    const orderIds = response.data.map(o => o.id);
    const dineInIndex = orderIds.indexOf(dineInId);
    const takeoutIndex = orderIds.indexOf(takeoutId);

    // Dine-in should appear before takeout
    expect(dineInIndex).toBeLessThan(takeoutIndex);
  });
});
