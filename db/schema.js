import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const doc = table("doc", {
  docId: t.text().primaryKey(),
  parent: t.text(),
  title: t.text(),
  xml: t.text().notNull(),
});

export const person = table("person", {
  personId: t.text().primaryKey(),
  name: t.text().notNull(),
  given: t.text(),
  family: t.text(),
  title: t.text(),
  aliases: t.text().array(),
  notes: t.text(),
});

export const relation = table("relation", {
  relationId: t.serial(),
  from: t.text().notNull().references(() => person.personId),
  rel: t.text().notNull(),
  to: t.text().notNull().references(() => person.personId),
  notes: t.text(),
});

export const letter = table("letter", {
  letterId: t.serial().primaryKey(),

  docId: t.text().references(() => doc.docId),
  from: t.text().references(() => person.personId),
  to: t.text().references(() => person.personId),

  writer: t.text().references(() => person.personId),
  date: t.date({ mode: 'string' }),
  words: t.integer().default(0),

  title: t.text(),
  dateline: t.text(),
  salutation: t.text(),
  text: t.text().notNull(),
  valediction: t.text(),
  signature: t.text(),
});

/*
export const embedding = table("embedding", {
  id: t.serial().primaryKey(),
  docId: t.text().references(() => document.docId),
  order: t.integer().default(0),
  data: t.vector({ dimensions: 1024 }),
}, (table) => [
  t.index('text_embedding').on(table.data)
]);
*/
