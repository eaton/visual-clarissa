import { defineConfig } from "drizzle-kit";
import 'dotenv/config'

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle.schema.js",
  out: "./drizzle",
  url: process.env.POSTGRES_URL
});