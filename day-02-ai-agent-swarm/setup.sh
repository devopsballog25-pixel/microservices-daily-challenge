#!/bin/bash

# Day 02: AI CTO Agent Swarm - Environment Setup
# Run this before starting Claude Code

set -e

echo "=========================================="
echo "Day 02: AI CTO Agent Swarm Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "microservices-daily-challenge" ]; then
    echo "Creating microservices-daily-challenge directory..."
    mkdir -p microservices-daily-challenge
fi

cd microservices-daily-challenge

# Create Day 02 directory
echo "Creating day-02-ai-agent-swarm directory..."
mkdir -p day-02-ai-agent-swarm
cd day-02-ai-agent-swarm

# Copy problem files
echo "Setting up problem files..."
# (You'll copy PROBLEM.md and claude.md here manually)

# Create .env.example file
echo "Creating .env.example..."
cat > .env.example << 'EOF'
# Anthropic API Configuration
ANTHROPIC_API_KEY=your-api-key-here

# Mock Mode (set to true for testing without API key)
MOCK_MODE=false

# Service Ports
WEB_UI_PORT=3000
ORCHESTRATOR_PORT=3001
ARCHITECT_PORT=3002
SECURITY_PORT=3003
COST_PORT=3004
DEVOPS_PORT=3005
EOF

# Create .gitignore
echo "Creating .gitignore..."
cat > .gitignore << 'EOF'
# Node modules
node_modules/
npm-debug.log*

# Environment variables
.env

# SQLite databases
*.db
*.sqlite
*.sqlite3

# Docker volumes
data/

# IDE
.vscode/
.idea/
*.swp

# macOS
.DS_Store

# Logs
logs/
*.log

# Test coverage
coverage/
EOF

# Check Docker status
echo ""
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and run this script again."
    exit 1
else
    echo "✅ Docker is running"
fi

# Check for port conflicts
echo ""
echo "Checking for port conflicts..."
PORTS=(3000 3001 3002 3003 3004 3005)
for PORT in "${PORTS[@]}"; do
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $PORT is already in use"
        echo "   You may need to stop the conflicting service or change ports"
    else
        echo "✅ Port $PORT is available"
    fi
done

# Check for Anthropic API key
echo ""
echo "Checking for Anthropic API key..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY environment variable not set"
    echo ""
    echo "To set it for this session:"
    echo "  export ANTHROPIC_API_KEY=your-key-here"
    echo ""
    echo "Or you can use MOCK_MODE=true for testing without an API key"
else
    echo "✅ ANTHROPIC_API_KEY is set"
fi

# Create directory structure
echo ""
echo "Creating directory structure..."
mkdir -p services/web-ui/public
mkdir -p services/orchestrator
mkdir -p services/architect-agent
mkdir -p services/security-agent
mkdir -p services/cost-agent
mkdir -p services/devops-agent
mkdir -p tests

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Copy PROBLEM.md and claude.md to this directory"
echo "2. Set your API key: export ANTHROPIC_API_KEY=your-key-here"
echo "3. Run Claude Code: claude run"
echo ""
echo "For testing without API key:"
echo "  MOCK_MODE=true docker-compose up --build"
echo ""
