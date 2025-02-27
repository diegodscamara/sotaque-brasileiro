#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to display usage information
show_usage() {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  ./docker-helper.sh [command] [environment]"
  echo -e "\n${YELLOW}Available commands:${NC}"
  echo -e "  ${GREEN}build${NC}             Build the Docker image (default: production)"
  echo -e "  ${GREEN}build-dev${NC}         Build the Docker image for development"
  echo -e "  ${GREEN}build-staging${NC}     Build the Docker image for staging"
  echo -e "  ${GREEN}start${NC}             Start the Docker containers (default: production)"
  echo -e "  ${GREEN}start-dev${NC}         Start the Docker containers for development"
  echo -e "  ${GREEN}start-staging${NC}     Start the Docker containers for staging"
  echo -e "  ${GREEN}stop${NC}              Stop the Docker containers (default: production)"
  echo -e "  ${GREEN}stop-dev${NC}          Stop the Docker containers for development"
  echo -e "  ${GREEN}stop-staging${NC}      Stop the Docker containers for staging"
  echo -e "  ${GREEN}restart${NC}           Restart the Docker containers (default: production)"
  echo -e "  ${GREEN}restart-dev${NC}       Restart the Docker containers for development"
  echo -e "  ${GREEN}restart-staging${NC}   Restart the Docker containers for staging"
  echo -e "  ${GREEN}logs${NC}              Show logs for the Docker containers (default: production)"
  echo -e "  ${GREEN}logs-dev${NC}          Show logs for the Docker containers for development"
  echo -e "  ${GREEN}logs-staging${NC}      Show logs for the Docker containers for staging"
  echo -e "  ${GREEN}shell${NC}             Open a shell in the Docker container (default: production)"
  echo -e "  ${GREEN}shell-dev${NC}         Open a shell in the Docker container for development"
  echo -e "  ${GREEN}shell-staging${NC}     Open a shell in the Docker container for staging"
  echo -e "  ${GREEN}clean${NC}             Clean up Docker resources (default: production)"
  echo -e "  ${GREEN}clean-dev${NC}         Clean up Docker resources for development"
  echo -e "  ${GREEN}clean-staging${NC}     Clean up Docker resources for staging"
  echo -e "  ${PURPLE}supabase-start${NC}     Start Supabase locally"
  echo -e "  ${PURPLE}supabase-stop${NC}      Stop Supabase locally"
  echo -e "  ${PURPLE}supabase-status${NC}    Check the status of Supabase"
  echo -e "  ${CYAN}setup-env${NC}          Setup Docker environment files from local environment files"
  echo -e "  ${YELLOW}help${NC}               Show this help message"
  echo -e "\n${YELLOW}Available environments:${NC}"
  echo -e "  ${BLUE}dev${NC}          - Development environment (default)"
  echo -e "  ${BLUE}staging${NC}      - Staging environment"
  echo -e "  ${BLUE}prod${NC}         - Production environment"
  echo -e "\n${YELLOW}Examples:${NC}"
  echo -e "  ./docker-helper.sh build-dev"
  echo -e "  ./docker-helper.sh start-dev"
  echo -e "  ./docker-helper.sh logs-dev"
  echo -e "  ./docker-helper.sh supabase-start"
  echo -e "  ./docker-helper.sh setup-env development"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed.${NC}"
  exit 1
fi

# Default environment is development
ENV=${2:-dev}

# Set the appropriate docker-compose file based on environment
case "$ENV" in
  dev|development)
    COMPOSE_FILE="docker-compose.dev.yml"
    ENV_DISPLAY="development"
    ;;
  staging)
    COMPOSE_FILE="docker-compose.staging.yml"
    ENV_DISPLAY="staging"
    ;;
  prod|production)
    COMPOSE_FILE="docker-compose.yml"
    ENV_DISPLAY="production"
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '${ENV}'. Use dev, staging, or prod.${NC}"
    show_usage
    exit 1
    ;;
esac

# Process commands
case "$1" in
  build)
    echo -e "${GREEN}Building Docker image for production...${NC}"
    DOCKER_BUILDKIT=1 DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f ${COMPOSE_FILE} build --no-cache
    ;;
  build-dev)
    echo -e "${GREEN}Building Docker image for development...${NC}"
    DOCKER_BUILDKIT=1 DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f ${COMPOSE_FILE} build --no-cache
    ;;
  build-staging)
    echo -e "${GREEN}Building Docker image for staging...${NC}"
    DOCKER_BUILDKIT=1 DOCKER_DEFAULT_PLATFORM=linux/amd64 docker compose -f ${COMPOSE_FILE} build --no-cache
    ;;
  start)
    echo -e "${GREEN}Starting Docker containers for production...${NC}"
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Application is running at:${NC} http://localhost:3000"
    ;;
  start-dev)
    echo -e "${GREEN}Starting Docker containers for development...${NC}"
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Development environment is running at:${NC} http://localhost:3000"
    ;;
  start-staging)
    echo -e "${GREEN}Starting Docker containers for staging...${NC}"
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Application is running at:${NC} http://localhost:3000"
    ;;
  stop)
    echo -e "${RED}Stopping Docker containers for production...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    ;;
  stop-dev)
    echo -e "${RED}Stopping Docker containers for development...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    ;;
  stop-staging)
    echo -e "${RED}Stopping Docker containers for staging...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    ;;
  restart)
    echo -e "${YELLOW}Restarting Docker containers for production...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Application is running at:${NC} http://localhost:3000"
    ;;
  restart-dev)
    echo -e "${YELLOW}Restarting Docker containers for development...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Development environment is running at:${NC} http://localhost:3000"
    ;;
  restart-staging)
    echo -e "${YELLOW}Restarting Docker containers for staging...${NC}"
    docker compose -f ${COMPOSE_FILE} down
    docker compose -f ${COMPOSE_FILE} up -d
    echo -e "${GREEN}Application is running at:${NC} http://localhost:3000"
    ;;
  logs)
    echo -e "${BLUE}Showing logs for production...${NC}"
    docker compose -f ${COMPOSE_FILE} logs -f
    ;;
  logs-dev)
    echo -e "${BLUE}Showing logs for development...${NC}"
    docker compose -f ${COMPOSE_FILE} logs -f
    ;;
  logs-staging)
    echo -e "${BLUE}Showing logs for staging...${NC}"
    docker compose -f ${COMPOSE_FILE} logs -f
    ;;
  shell)
    echo -e "${BLUE}Opening shell in production container...${NC}"
    docker compose -f ${COMPOSE_FILE} exec app /bin/sh
    ;;
  shell-dev)
    echo -e "${BLUE}Opening shell in development container...${NC}"
    docker compose -f ${COMPOSE_FILE} exec app /bin/sh
    ;;
  shell-staging)
    echo -e "${BLUE}Opening shell in staging container...${NC}"
    docker compose -f ${COMPOSE_FILE} exec app /bin/sh
    ;;
  clean)
    echo -e "${RED}Cleaning up Docker resources for production...${NC}"
    docker compose -f ${COMPOSE_FILE} down -v --rmi all --remove-orphans
    ;;
  clean-dev)
    echo -e "${RED}Cleaning up Docker resources for development...${NC}"
    docker compose -f ${COMPOSE_FILE} down -v --rmi all --remove-orphans
    ;;
  clean-staging)
    echo -e "${RED}Cleaning up Docker resources for staging...${NC}"
    docker compose -f ${COMPOSE_FILE} down -v --rmi all --remove-orphans
    ;;
  supabase-start)
    echo -e "${PURPLE}Starting Supabase locally...${NC}"
    # Use --debug flag to see more detailed error messages
    SUPABASE_AUTH_SMTP_ADMIN_EMAIL="" npx supabase start
    echo -e "${PURPLE}Supabase is running at:${NC} http://localhost:54321"
    ;;
  supabase-stop)
    echo -e "${PURPLE}Stopping Supabase locally...${NC}"
    npx supabase stop
    ;;
  supabase-status)
    echo -e "${PURPLE}Checking Supabase status...${NC}"
    SUPABASE_AUTH_SMTP_ADMIN_EMAIL="" npx supabase status
    ;;
  setup-env)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: Environment not specified.${NC}"
      echo -e "Usage: $0 setup-env [environment]"
      echo -e "Available environments: development, staging, production"
      exit 1
    fi
    
    environment="$2"
    echo -e "${CYAN}Setting up Docker environment for ${environment}...${NC}"
    node scripts/docker-env-setup.js "$environment"
    ;;
  help|*)
    show_usage
    ;;
esac 