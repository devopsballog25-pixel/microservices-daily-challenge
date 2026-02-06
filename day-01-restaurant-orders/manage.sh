#!/bin/bash

# Restaurant Order Management System - Management Script

case "$1" in
  start)
    echo "Starting all services..."
    docker-compose up --build -d
    echo "Waiting for services to start..."
    sleep 5
    echo "Creating databases if needed..."
    docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE orders;" 2>/dev/null || echo "orders database already exists"
    docker exec day-01-restaurant-orders-postgres-1 psql -U postgres -c "CREATE DATABASE status;" 2>/dev/null || echo "status database already exists"
    echo "Restarting services..."
    docker-compose restart order-intake status-tracker
    sleep 3
    echo "System started!"
    ./manage.sh status
    ;;

  stop)
    echo "Stopping all services..."
    docker-compose down
    echo "Services stopped!"
    ;;

  restart)
    ./manage.sh stop
    ./manage.sh start
    ;;

  status)
    echo "=== Service Status ==="
    docker-compose ps
    echo ""
    echo "=== Health Checks ==="
    echo -n "Order Intake: "
    curl -s http://localhost:3001/health | jq -r '.status' || echo "UNHEALTHY"
    echo -n "Queue Manager: "
    curl -s http://localhost:3002/health | jq -r '.status' || echo "UNHEALTHY"
    echo -n "Kitchen Display: "
    curl -s http://localhost:3003/health | jq -r '.status' || echo "UNHEALTHY"
    echo -n "Status Tracker: "
    curl -s http://localhost:3004/health | jq -r '.status' || echo "UNHEALTHY"
    ;;

  logs)
    if [ -z "$2" ]; then
      docker-compose logs -f
    else
      docker-compose logs -f $2
    fi
    ;;

  test)
    echo "Running integration tests..."
    cd tests && npm test
    ;;

  demo)
    echo "Running demo..."
    ./demo.sh
    ;;

  clean)
    echo "Cleaning up all containers and volumes..."
    docker-compose down -v
    echo "Cleanup complete!"
    ;;

  *)
    echo "Restaurant Order Management System"
    echo ""
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services (includes database setup)"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Check service health"
    echo "  logs      - View logs (use 'logs <service>' for specific service)"
    echo "  test      - Run integration tests"
    echo "  demo      - Run demo script"
    echo "  clean     - Remove all containers and volumes"
    echo ""
    echo "Examples:"
    echo "  ./manage.sh start"
    echo "  ./manage.sh logs queue-manager"
    echo "  ./manage.sh test"
    ;;
esac
