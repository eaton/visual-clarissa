import jetpack from 'fs-jetpack';
import { Csv } from '@eatonfyi/serializers';
import { emptyDeep } from 'empty-deep';

import { connect } from "./util.js";
import * as t from "./drizzle.schema.js";

/**
 * Import people records
 */
let raw = jetpack.read('./data/people.csv', 'utf8');
const people = emptyDeep(new Csv().parse(raw));

const db = connect();
console.log(`${people.length} people loaded`);
let results = await db.insert(t.people).values(people).onConflictDoNothing()
console.log(`${results.count ?? 'No'} people inserted`);


/**
 * Import letter metadata
 */
raw = jetpack.read('./data/letters.csv', 'utf8');
const letters = emptyDeep(new Csv().parse(raw));

console.log(`${letters.length} letters loaded`);
results = await db.insert(t.letters).values(letters).onConflictDoNothing()
console.log(`${results.count ?? 'No'} letters inserted`);


/**
 * Import letter recipients
 */
raw = jetpack.read('./data/recipients.csv', 'utf8');
const recipients = emptyDeep(new Csv().parse(raw));

console.log(`${recipients.length} letter recipients loaded`);
results = await db.insert(t.recipients).values(recipients).onConflictDoNothing()
console.log(`${results.count ?? 'No'} letter recipients inserted`);
