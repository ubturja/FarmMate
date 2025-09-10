#!/bin/bash

# FarmMate Quick Start Script
# This script starts the essential services with minimal dependencies

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🌾 Starting FarmMate Quick Start..."

# Create logs directory
mkdir -p logs

# Start Hardhat blockchain
print_status "Starting Hardhat blockchain..."
cd contract
npx hardhat node --port 8545 > ../logs/hardhat.log 2>&1 &
HARDHAT_PID=$!
cd ..

# Wait for Hardhat to start
print_status "Waiting for Hardhat to start..."
sleep 5

# Deploy contract
print_status "Deploying smart contract..."
cd contract
npx hardhat run scripts/deploy.js --network localhost
cd ..

# Start backend (without database for now)
print_status "Starting backend API..."
cd backend
# Create a simple .env file
cat > .env << EOF
NODE_ENV=development
PORT=3001
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
IPFS_URL=http://localhost:5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmmate
DB_USER=farmmate
DB_PASSWORD=farmmate123
EOF

# Start backend without database
node index.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start frontend
print_status "Starting frontend..."
cd frontend
# Create a simple .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001
REACT_APP_CONTRACT_ADDRESS=0x2c7d77410317c1b342d8aa07Ea28e81b0e3779cD
REACT_APP_RPC_URL=http://localhost:8545
REACT_APP_IPFS_URL=http://localhost:5001
EOF

npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Display service URLs
echo ""
print_success "FarmMate Quick Start Complete!"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   Blockchain:   http://localhost:8545"
echo ""
echo "📊 Process IDs:"
echo "   Hardhat:      $HARDHAT_PID"
echo "   Backend:      $BACKEND_PID"
echo "   Frontend:     $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Hardhat:      logs/hardhat.log"
echo "   Backend:      logs/backend.log"
echo "   Frontend:     logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID"
echo ""
print_warning "Note: Backend will run without database. Some features may be limited."
echo ""

# Show recent logs
print_status "Showing recent logs..."
tail -n 5 logs/*.log 2>/dev/null || true

echo ""
print_success "Setup complete! Happy farming! 🌱"
