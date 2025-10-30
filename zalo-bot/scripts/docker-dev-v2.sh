#!/bin/bash

# Docker Development Helper Script (Docker Compose v2)

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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.docker template..."
        cp .env.docker .env
        print_warning "Please edit .env file with your actual configuration before running the services."
    fi
}

# Main commands
case "$1" in
    "up")
        print_status "Starting Zalo Bot development environment..."
        check_docker
        check_env
        docker compose -f docker-compose-dev.yml up --build
        ;;
    "down")
        print_status "Stopping Zalo Bot development environment..."
        docker compose -f docker-compose-dev.yml down
        print_success "Services stopped."
        ;;
    "restart")
        print_status "Restarting Zalo Bot development environment..."
        docker compose -f docker-compose-dev.yml down
        docker compose -f docker-compose-dev.yml up --build
        ;;
    "logs")
        print_status "Showing logs for all services..."
        docker compose -f docker-compose-dev.yml logs -f
        ;;
    "logs-app")
        print_status "Showing logs for app service..."
        docker compose -f docker-compose-dev.yml logs -f app
        ;;
    "logs-db")
        print_status "Showing logs for database service..."
        docker compose -f docker-compose-dev.yml logs -f postgres
        ;;
    "shell")
        print_status "Opening shell in app container..."
        docker compose -f docker-compose-dev.yml exec app sh
        ;;
    "db-shell")
        print_status "Opening PostgreSQL shell..."
        docker compose -f docker-compose-dev.yml exec postgres psql -U zalo_user -d zalo_bot_db
        ;;
    "clean")
        print_status "Cleaning up Docker resources..."
        docker compose -f docker-compose-dev.yml down -v
        docker system prune -f
        print_success "Cleanup completed."
        ;;
    "reset")
        print_warning "This will remove all data and containers. Are you sure? (y/N)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            print_status "Resetting development environment..."
            docker compose -f docker-compose-dev.yml down -v
            docker compose -f docker-compose-dev.yml up --build --force-recreate
        else
            print_status "Reset cancelled."
        fi
        ;;
    "status")
        print_status "Checking service status..."
        docker compose -f docker-compose-dev.yml ps
        ;;
    "postgres")
        print_status "Starting PostgreSQL service only..."
        check_docker
        check_env
        docker compose -f docker-compose-dev.yml up -d postgres
        ;;
    *)
        echo "Zalo Bot Docker Development Helper (Docker Compose v2)"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  up          Start development environment"
        echo "  down        Stop development environment"
        echo "  restart     Restart development environment"
        echo "  postgres    Start PostgreSQL service only"
        echo "  logs        Show logs for all services"
        echo "  logs-app    Show logs for app service only"
        echo "  logs-db     Show logs for database service only"
        echo "  shell       Open shell in app container"
        echo "  db-shell    Open PostgreSQL shell"
        echo "  status      Show service status"
        echo "  clean       Clean up Docker resources"
        echo "  reset       Reset environment (removes all data)"
        echo ""
        echo "Examples:"
        echo "  $0 up                 # Start all services"
        echo "  $0 postgres           # Start PostgreSQL only"
        echo "  $0 logs-app           # View app logs"
        echo "  $0 shell              # Access app container"
        echo ""
        exit 1
        ;;
esac