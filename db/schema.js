import { pgTable as table, primaryKey } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
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
  id: t.text().primaryKey(),

  title: t.text(),
  dateline: t.text(),

  writer: t.text().references(() => people.id),
  day: t.date({ mode: 'string' }),
  period: t.text(),
  place: t.text(),
});

export const recipients = table("recipients", {
  letter: t.text().notNull().references(() => letters.id),
  person: t.text().references(() => people.id),
},
(t) => [ primaryKey({ columns: [t.userId, t.groupId] }) ]);

export const stats = table("stats", {
  letter: t.text().notNull().references(() => letters.id),

  salutation: t.text(),
  valediction: t.text(),
  signature: t.text(),

  words: t.integer(),
  sentences: t.integer(),
  sentiment: t.numeric({ mode: 'number', precision: 3, scale: 2 }),
  
  // embedding: t.vector({ dimensions: 768 })
});

export const statsRelations = relations(stats, ({ one }) => ({
  letter: one(letters, {
		fields: [stats.letter],
		references: [letters.id],
	}),
}));

export const recipientsRelations = relations(recipients, ({ one }) => ({
  letter: one(letters, {
		fields: [recipients.letter],
		references: [letters.id],
	}),
  person: one(people, {
		fields: [recipients.person],
		references: [people.id],
	}),
}));

export const lettersRelations = relations(letters, ({ one, many }) => ({
  writer: one(people, {
		fields: [letters.writer],
		references: [people.id],
	}),
  recipients: many(recipients, {
		fields: [recipients.letter],
		references: [letters.id],
	}),
  stats: one(stats),
}));

export const lettersToRecipientsRelations = relations(lettersRelations, ({ one }) => ({
  letter: one(letters, {
    fields: [recipients.letter],
    references: [letters.id],
  }),
  person: one(people, {
    fields: [recipients.person],
    references: [people.id],
  }),
}));

