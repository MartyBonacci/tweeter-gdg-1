import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create PostgreSQL connection with pooling
// Remove channel_binding parameter if present as it can cause connection issues
const cleanDatabaseUrl = process.env.DATABASE_URL.replace(/[&?]channel_binding=[^&]*/g, '');

const sql = postgres(cleanDatabaseUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 30, // Increased from 10 to 30 seconds
  connection: {
    application_name: 'tweeter',
  },
});

// Create Drizzle instance
export const db = drizzle(sql, { schema });

export default db;
