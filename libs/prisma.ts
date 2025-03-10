import { PrismaClient } from '@prisma/client';

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
 * Helper function to log the current environment
 */
export function logEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  console.log(`Prisma using environment: ${env}`);
  
  // Verify that required database variables are set
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is not set in environment variables');
  }
}

// Log environment information
logEnvironment();

// Create a singleton instance of PrismaClient
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: process.env.DATABASE_URL 
    ? undefined 
    : {
        db: {
          url: "postgresql://postgres:postgres@localhost:54322/postgres"
        }
      }
});

// In development, attach the instance to the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 