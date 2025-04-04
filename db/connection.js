import 'dotenv/config'
import * as schema from './schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';

export function connect() {
  return drizzle({ schema, connection: { connectionString: process.env.POSTGRES_URL } });
}