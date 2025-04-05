import 'dotenv/config'
import * as schema from './drizzle.schema.js';
import { drizzle } from 'drizzle-orm/node-postgres';
import jetpack from 'fs-jetpack';

export function generateId(letter, index = 0) {
  if (typeof letter === 'string' && letter.includes('-')) {
    return letter;
  }
  const chapter = letter.toString().padStart(3, '0');
  const enclosure = index.toString().padStart(3, '0');
  return [chapter, enclosure].join('-');
}

export function superTrim(input) {
  if (Array.isArray(input)) return input.map(superTrim);
  return input
    .replaceAll(/^[\s]*/g, '')
    .replaceAll(/[\s]*$/g, '')
    .replaceAll(/\n+\t*/g, '\n')
    .replaceAll(/[\s]+/g, ' ');
}

export function getLetter(letter, full = false) {
  const id = full ? generateId(letter).slice(0,4) + '000' : generateId(letter);
  const path = `./data/xml/${id}${full ? '.full' : ''}.xml`;

  if (jetpack.exists(path) === 'file') {
    return jetpack.read(path, 'utf8');
  }
  return false;
}

export function connect() {
  return drizzle({ schema, connection: { connectionString: process.env.POSTGRES_URL } });
}