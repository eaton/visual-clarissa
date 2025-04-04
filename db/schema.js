import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const people = table("people", {
  id: t.text().primaryKey(),
  name: t.text().notNull(),
  title: t.text(),
  given: t.text(),
  family: t.text(),
  alias: t.text(),
  notes: t.text(),
});

export const letters = table("letters", {
  id: t.text().primaryKey().references(() => letters.id),

  title: t.text(),
  dateline: t.text(),

  writer: t.text().references(() => people.id),
  day: t.date({ mode: 'string' }),
  period: t.text(),
  place: t.text(),
});

export const recipients = table("recipients", {
  letter: t.text().references(() => letters.id),
  person: t.text().references(() => people.id),
});

export const stats = table("stats", {
  letter: t.text().references(() => letters.id),

  salutation: t.text(),
  valediction: t.text(),
  signature: t.text(),

  words: t.integer(),
  sentences: t.integer(),
  sentiment: t.decimal(),
  
  // embedding: t.vector({ dimensions: 768 })
});

