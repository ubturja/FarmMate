#!/bin/bash

# Docker Installation Script for Ubuntu/Debian
# This script installs Docker and Docker Compose

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

print_status "🐳 Installing Docker and Docker Compose..."

# Update package index
print_status "Updating package index..."
sudo apt-get update

# Install required packages
print_status "Installing required packages..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
print_status "Adding Docker's official GPG key..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
print_status "Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
print_status "Updating package index..."
sudo apt-get update

# Install Docker Engine
print_status "Installing Docker Engine..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
print_status "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
print_status "Adding current user to docker group..."
sudo usermod -aG docker $USER

# Start Docker service
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
print_status "Verifying Docker installation..."
if docker --version && docker-compose --version; then
    print_success "Docker and Docker Compose installed successfully!"
    echo ""
    echo "🐳 Docker version: $(docker --version)"
    echo "🐳 Docker Compose version: $(docker-compose --version)"
    echo ""
    print_warning "Please log out and log back in for group changes to take effect."
    print_warning "Or run: newgrp docker"
    echo ""
    print_success "You can now run: ./scripts/start.sh"
else
    print_error "Docker installation failed. Please check the logs and try again."
    exit 1
fi
