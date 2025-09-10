#!/bin/bash

# FarmMate Quick Start Script for Supervisors
# This script starts the essential services for demonstration

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

echo "🌾 FarmMate Quick Start Script"
echo "================================"
echo ""

# Check prerequisites
print_status "Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi

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

print_success "Prerequisites check passed"

# Stop any existing services
print_status "Stopping any existing services..."
docker stop farmmate-postgres 2>/dev/null || true
docker rm farmmate-postgres 2>/dev/null || true
pkill -f "node simple-server.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Start PostgreSQL
print_status "Starting PostgreSQL database..."
docker run -d --name farmmate-postgres \
  -e POSTGRES_DB=farmmate \
  -e POSTGRES_USER=farmmate \
  -e POSTGRES_PASSWORD=farmmate123 \
  -p 5432:5432 \
  postgres:15-alpine

# Wait for PostgreSQL to start
print_status "Waiting for PostgreSQL to start..."
sleep 5

# Check if PostgreSQL is running
if docker ps | grep -q farmmate-postgres; then
    print_success "PostgreSQL is running"
else
    print_error "Failed to start PostgreSQL"
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Start backend
print_status "Starting backend API server..."
cd backend
node simple-server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend API is running"
else
    print_error "Failed to start backend API"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend
print_status "Starting frontend application..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_warning "Frontend may still be starting up..."
fi

echo ""
print_success "FarmMate system is starting up!"
echo ""
echo "🌐 Service URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   PostgreSQL:   localhost:5432"
echo ""
echo "📊 Process IDs:"
echo "   Backend:      $BACKEND_PID"
echo "   Frontend:     $FRONTEND_PID"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   docker stop farmmate-postgres"
echo "   docker rm farmmate-postgres"
echo ""
print_warning "Note: Keep this terminal open. Services will stop if you close it."
echo ""
print_success "Setup complete! Open http://localhost:3000 in your browser to see FarmMate! 🌱"
echo ""
echo "Press Ctrl+C to stop all services when you're done."
echo ""

# Wait for user to stop services
trap 'echo ""; print_status "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; docker stop farmmate-postgres 2>/dev/null || true; docker rm farmmate-postgres 2>/dev/null || true; print_success "All services stopped. Goodbye!"; exit 0' INT

# Keep script running
while true; do
    sleep 1
done
