import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Database connection pool
// SSL configuration: Use secure defaults in production
// Set DATABASE_SSL=false to disable SSL in development
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" 
    ? true // Use default SSL with certificate validation
    : process.env.DATABASE_SSL === "true",
});

// Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from "./schema";
