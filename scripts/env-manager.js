#!/usr/bin/env node

/**
 * Environment Manager Script
 * 
 * This script helps manage environment variables across different environments.
 * It can:
 * 1. Copy environment-specific variables to .env
 * 2. Create a new environment file based on an existing one
 * 
 * Usage:
 *   pnpm env-manager use <environment>
 *   pnpm env-manager create <new-environment> [base-environment]
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_ENV = 'development';

/**
 * Copy environment-specific variables to .env file
 * @param {string} environment - The environment to use (development, staging, production)
 */
function switchEnvironment(environment) {
  const envFile = path.join(ROOT_DIR, `.env.${environment}`);
  const targetFile = path.join(ROOT_DIR, '.env');
  
  if (!fs.existsSync(envFile)) {
    console.error(`Error: Environment file .env.${environment} does not exist.`);
    process.exit(1);
  }
  
  // Create a backup of the existing .env file if it exists
  if (fs.existsSync(targetFile)) {
    const backupFile = path.join(ROOT_DIR, '.env.backup');
    fs.copyFileSync(targetFile, backupFile);
    console.log(`Created backup of existing .env file at .env.backup`);
  }
  
  // Read the environment file
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  // Write to .env file
  fs.writeFileSync(targetFile, envContent);
  
  console.log(`Successfully copied .env.${environment} to .env`);
  console.log(`Prisma will now use the ${environment} environment variables.`);
}

/**
 * Create a new environment file based on an existing one
 * @param {string} newEnv - The new environment name
 * @param {string} baseEnv - The base environment to copy from
 */
function createEnvironment(newEnv, baseEnv = DEFAULT_ENV) {
  const baseEnvFile = path.join(ROOT_DIR, `.env.${baseEnv}`);
  const newEnvFile = path.join(ROOT_DIR, `.env.${newEnv}`);
  
  if (!fs.existsSync(baseEnvFile)) {
    console.error(`Error: Base environment file .env.${baseEnv} does not exist.`);
    process.exit(1);
  }
  
  if (fs.existsSync(newEnvFile)) {
    console.error(`Error: Environment file .env.${newEnv} already exists.`);
    process.exit(1);
  }
  
  // Read the base environment file
  const baseEnvContent = fs.readFileSync(baseEnvFile, 'utf8');
  
  // Update the header to reflect the new environment
  const updatedContent = baseEnvContent.replace(
    new RegExp(`# ${baseEnv.charAt(0).toUpperCase() + baseEnv.slice(1)} Environment Configuration`, 'i'),
    `# ${newEnv.charAt(0).toUpperCase() + newEnv.slice(1)} Environment Configuration`
  );
  
  // Write to the new environment file
  fs.writeFileSync(newEnvFile, updatedContent);
  
  console.log(`Successfully created .env.${newEnv} based on .env.${baseEnv}`);
}

/**
 * Check which environment is currently active
 */
function checkCurrentEnvironment() {
  const envFile = path.join(ROOT_DIR, '.env');
  
  if (!fs.existsSync(envFile)) {
    console.log('No active environment found. The .env file does not exist.');
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envHeaderMatch = envContent.match(/# (.*?) Environment Configuration/);
  
  if (envHeaderMatch && envHeaderMatch[1]) {
    const currentEnv = envHeaderMatch[1].toLowerCase();
    console.log(`Current active environment: ${currentEnv}`);
  } else {
    console.log('Active environment could not be determined from .env file.');
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.error('Error: No command specified.');
    showHelp();
    process.exit(1);
  }
  
  let environment, newEnv, baseEnv;
  
  switch (command) {
    case 'use':
      environment = args[1] || DEFAULT_ENV;
      switchEnvironment(environment);
      break;
    case 'create':
      newEnv = args[1];
      baseEnv = args[2] || DEFAULT_ENV;
      
      if (!newEnv) {
        console.error('Error: No new environment name specified.');
        showHelp();
        process.exit(1);
      }
      
      createEnvironment(newEnv, baseEnv);
      break;
    case 'current':
      checkCurrentEnvironment();
      break;
    case 'help':
      showHelp();
      break;
    default:
      console.error(`Error: Unknown command '${command}'.`);
      showHelp();
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
Environment Manager Script

Usage:
  pnpm env-manager use <environment>     - Copy environment-specific variables to .env
  pnpm env-manager create <new-env> [base-env] - Create a new environment file
  pnpm env-manager current               - Show currently active environment
  pnpm env-manager help                  - Show this help message

Examples:
  pnpm env-manager use development       - Use development environment
  pnpm env-manager use staging           - Use staging environment
  pnpm env-manager use production        - Use production environment
  pnpm env-manager create testing development - Create testing environment based on development
  `);
}

// Run the main function
main(); 