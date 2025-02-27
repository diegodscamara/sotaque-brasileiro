# Scripts

This directory contains utility scripts for the project.

## Docker Environment Setup Script

The `docker-env-setup.js` script helps you generate Docker environment files from your local environment files. This ensures that your Docker containers have the correct environment variables for each environment (development, staging, production).

### Prerequisites

- Node.js installed
- Local environment files (`.env.development`, `.env.staging`, `.env.production`) with your configuration

### Usage

```bash
# Make the script executable (if not already)
chmod +x docker-env-setup.js

# Generate Docker environment file for development
node docker-env-setup.js development

# Generate Docker environment file for staging
node docker-env-setup.js staging

# Generate Docker environment file for production
node docker-env-setup.js production
```

### How It Works

1. The script reads variables from your local environment file (e.g., `.env.development`).
2. It generates a Docker-specific environment file (e.g., `.env.docker.development`) with the appropriate configurations for Docker.
3. It adjusts certain variables to work correctly in a Docker environment, such as database connection strings and URLs.

### Environment-Specific Configurations

The script handles different configurations based on the environment:

#### Development

- Sets `NODE_ENV=development`
- Configures database connection to use the Docker database service
- Sets up Supabase connection to use `host.docker.internal` for local development
- Enables debug mode

#### Staging

- Sets `NODE_ENV=staging`
- Configures database connection to use the Docker database service
- Sets up appropriate URLs for the staging environment

#### Production

- Sets `NODE_ENV=production`
- Configures database connection to use the Docker database service
- Sets up appropriate URLs for the production environment
- Disables debug mode

### Output

The script will create or update the following files:

- `.env.docker.development`
- `.env.docker.staging`
- `.env.docker.production`

These files are used by the Docker Compose files to configure the Docker containers for each environment. 