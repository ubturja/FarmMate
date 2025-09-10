#!/bin/bash

# FarmMate Local Development Startup Script (No Docker)
# This script starts all services locally without Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

print_status "🌾 Starting FarmMate Local Development Environment..."

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed. AI services will not be available."
fi

print_success "Prerequisites check completed"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data

# Install contract dependencies
print_status "Installing contract dependencies..."
cd contract
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Install AI dependencies
if command -v python3 &> /dev/null; then
    print_status "Installing AI dependencies..."
    cd ai
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

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

# Start backend (requires PostgreSQL)
print_status "Starting backend API..."
print_warning "Note: Backend requires PostgreSQL. Please ensure PostgreSQL is running."
print_warning "You can install PostgreSQL with: sudo apt-get install postgresql postgresql-contrib"

# Check if PostgreSQL is running
if ! pg_isready -q; then
    print_warning "PostgreSQL is not running. Starting backend without database..."
    print_warning "Some features may not work without database connection."
fi

cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start AI service (if Python is available)
if command -v python3 &> /dev/null; then
    print_status "Starting AI service..."
    cd ai
    source venv/bin/activate
    python app.py > ../logs/ai.log 2>&1 &
    AI_PID=$!
    cd ..
else
    print_warning "AI service not started (Python not available)"
fi

# Start frontend
print_status "Starting frontend..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Display service URLs
echo ""
print_success "FarmMate Local Development Environment is starting up!"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   AI Service:   http://localhost:5000"
echo "   Blockchain:   http://localhost:8545"
echo ""
echo "📊 Process IDs:"
echo "   Hardhat:      $HARDHAT_PID"
echo "   Backend:      $BACKEND_PID"
echo "   AI Service:   $AI_PID"
echo "   Frontend:     $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Hardhat:      logs/hardhat.log"
echo "   Backend:      logs/backend.log"
echo "   AI Service:   logs/ai.log"
echo "   Frontend:     logs/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $HARDHAT_PID $BACKEND_PID $AI_PID $FRONTEND_PID"
echo ""
print_warning "Note: Some services may take a few minutes to be fully ready."
echo ""

# Show recent logs
print_status "Showing recent logs..."
tail -n 10 logs/*.log 2>/dev/null || true

echo ""
print_success "Setup complete! Happy farming! 🌱"
echo ""
print_warning "For full functionality, please install and configure PostgreSQL:"
echo "   sudo apt-get install postgresql postgresql-contrib"
echo "   sudo -u postgres createdb farmmate"
echo "   sudo -u postgres createuser farmmate"
echo "   sudo -u postgres psql -c \"ALTER USER farmmate PASSWORD 'farmmate123';\""
echo "   sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE farmmate TO farmmate;\""
