import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import logger from './logger.js';

// Configure Neon for different environments
function configureNeonConnection() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isNeonLocal =
    process.env.DATABASE_URL?.includes('neon-local') ||
    process.env.DATABASE_URL?.includes('localhost');

  if (isNeonLocal) {
    // Configuration for Neon Local (development)
    logger.info('Configuring database for Neon Local development environment');

    // For Neon Local, we need to configure for HTTP-based communication
    const dbHost = process.env.DATABASE_URL.includes('neon-local')
      ? 'neon-local'
      : 'localhost';
    neonConfig.fetchEndpoint = `http://${dbHost}:5432/sql`;
    neonConfig.useSecureWebSocket = false;
    neonConfig.poolQueryViaFetch = true;

    logger.info(`Neon Local endpoint configured: ${neonConfig.fetchEndpoint}`);
  } else if (!isProduction) {
    // Development with Neon Cloud
    logger.info('Configuring database for Neon Cloud development environment');
  } else {
    // Production with Neon Cloud
    logger.info('Configuring database for Neon Cloud production environment');
  }
}

// Validate database URL
function validateDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    const error = 'DATABASE_URL environment variable is not set';
    logger.error(error);
    throw new Error(error);
  }

  logger.info('Database URL validated successfully');
}

// Initialize database connection
function initializeDatabase() {
  try {
    validateDatabaseUrl();
    configureNeonConnection();

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    logger.info('Database connection initialized successfully');
    return { db, sql };
  } catch (error) {
    logger.error('Failed to initialize database connection:', error);
    throw error;
  }
}

const { db, sql } = initializeDatabase();

export { db, sql };
