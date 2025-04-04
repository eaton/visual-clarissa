import { sql } from "drizzle-orm";
import { connect } from "./db/connection.js";
import * as t from "./db/schema.js";

const db = connect();
await db.execute(sql`DROP TABLE ${t.stats} CASCADE`);
await db.execute(sql`DROP TABLE ${t.recipients} CASCADE`);
await db.execute(sql`DROP TABLE ${t.letters} CASCADE`);
await db.execute(sql`DROP TABLE ${t.people} CASCADE`);
console.log('Tables dropped');