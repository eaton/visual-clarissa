import jetpack from 'fs-jetpack';
import * as t from './db/schema.js';
import { connect } from './db/connection.js';
import { asc, eq } from 'drizzle-orm';

const output = jetpack.dir('./output');
const db = connect();

const people = await db
  .select({
    id: t.people.id,
    name: t.people.name,
    alias: t.people.alias,
    notes: t.people.notes,
  })
  .from(t.people);

const letters = await db
  .select({
    id: t.letters.id,
    to: t.recipients.person,
    from: t.letters.writer,
    day: t.letters.day,
    words: t.stats.words,
    sentiment: t.stats.sentiment
  })
  .from(t.letters)
  .leftJoin(t.recipients, eq(t.letters.id, t.recipients.letter))
  .leftJoin(t.stats, eq(t.letters.id, t.stats.letter))
  .orderBy(asc(t.letters.id));

  output.write('people.json', people, { jsonIndent: 0 });
  output.write('letters.json', letters, { jsonIndent: 0 });
  output.write('data.json', { people, letters }, { jsonIndent: 0 });

/**
const letters = await db
  .select({
    id: t.letters.id,
    day: t.letters.day,
    writer: t.letters.writer,
    words: t.stats.words,
    sentiment: t.stats.sentiment
  })
  .from(t.letters)
  .leftJoin(t.stats, eq(t.stats.letter, t.letters.id));

const people = await db
  .select({
    id: t.people.id,
    name: t.people.name,
    alias: t.people.alias,
    notes: t.people.notes,
  })
  .from(t.people);


const recipients = await db
  .select({
    letter: t.recipients.letter,
    recipient: t.recipients.person,
  })
  .from(t.recipients);

output.write('data.json', { people, letters, recipients });
**/