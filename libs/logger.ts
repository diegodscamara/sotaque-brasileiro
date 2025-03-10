/**
 * Simple logger utility for consistent logging across the application
 */

/**
 * Logger interface
 */
interface Logger {
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

/**
 * Create a logger instance
 */
const createLogger = (): Logger => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    info: (message: string, ...args: any[]) => {
      console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
      console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    }
  };
};

/**
 * Export a singleton logger instance
 */
export const logger = createLogger(); 