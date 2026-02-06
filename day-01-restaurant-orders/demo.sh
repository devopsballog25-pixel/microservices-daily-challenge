#!/bin/bash

echo "=========================================="
echo "Restaurant Order Management System - Demo"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Check all services are healthy${NC}"
echo "--------------------------------------"
curl -s http://localhost:3001/health | jq
curl -s http://localhost:3002/health | jq
curl -s http://localhost:3003/health | jq
curl -s http://localhost:3004/health | jq
echo ""

echo -e "${BLUE}Step 2: Submit a dine-in order${NC}"
echo "--------------------------------------"
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dine-in",
    "items": [
      {"name": "Burger", "quantity": 2},
      {"name": "Fries", "quantity": 1},
      {"name": "Coke", "quantity": 2}
    ],
    "table_number": 7,
    "customer_info": {"name": "Alice Smith"}
  }')

echo $ORDER_RESPONSE | jq
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')
echo -e "${GREEN}Order ID: $ORDER_ID${NC}"
echo ""

sleep 1

echo -e "${BLUE}Step 3: Check order appears in queue${NC}"
echo "--------------------------------------"
curl -s http://localhost:3002/queue/active | jq
echo ""

echo -e "${BLUE}Step 4: View order in Kitchen Display${NC}"
echo "--------------------------------------"
curl -s http://localhost:3003/kitchen/orders | jq
echo ""

echo -e "${BLUE}Step 5: Mark order as in-progress${NC}"
echo "--------------------------------------"
curl -s -X PATCH http://localhost:3003/kitchen/orders/$ORDER_ID/start | jq
echo ""

sleep 1

echo -e "${BLUE}Step 6: Check order status${NC}"
echo "--------------------------------------"
curl -s http://localhost:3004/status/$ORDER_ID | jq
echo ""

echo -e "${BLUE}Step 7: Mark order as completed${NC}"
echo "--------------------------------------"
curl -s -X PATCH http://localhost:3003/kitchen/orders/$ORDER_ID/complete | jq
echo ""

sleep 1

echo -e "${BLUE}Step 8: View complete order history${NC}"
echo "--------------------------------------"
curl -s http://localhost:3004/status/history/$ORDER_ID | jq
echo ""

echo -e "${BLUE}Step 9: Check queue statistics${NC}"
echo "--------------------------------------"
curl -s http://localhost:3002/queue/stats | jq
echo ""

echo -e "${BLUE}Step 10: Get daily analytics${NC}"
echo "--------------------------------------"
curl -s http://localhost:3004/analytics/daily | jq
echo ""

echo -e "${GREEN}=========================================="
echo "Demo completed successfully!"
echo "==========================================${NC}"
