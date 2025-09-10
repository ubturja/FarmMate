#!/bin/bash

# FarmMate API Test Script
# This script tests all API endpoints to ensure they're working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="http://localhost:3001"
AI_BASE_URL="http://localhost:5000"
WALLET_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    print_status "Testing: $description"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" -H "x-wallet-address: $WALLET_ADDRESS")
    else
        response=$(curl -s -w "%{http_code}" -o /tmp/response.json -X "$method" "$url" -H "Content-Type: application/json" -H "x-wallet-address: $WALLET_ADDRESS" -d "$data")
    fi
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "$expected_status" ]; then
        print_success "$description (HTTP $http_code)"
        if [ -f /tmp/response.json ]; then
            echo "Response: $(cat /tmp/response.json | head -c 200)..."
        fi
    else
        print_error "$description (Expected HTTP $expected_status, got HTTP $http_code)"
        if [ -f /tmp/response.json ]; then
            echo "Response: $(cat /tmp/response.json)"
        fi
    fi
    echo ""
}

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 5

# Test backend health
print_status "Testing Backend API Health..."
test_endpoint "GET" "$API_BASE_URL/health" "" "200" "Backend health check"

# Test user creation
print_status "Testing User Management..."
user_data='{"walletAddress":"'$WALLET_ADDRESS'","role":"farmer","name":"Test Farmer","email":"test@example.com","location":"Test Location"}'
test_endpoint "POST" "$API_BASE_URL/api/users" "$user_data" "200" "Create user"

# Test farm creation
print_status "Testing Farm Management..."
farm_data='{"name":"Test Farm","location":"Test Location","coordinates":{"lat":40.7128,"lng":-74.0060},"size":10.5,"soilType":"loam"}'
test_endpoint "POST" "$API_BASE_URL/api/farms" "$farm_data" "200" "Create farm"

# Test batch creation
print_status "Testing Batch Management..."
batch_data='{"farmId":1,"cropType":"tomato","variety":"Roma","quantity":100,"unit":"kg","harvestDate":"2024-01-15","priceWei":"1000000000000000000","images":[]}'
test_endpoint "POST" "$API_BASE_URL/api/marketplace/batches" "$batch_data" "200" "Create batch"

# Test marketplace endpoints
print_status "Testing Marketplace..."
test_endpoint "GET" "$API_BASE_URL/api/marketplace/batches" "" "200" "Get all batches"
test_endpoint "GET" "$API_BASE_URL/api/marketplace/batches/1" "" "200" "Get batch details"

# Test provenance endpoints
print_status "Testing Provenance..."
test_endpoint "GET" "$API_BASE_URL/api/provenance/batches/1" "" "200" "Get batch provenance"
test_endpoint "GET" "$API_BASE_URL/api/provenance/batches/1/verify" "" "200" "Verify batch"

# Test AI service health
print_status "Testing AI Service Health..."
test_endpoint "GET" "$AI_BASE_URL/health" "" "200" "AI service health check"

# Test AI endpoints
print_status "Testing AI Services..."
test_endpoint "GET" "$AI_BASE_URL/api/ai/status" "" "200" "AI service status"

# Test yield forecasting
yield_data='{"farmData":{"cropType":"tomato","temperature":25,"rainfall":100,"humidity":60,"soilPh":6.5,"organicMatter":3.5,"irrigation":"adequate","pestControl":"good","fertilization":"regular"}}'
test_endpoint "POST" "$AI_BASE_URL/api/ai/forecast-yield" "$yield_data" "200" "Yield forecasting"

# Test price forecasting
price_data='{"cropType":"tomato","marketData":{"populationGrowth":0.015,"incomeGrowth":0.03,"healthTrends":"increasing"}}'
test_endpoint "POST" "$AI_BASE_URL/api/ai/forecast-price" "$price_data" "200" "Price forecasting"

# Test federated learning
print_status "Testing Federated Learning..."
fl_data='{"farmId":"test_farm","dataSize":100}'
test_endpoint "POST" "$AI_BASE_URL/api/ai/simulate-training" "$fl_data" "200" "Simulate federated learning"

# Test federated learning status
test_endpoint "GET" "$AI_BASE_URL/api/ai/federated-status" "" "200" "Federated learning status"

print_success "All API tests completed!"
echo ""
echo "🌾 FarmMate API Test Summary:"
echo "   Backend API: $API_BASE_URL"
echo "   AI Service:  $AI_BASE_URL"
echo "   Frontend:    http://localhost:3000"
echo ""
echo "To view detailed logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f ai-service"
