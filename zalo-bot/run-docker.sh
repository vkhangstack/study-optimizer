#!/bin/bash

# Simple Docker Compose runner for Zalo Bot
# This script ensures you're in the right directory and uses the correct commands

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory (zalo-bot folder)
cd "$SCRIPT_DIR"

echo -e "${BLUE}[INFO]${NC} Working directory: $(pwd)"
echo -e "${BLUE}[INFO]${NC} Available docker-compose files:"
ls -la docker-compose*.yml 2>/dev/null || echo "No docker-compose files found"

# Function to run docker-compose commands
run_compose() {
    local cmd="$1"
    local service="$2"
    
    echo -e "${BLUE}[INFO]${NC} Running: docker compose $cmd $service"
    
    if [ -f "docker-compose.yml" ]; then
        docker compose $cmd $service
    elif [ -f "docker-compose-dev.yml" ]; then
        docker compose -f docker-compose-dev.yml $cmd $service
    else
        echo -e "${RED}[ERROR]${NC} No docker-compose.yml or docker-compose-dev.yml found!"
        exit 1
    fi
}

# Parse command line arguments
case "$1" in
    "postgres")
        echo -e "${GREEN}[SUCCESS]${NC} Starting PostgreSQL service..."
        run_compose "up -d" "postgres"
        ;;
    "app")
        echo -e "${GREEN}[SUCCESS]${NC} Starting application service..."
        run_compose "up -d" "app"
        ;;
    "all"|"up")
        echo -e "${GREEN}[SUCCESS]${NC} Starting all services..."
        run_compose "up -d" ""
        ;;
    "down")
        echo -e "${GREEN}[SUCCESS]${NC} Stopping all services..."
        run_compose "down" ""
        ;;
    "logs")
        echo -e "${GREEN}[SUCCESS]${NC} Showing logs..."
        run_compose "logs -f" "$2"
        ;;
    "status"|"ps")
        echo -e "${GREEN}[SUCCESS]${NC} Showing service status..."
        run_compose "ps" ""
        ;;
    *)
        echo "Zalo Bot Docker Runner"
        echo ""
        echo "Usage: $0 {command} [service]"
        echo ""
        echo "Commands:"
        echo "  postgres    Start PostgreSQL service only"
        echo "  app         Start application service only"
        echo "  all|up      Start all services"
        echo "  down        Stop all services"
        echo "  logs        Show logs (optionally for specific service)"
        echo "  status|ps   Show service status"
        echo ""
        echo "Examples:"
        echo "  $0 postgres           # Start PostgreSQL only"
        echo "  $0 all                # Start all services"
        echo "  $0 logs postgres      # Show PostgreSQL logs"
        echo "  $0 down               # Stop all services"
        echo ""
        exit 1
        ;;
esac