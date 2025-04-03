import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres';

export function connect() {
  return drizzle(process.env.POSTGRES_URL);
}