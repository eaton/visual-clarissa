import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const docs = table("docs", {
  docId: t.text().primaryKey(),
  parent: t.text(),
  title: t.text(),
  xml: t.text().notNull(),
});

export const notes = table("notes", {
  noteId: t.text().primaryKey(),
  xml: t.text().notNull(),
});

export const people = table("people", {
  personId: t.text().primaryKey(),
  name: t.text().notNull(),
  given: t.text(),
  family: t.text(),
  title: t.text(),
  aliases: t.text().array(),
  notes: t.text(),
});

export const relations = table("relations", {
  relationId: t.serial(),
  source: t.text().notNull().references(() => people.personId),
  rel: t.text().notNull(),
  target: t.text().notNull().references(() => people.personId),
  notes: t.text(),
});

export const letters = table("letters", {
  docId: t.text().primaryKey().references(() => docs.docId),
  writer: t.text().references(() => people.personId),
  sender: t.text().references(() => people.personId),
  recipient: t.text().references(() => people.personId),

  date: t.date({ mode: 'string' }),
  words: t.integer(),
  sentiment: t.decimal(),

  title: t.text(),
  dateline: t.text(),
  salutation: t.text(),
  text: t.text().notNull(),
  valediction: t.text(),
  signature: t.text(),
});

/*
export const embeddings = table("embeddings", {
  id: t.serial().primaryKey(),
  docId: t.text().references(() => document.docId),
  order: t.integer().default(0),
  data: t.vector({ dimensions: 1024 }),
}, (table) => [
  t.index('text_embedding').on(table.data)
]);
*/
