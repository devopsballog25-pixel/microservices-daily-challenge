# Restaurant Order Management System

A complete microservices-based restaurant order management system built with Node.js, PostgreSQL, and Redis.

## Problem Statement

Build a restaurant order management system with 4 microservices that handle order intake, queue management, kitchen display, and status tracking. The system must process orders with priority (dine-in orders have higher priority than takeout/delivery), track state transitions, and alert when queue exceeds 10 orders.

## Architecture

```
┌─────────────────┐
│   Order Intake  │ :3001
│   (PostgreSQL)  │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────────┐   ┌─────────────────┐
│  Queue Manager  │   │ Status Tracker  │
│     (Redis)     │   │  (PostgreSQL)   │
│      :3002      │   │      :3004      │
└────────┬────────┘   └─────────────────┘
         │
         ▼
┌─────────────────┐
│Kitchen Display  │ :3003
│  (Coordinates)  │
└─────────────────┘
```

### Data Flow

1. **Order Submission**: Client → Order Intake → PostgreSQL + Queue Manager
2. **Queue Management**: Queue Manager → Redis (sorted set by priority)
3. **Status Logging**: All state changes → Status Tracker → PostgreSQL
4. **Kitchen Operations**: Kitchen Display → Queue Manager (read) + Status Tracker (update)

### Priority Logic

Orders in the queue are prioritized using Redis sorted sets:
- **Dine-in orders**: Score = timestamp - 24 hours (higher priority)
- **Takeout/Delivery**: Score = timestamp (lower priority)

Lower score = processed first, ensuring dine-in orders are always prioritized.

## Services

### 1. Order Intake Service (Port 3001)
- Receives and validates new orders
- Stores orders in PostgreSQL
- Forwards to Queue Manager
- **Endpoints**:
  - `POST /orders` - Submit new order
  - `GET /orders/:id` - Get order details
  - `GET /health` - Health check

### 2. Queue Manager Service (Port 3002)
- Manages active order queue using Redis
- Implements priority sorting
- Triggers alerts when queue > 10 orders
- **Endpoints**:
  - `GET /queue/active` - Get all active orders (priority sorted)
  - `GET /queue/stats` - Get queue statistics
  - `POST /queue/add` - Add order to queue (internal)
  - `DELETE /queue/remove/:id` - Remove order (internal)
  - `GET /health` - Health check

### 3. Kitchen Display Service (Port 3003)
- Displays orders for kitchen staff
- Manages order state transitions
- **Endpoints**:
  - `GET /kitchen/orders` - Get all orders in priority order
  - `PATCH /kitchen/orders/:id/start` - Mark order as in-progress
  - `PATCH /kitchen/orders/:id/complete` - Mark order as completed
  - `GET /health` - Health check

### 4. Status Tracker Service (Port 3004)
- Logs all order state transitions
- Calculates wait times and analytics
- **Endpoints**:
  - `GET /status/:orderId` - Get current order status
  - `GET /status/history/:orderId` - Get complete state history
  - `GET /analytics/daily` - Get daily analytics
  - `POST /status/log` - Log state change (internal)
  - `GET /health` - Health check

## Technology Stack

- **Backend**: Node.js 18 with Express
- **Databases**:
  - PostgreSQL 15 (order storage, status tracking)
  - Redis 7 (queue management)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with Axios

## Prerequisites

- Docker Desktop
- Node.js 18+ (for running tests locally)

## Running the System

### 1. Start All Services

```bash
docker-compose up --build
```

This will:
- Start PostgreSQL and Redis
- Build and start all 4 microservices
- Create necessary databases and tables

### 2. Create Required Databases

If services fail with "database does not exist" errors:

```bash
docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE orders;"
docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE status;"
docker-compose restart order-intake status-tracker
```

### 3. Verify Services

```bash
curl http://localhost:3001/health  # Order Intake
curl http://localhost:3002/health  # Queue Manager
curl http://localhost:3003/health  # Kitchen Display
curl http://localhost:3004/health  # Status Tracker
```

## API Examples

### Submit an Order

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dine-in",
    "items": [
      {"name": "Burger", "quantity": 2},
      {"name": "Fries", "quantity": 1}
    ],
    "table_number": 5,
    "customer_info": {"name": "John Doe"}
  }'
```

Response:
```json
{
  "orderId": "ORD-1770331083799-d9k20cwl0",
  "status": "received",
  "message": "Order received and queued"
}
```

### View Active Orders

```bash
curl http://localhost:3002/queue/active
```

### View Kitchen Orders (Priority Sorted)

```bash
curl http://localhost:3003/kitchen/orders
```

### Mark Order as In-Progress

```bash
curl -X PATCH http://localhost:3003/kitchen/orders/ORD-1770331083799-d9k20cwl0/start
```

### Mark Order as Completed

```bash
curl -X PATCH http://localhost:3003/kitchen/orders/ORD-1770331083799-d9k20cwl0/complete
```

### Check Order Status

```bash
curl http://localhost:3004/status/ORD-1770331083799-d9k20cwl0
```

### View Complete Order History

```bash
curl http://localhost:3004/status/history/ORD-1770331083799-d9k20cwl0
```

Response:
```json
[
  {"state": "queued", "timestamp": "2026-02-05T22:38:03.830Z"},
  {"state": "in-progress", "timestamp": "2026-02-05T22:38:13.127Z"},
  {"state": "completed", "timestamp": "2026-02-05T22:38:19.027Z"}
]
```

### Get Queue Statistics

```bash
curl http://localhost:3002/queue/stats
```

Response:
```json
{
  "activeCount": 3,
  "alert": false
}
```

### Get Daily Analytics

```bash
curl http://localhost:3004/analytics/daily
```

## Testing

### Run Automated Tests

```bash
cd tests
npm install
npm test
```

### Test Coverage

The test suite validates:
- All services are healthy
- Order submission works
- Orders appear in queue
- Kitchen display shows orders
- State transitions (queued → in-progress → completed)
- Status tracking logs all changes
- Alert triggers when queue > 10 orders
- Dine-in priority works correctly

### Manual Test Flow

1. Submit a dine-in order
2. Submit a takeout order
3. Verify dine-in appears first in kitchen display
4. Mark dine-in as in-progress
5. Check status tracker shows in-progress
6. Mark as completed
7. Verify complete state history
8. Submit 11 orders and check for alert in logs

## Project Structure

```
day-01-restaurant-orders/
├── services/
│   ├── order-intake/
│   │   ├── server.js          # Express server
│   │   ├── db.js              # PostgreSQL client
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── queue-manager/
│   │   ├── server.js          # Express server
│   │   ├── redis.js           # Redis client with priority logic
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── kitchen-display/
│   │   ├── server.js          # Express server
│   │   ├── package.json
│   │   └── Dockerfile
│   └── status-tracker/
│       ├── server.js          # Express server
│       ├── db.js              # PostgreSQL client
│       ├── package.json
│       └── Dockerfile
├── tests/
│   ├── integration.test.js    # Jest test suite
│   └── package.json
├── docker-compose.yml         # Container orchestration
├── README.md                  # This file
├── RESULTS.md                 # Implementation results
└── PROBLEM.md                 # Original requirements
```

## Stopping the System

```bash
docker-compose down
```

To remove all data:

```bash
docker-compose down -v
```

## Troubleshooting

### Services Keep Restarting

Check if databases exist:
```bash
docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -l
```

Create missing databases:
```bash
docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE orders;"
docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE status;"
```

### View Service Logs

```bash
docker-compose logs order-intake
docker-compose logs queue-manager
docker-compose logs kitchen-display
docker-compose logs status-tracker
```

### Check Service Health

```bash
docker-compose ps
```

All services should show "Up" status.

## Success Criteria

- [x] All 4 services start via `docker-compose up --build`
- [x] Can submit order via Order Intake API
- [x] Order appears in Queue Management Service
- [x] Kitchen Display Service shows order with correct priority
- [x] Can mark order as "in progress"
- [x] Can mark order as "completed"
- [x] Status Tracking Service shows correct state transitions
- [x] Alert triggers when >10 orders in queue
- [x] Automated tests exist and pass
- [x] README.md is complete with all sections
- [x] System handles example test flow from PROBLEM.md
