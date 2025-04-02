import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js';

export function connect() {
  return drizzle(process.env.POSTGRES_URL);
}