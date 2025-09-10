#!/bin/bash

# FarmMate Development Startup Script
# This script starts all services in the correct order

set -e

echo "🌾 Starting FarmMate Development Environment..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/ipfs
mkdir -p data/redis

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."

# Start infrastructure services first
print_status "Starting PostgreSQL..."
docker-compose up -d postgres

print_status "Starting IPFS..."
docker-compose up -d ipfs

print_status "Starting Hardhat blockchain..."
docker-compose up -d hardhat

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U farmmate -d farmmate > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL is not ready yet, waiting..."
    sleep 5
fi

# Check IPFS
if curl -s http://localhost:5001/api/v0/version > /dev/null 2>&1; then
    print_success "IPFS is ready"
else
    print_warning "IPFS is not ready yet, waiting..."
    sleep 5
fi

# Check Hardhat
if curl -s http://localhost:8545 > /dev/null 2>&1; then
    print_success "Hardhat blockchain is ready"
else
    print_warning "Hardhat blockchain is not ready yet, waiting..."
    sleep 5
fi

# Deploy smart contract
print_status "Deploying smart contract..."
cd contract
npm install
npx hardhat run scripts/deploy.js --network localhost
cd ..

# Start application services
print_status "Starting backend API..."
docker-compose up -d backend

print_status "Starting AI service..."
docker-compose up -d ai-service

print_status "Starting frontend..."
docker-compose up -d frontend

# Wait for application services
print_status "Waiting for application services to be ready..."
sleep 15

# Check application health
print_status "Checking application health..."

# Check backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend API is ready"
else
    print_warning "Backend API is not ready yet"
fi

# Check AI service
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    print_success "AI service is ready"
else
    print_warning "AI service is not ready yet"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend is not ready yet"
fi

# Display service URLs
echo ""
print_success "FarmMate Development Environment is starting up!"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   AI Service:   http://localhost:5000"
echo "   IPFS:         http://localhost:5001"
echo "   Blockchain:   http://localhost:8545"
echo "   PostgreSQL:   localhost:5432"
echo ""
echo "📊 Monitoring:"
echo "   View logs:    docker-compose logs -f [service_name]"
echo "   Stop all:     docker-compose down"
echo "   Restart:      ./scripts/start.sh"
echo ""
print_warning "Note: It may take a few minutes for all services to be fully ready."
echo ""

# Show logs for a few seconds
print_status "Showing recent logs..."
docker-compose logs --tail=20

echo ""
print_success "Setup complete! Happy farming! 🌱"
