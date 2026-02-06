const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));

async function connect() {
  await client.connect();
  console.log('Connected to Redis');
}

async function addToQueue(order) {
  const score = calculatePriority(order);
  await client.zAdd('active_orders', {
    score,
    value: JSON.stringify(order)
  });
}

async function getActiveOrders() {
  const orders = await client.zRange('active_orders', 0, -1);
  return orders.map(o => JSON.parse(o));
}

async function getQueueCount() {
  return await client.zCard('active_orders');
}

async function removeFromQueue(orderId) {
  const orders = await client.zRange('active_orders', 0, -1);
  for (const orderStr of orders) {
    const order = JSON.parse(orderStr);
    if (order.id === orderId) {
      await client.zRem('active_orders', orderStr);
      break;
    }
  }
}

function calculatePriority(order) {
  // Lower score = higher priority (processed first)
  const timestamp = Date.now();

  // Dine-in orders get priority (subtract 1 day in ms)
  if (order.type === 'dine-in') {
    return timestamp - (24 * 60 * 60 * 1000);
  }

  return timestamp;
}

module.exports = {
  connect,
  addToQueue,
  getActiveOrders,
  getQueueCount,
  removeFromQueue
};
