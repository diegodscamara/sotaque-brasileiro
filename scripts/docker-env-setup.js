#!/usr/bin/env node

/**
 * Docker Environment Setup Script
 * 
 * This script helps set up Docker environment files based on local environment files.
 * It can:
 * 1. Create Docker environment files from local environment files
 * 2. Update Docker environment files with specific Docker settings
 * 
 * Usage:
 *   pnpm docker-env-setup <environment>
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_ENV = 'development';

/**
 * Create Docker environment file from local environment file
 * @param {string} environment - The environment to use (development, staging, production)
 */
function setupDockerEnv(environment) {
  const localEnvFile = path.join(ROOT_DIR, `.env.${environment}`);
  const dockerEnvFile = path.join(ROOT_DIR, `.env.docker.${environment}`);
  
  if (!fs.existsSync(localEnvFile)) {
    console.error(`Error: Local environment file .env.${environment} does not exist.`);
    process.exit(1);
  }
  
  // Read the local environment file
  const localEnvContent = fs.readFileSync(localEnvFile, 'utf8');
  const envConfig = dotenv.parse(localEnvContent);
  
  // Add Docker-specific settings
  let dockerEnvContent = `# -----------------------------------------------------------------------------\n`;
  dockerEnvContent += `# Docker ${environment.charAt(0).toUpperCase() + environment.slice(1)} Environment Configuration\n`;
  dockerEnvContent += `# -----------------------------------------------------------------------------\n\n`;
  
  // Add Node environment
  dockerEnvContent += `# Node Environment\n`;
  dockerEnvContent += `NODE_ENV=${environment}\n`;
  dockerEnvContent += `NEXT_TELEMETRY_DISABLED=1\n\n`;
  
  // Add Database Configuration
  dockerEnvContent += `# Database Configuration\n`;
  
  if (environment === 'development') {
    // For development, use the Docker container's database
    dockerEnvContent += `DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres\n\n`;
  } else {
    // For other environments, use the original database URL
    dockerEnvContent += `DATABASE_URL=${envConfig.DATABASE_URL || ''}\n\n`;
  }
  
  // Add Supabase Configuration
  dockerEnvContent += `# Supabase Configuration for ${environment.charAt(0).toUpperCase() + environment.slice(1)}\n`;
  
  if (environment === 'development') {
    // For development, use host.docker.internal to access the host machine
    dockerEnvContent += `# Using host.docker.internal to access the host machine from inside the container\n`;
    dockerEnvContent += `NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321\n`;
  } else {
    dockerEnvContent += `NEXT_PUBLIC_SUPABASE_URL=${envConfig.NEXT_PUBLIC_SUPABASE_URL || ''}\n`;
  }
  
  dockerEnvContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}\n`;
  dockerEnvContent += `SUPABASE_SERVICE_ROLE_KEY=${envConfig.SUPABASE_SERVICE_ROLE_KEY || ''}\n\n`;
  
  // Add Application Configuration
  dockerEnvContent += `# Application Configuration\n`;
  dockerEnvContent += `NEXTAUTH_URL=http://localhost:3000\n`;
  dockerEnvContent += `NEXTAUTH_SECRET=${environment}_secret_key_change_me_in_production\n\n`;
  
  // Add Debug Settings
  if (environment === 'development' || environment === 'staging') {
    dockerEnvContent += `# Debug Settings\n`;
    dockerEnvContent += `DEBUG=true\n`;
    dockerEnvContent += `LOG_LEVEL=debug\n\n`;
  }
  
  // Add Environment-specific settings
  dockerEnvContent += `# ${environment.charAt(0).toUpperCase() + environment.slice(1)}-specific settings\n`;
  dockerEnvContent += `NEXT_PUBLIC_API_URL=http://localhost:3000/api\n`;
  dockerEnvContent += `NEXT_PUBLIC_ASSET_PREFIX=\n`;
  dockerEnvContent += `NEXT_PUBLIC_APP_ENV=${environment}\n`;
  
  // Write to Docker environment file
  fs.writeFileSync(dockerEnvFile, dockerEnvContent);
  
  console.log(`Successfully created .env.docker.${environment} from .env.${environment}`);
  console.log(`Docker will now use the ${environment} environment variables.`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || DEFAULT_ENV;
  
  setupDockerEnv(environment);
}

// Run the main function
main(); 