# Docker Setup for Next.js Application

This document provides instructions on how to use Docker to run the Next.js application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed for local development
- Basic knowledge of Docker commands

## Files Overview

1. **Dockerfile**: Multi-stage build process that optimizes the Next.js application for production.
2. **Dockerfile.dev**: Simplified Dockerfile for development with hot reloading.
3. **docker-compose.yml**: Orchestrates the application and a PostgreSQL database for production.
4. **docker-compose.dev.yml**: Development version with volume mounts for hot reloading.
5. **docker-compose.staging.yml**: Staging version for pre-production testing.
6. **.dockerignore**: Excludes unnecessary files from the Docker build process.
7. **Environment Files**:
   - **.env.docker.development**: Environment variables for development.
   - **.env.docker.staging**: Environment variables for staging.
   - **.env.docker.production**: Environment variables for production.
8. **docker-helper.sh**: A helper script to simplify Docker operations across environments.

## Environment-Specific Configuration

The Docker setup supports three environments:

1. **Development**: For local development with hot reloading.
2. **Staging**: For pre-production testing.
3. **Production**: For the live application.

Each environment has its own:
- Docker Compose file
- Environment variables file
- Container names and volume names

## Docker Environment Setup

The project includes a script to help you set up Docker environment files based on your local environment files. This script reads variables from your local `.env.{environment}` files and generates the corresponding `.env.docker.{environment}` files with the appropriate configurations for Docker.

### Using the Docker Environment Setup Script

1. Make sure you have the following local environment files:
   - `.env.development` (for development)
   - `.env.staging` (for staging)
   - `.env.production` (for production)

2. Run the script with the desired environment:
   ```bash
   node scripts/docker-env-setup.js development
   # or
   node scripts/docker-env-setup.js staging
   # or
   node scripts/docker-env-setup.js production
   ```

3. The script will generate the corresponding `.env.docker.{environment}` file with the appropriate configurations.

## Getting Started

1. Make sure you have Docker and Docker Compose installed on your machine.

2. Set up your environment variables:
   - Create your local environment files (`.env.development`, `.env.staging`, `.env.production`)
   - Run the Docker environment setup script to generate Docker environment files:
     ```bash
     node scripts/docker-env-setup.js development
     ```

3. Use the helper script to build and start the containers:
   - For development:
     ```bash
     ./docker-helper.sh build-dev
     ./docker-helper.sh start-dev
     ```
   - For staging:
     ```bash
     ./docker-helper.sh build-staging
     ./docker-helper.sh start-staging
     ```
   - For production:
     ```bash
     ./docker-helper.sh build
     ./docker-helper.sh start
     ```

4. Access the application:
   - Development: http://localhost:3000
   - Staging: http://localhost:3001
   - Production: http://localhost:3002

## Supabase Integration

The development environment is configured to work with Supabase running locally. The Docker setup includes:

1. **Network Configuration**: The Docker container can access Supabase running on your host machine using `host.docker.internal`.

2. **Environment Variables**: The `.env.docker.development` file is configured to connect to your local Supabase instance.

### Starting Supabase

You can start Supabase using the provided script:

```bash
./start-supabase.sh
```

This will start Supabase with all necessary services. You can access the Supabase Studio at http://localhost:54323.

If you encounter any issues with the script, you can also use the helper script:

```bash
./docker-helper.sh supabase-start
```

### Checking Supabase Status

To check the status of your Supabase instance:

```bash
./docker-helper.sh supabase-status
```

### Stopping Supabase

To stop Supabase:

```bash
./docker-helper.sh supabase-stop
```

## Helper Script Commands

The `docker-helper.sh` script provides several commands to help you manage your Docker containers:

- `build`: Build the production Docker image
- `build-dev`: Build the development Docker image
- `build-staging`: Build the staging Docker image
- `start`: Start the production Docker containers
- `start-dev`: Start the development Docker containers
- `start-staging`: Start the staging Docker containers
- `stop`: Stop the production Docker containers
- `stop-dev`: Stop the development Docker containers
- `stop-staging`: Stop the staging Docker containers
- `restart`: Restart the production Docker containers
- `restart-dev`: Restart the development Docker containers
- `restart-staging`: Restart the staging Docker containers
- `logs`: Show logs for the production Docker containers
- `logs-dev`: Show logs for the development Docker containers
- `logs-staging`: Show logs for the staging Docker containers
- `shell`: Open a shell in the production Docker container
- `shell-dev`: Open a shell in the development Docker container
- `shell-staging`: Open a shell in the staging Docker container
- `supabase-start`: Start Supabase locally
- `supabase-status`: Check the status of Supabase
- `supabase-stop`: Stop Supabase locally

## Development vs. Staging vs. Production

### Development Mode

Development mode is optimized for fast iteration with hot reloading:

- Uses `Dockerfile.dev` which is simpler and faster to build
- Mounts your local files into the container for hot reloading
- Runs the Next.js development server with `pnpm dev`
- Changes made to your local files are immediately reflected in the container
- Uses development-specific environment variables from `.env.docker.development`
- Connects to Supabase running locally on your host machine

### Staging Mode

Staging mode is a pre-production environment for testing:

- Uses the same multi-stage build process as production
- Runs in production mode but with some debugging enabled
- Uses staging-specific environment variables from `.env.docker.staging`
- Ideal for testing before deploying to production

### Production Mode

Production mode is optimized for performance and security:

- Uses a multi-stage build process to create a smaller, more efficient image
- Builds the application with `pnpm build` for optimal performance
- Runs the application with `node server.js` in standalone mode
- Does not include development dependencies or source files
- Uses production-specific environment variables from `.env.docker.production`

## Accessing the Application

Once the containers are running, you can access:

- **Next.js Application**: http://localhost:3000
- **PostgreSQL Database**: localhost:5432 (username: postgres, password: postgres)
- **Supabase Dashboard** (in development): http://localhost:54321

## Troubleshooting

### Memory Issues During Build

If you encounter "JavaScript heap out of memory" errors during the build process:

1. We've already increased the Node.js memory limit in the Dockerfile with:
   ```
   ENV NODE_OPTIONS="--max-old-space-size=4096"
   ```

2. We've also added memory limits to the Docker containers in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 4G
   ```

3. If you still encounter memory issues, you can try:
   - Increasing the memory allocation in Docker Desktop settings
   - Using the development mode which is less memory-intensive
   - Building the application locally and then copying the built files into the container

### Supabase Connection Issues

If you're having trouble connecting to Supabase from your Docker container:

1. Make sure Supabase is running locally:
   ```bash
   ./docker-helper.sh supabase-status
   ```

2. Check that the `host.docker.internal` hostname is correctly resolving:
   ```bash
   ./docker-helper.sh shell dev
   ping host.docker.internal
   ```

3. Verify the Supabase URL and keys in `.env.docker.development`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
   ```

### Other Common Issues

1. **Check the logs**:
   ```bash
   ./docker-helper.sh logs <environment>
   ```

2. **Verify environment variables**:
   Ensure all environment variables in the appropriate `.env.docker.*` file are correctly set.

3. **Port conflicts**:
   Make sure ports 3000, 5432, and 54321 are not already in use on your machine.

4. **Docker version**:
   Ensure you have the latest version of Docker installed.

5. **Clean and rebuild**:
   ```bash
   ./docker-helper.sh clean <environment>
   ./docker-helper.sh build <environment>
   ./docker-helper.sh start <environment>
   ```

## Production Deployment

For production deployment, consider:

1. Using a proper secret management solution
2. Setting up HTTPS with a reverse proxy like Nginx
3. Using a container orchestration platform like Kubernetes or a managed service
4. Implementing proper monitoring and logging

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs) 