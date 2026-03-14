import { ERROR_MESSAGES } from '@/constants';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(ERROR_MESSAGES.DATABASE_URL_MISSING);
}

const queryClient = postgres(connectionString);

export const db = drizzle(queryClient);
