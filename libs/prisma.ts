import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * PrismaClientSingleton - Creates a singleton instance of PrismaClient
 * This ensures we don't create multiple instances of PrismaClient in development
 * which can lead to exceeding connection limits
 */

// Define global type for PrismaClient
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Helper function to determine which environment variables to use
 * based on the current environment
 */
export function loadEnvConfig() {
  const env = process.env.NODE_ENV || 'development';
  const envFile = `.env.${env}`;
  
  // Check if environment-specific file exists
  if (fs.existsSync(path.resolve(process.cwd(), envFile))) {
    console.log(`Loading environment variables from ${envFile}`);
    
    // Load environment variables from the specific file
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), envFile)));
    
    // Set environment variables if they're not already set
    for (const key in envConfig) {
      if (!process.env[key]) {
        process.env[key] = envConfig[key];
      }
    }
  } else {
    console.log(`Environment file ${envFile} not found, using default .env`);
  }
  
  // Verify that required database variables are set
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set in environment variables');
  }
  
  console.log(`Prisma using environment: ${env}`);
}

// Initialize environment configuration before creating the Prisma client
loadEnvConfig();

// Create a singleton instance of PrismaClient
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, attach the instance to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 