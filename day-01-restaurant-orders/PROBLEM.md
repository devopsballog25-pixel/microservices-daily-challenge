# Day 01: Restaurant Order Management System

## Problem Context

Restaurants are losing significant revenue due to operational inefficiencies:
- **15-20% of phone calls go unanswered** during rush hours, resulting in lost orders
- Kitchen staff struggle to **prioritize orders from multiple sources** (phone, dine-in, delivery)
- Managers lack **real-time visibility** into order status and kitchen performance
- Poor coordination between front-of-house and kitchen leads to delays and errors

This system addresses these real-world problems through microservices architecture.

---

## System Requirements

Build a **Restaurant Order Management System** with 4 microservices that handle order intake, kitchen workflow, queue management, and status tracking.

### Service 1: Order Intake Service
**Responsibility:** Accept orders from multiple channels

**Features:**
- REST API endpoint to receive new orders
- Accept orders with: order type (dine-in/takeout/delivery), items, customer info, table number (if dine-in)
- Assign unique order ID and timestamp
- Forward order to Queue Management Service

**Endpoints:**
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details

---

### Service 2: Queue Management Service
**Responsibility:** Manage order prioritization and kitchen workload

**Features:**
- Maintain active order queue with priority rules
- Priority logic: dine-in orders prioritized, then by timestamp
- Track average prep time per dish type
- Alert when kitchen is overloaded (>10 active orders)
- Remove orders from queue when marked complete

**Endpoints:**
- `GET /queue/active` - Get current queue
- `GET /queue/stats` - Get queue statistics
- `POST /queue/alert` - Check if alert threshold exceeded

---

### Service 3: Kitchen Display Service
**Responsibility:** Provide kitchen staff interface for order management

**Features:**
- Display active orders from queue in priority order
- Show order details (items, order time, type, table/customer)
- Allow marking orders as "in progress" or "completed"
- Calculate and display estimated completion time
- Update Queue Management when orders complete

**Endpoints:**
- `GET /kitchen/orders` - Get all active kitchen orders
- `PATCH /kitchen/orders/:id/start` - Mark order as in progress
- `PATCH /kitchen/orders/:id/complete` - Mark order as completed

---

### Service 4: Status Tracking Service
**Responsibility:** Track order lifecycle and provide status information

**Features:**
- Log all order state changes (received → queued → in-progress → completed)
- Provide order status lookup for customers/waitstaff
- Track completion times for analytics
- Generate daily summary reports (orders completed, average wait time, peak hours)

**Endpoints:**
- `GET /status/:orderId` - Get current order status
- `GET /status/history/:orderId` - Get full order history
- `GET /analytics/daily` - Get daily summary statistics

---

## Technical Requirements

### Data Storage
- **PostgreSQL** or **SQLite** for persistent order data
- **Redis** for real-time queue management and caching

### Communication
- Services communicate via **REST APIs**
- All endpoints should return JSON
- Proper HTTP status codes (200, 201, 404, 500, etc.)

### Containerization
- **Docker** containers for each service
- **Docker Compose** for orchestration
- Services must be independently deployable
- Health checks for each service

### Testing
- Basic **unit tests** for core business logic
- **Integration tests** demonstrating full order flow
- Tests should be runnable via `npm test` or `pytest` or similar

---

## Success Criteria

Your implementation will be considered successful if:

- [ ] All 4 services start successfully via `docker-compose up --build`
- [ ] Can submit a new order via Order Intake API
- [ ] Order appears in Queue Management Service
- [ ] Kitchen Display Service shows the order with correct priority
- [ ] Order can be marked as "in progress" then "completed"
- [ ] Status Tracking Service correctly shows order state transitions
- [ ] Alert triggers when more than 10 orders are in queue
- [ ] Basic tests pass
- [ ] README includes:
  - Architecture diagram (text/ASCII art is fine)
  - Setup and run instructions
  - API documentation with example requests
  - How to run tests

---

## Project Structure

Expected directory layout:
```
day-01-restaurant-orders/
├── services/
│   ├── order-intake/
│   ├── queue-manager/
│   ├── kitchen-display/
│   └── status-tracker/
├── docker-compose.yml
├── README.md
├── tests/
└── RESULTS.md
```

---

## Constraints & Preferences

### Tech Stack
- **Language:** Choose Node.js, Python, or Go (optimize for speed and clarity)
- **Frameworks:** Express/FastAPI/Gin or similar lightweight frameworks
- **Database:** PostgreSQL preferred, SQLite acceptable
- **Cache:** Redis for queue management

### Quality Standards
- Clean, readable code with comments where needed
- Proper error handling (don't crash on invalid input)
- Logging for debugging (order received, state changes, errors)
- Environment variables for configuration (ports, database URLs)

### Performance
- Order submission should respond in <100ms
- Kitchen display should update within 1 second of order submission
- System should handle 50+ orders without degradation

---

## Bonus Features (Optional)

If time and tokens permit:
- Simple web UI for kitchen display (HTML + JS)
- SMS/email notification when order is ready
- Real-time updates using WebSockets
- Order bundling for delivery orders going to same address
- Analytics dashboard showing peak hours and performance metrics

---

## Testing the System

### Example Order Flow
```bash
# 1. Submit an order
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dine-in",
    "items": ["burger", "fries", "soda"],
    "table": 5
  }'

# Response: {"orderId": "ORD-001", "status": "received"}

# 2. Check queue
curl http://localhost:3002/queue/active

# 3. View in kitchen display
curl http://localhost:3003/kitchen/orders

# 4. Mark as in progress
curl -X PATCH http://localhost:3003/kitchen/orders/ORD-001/start

# 5. Complete the order
curl -X PATCH http://localhost:3003/kitchen/orders/ORD-001/complete

# 6. Check status
curl http://localhost:3004/status/ORD-001

# 7. View daily analytics
curl http://localhost:3004/analytics/daily
```

---

## Evaluation Metrics

Your solution will be evaluated on:
1. **Completeness:** All 4 services implemented and working
2. **Functionality:** Core order flow works end-to-end
3. **Architecture:** Clean service boundaries, proper separation of concerns
4. **Code Quality:** Readable, maintainable code
5. **Documentation:** Clear README with all necessary information
6. **Testing:** Tests demonstrate key functionality
7. **Containerization:** Services run correctly in Docker

---

## Budget Constraint

- **Token Budget:** Aim to complete under 200k tokens (~$10 API cost)
- **Time Budget:** Complete in single session (no multi-day work)

Good luck! Build a system that would help real restaurants solve real problems.