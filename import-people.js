import jetpack from 'fs-jetpack';

import * as t from './db/schema.js';
import { connect } from './db/connection.js';

const people = jetpack.read('./people.json', 'json');

const db = connect();
console.log(`${people.length} people loaded`);
const results = await db.insert(t.people).values(people).onConflictDoNothing()
console.log(`${results.count ?? 'No'} people inserted`);
