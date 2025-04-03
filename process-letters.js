import * as cheerio from 'cheerio';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

import * as t from './db/schema.js';
import { connect } from './db/connection.js';
import { eq } from 'drizzle-orm';

// First-pass letter import steps:
// - Load letter
// - 
// - Generate "simple html" version of each letter
// - Generate plaintext version of each letter
// - Save to database

const db = connect();
const docs = await db.select().from(t.docs);

const nlp = winkNLP(model);
const its = nlp.its;
const as = nlp.as;

for (const doc of docs) {
  const $ = cheerio.load(doc.xml);
  const data = $.extract({
    dateline: 'header > p[epub\\:type="se:letter.dateline"]',
    date: {
      selector: 'header p[epub\\:type="se:letter.dateline"] time',
      value: 'datetime'
    },
    sender: 'footer span[epub\\:type*="z3998:sender"]',
    recipient: 'header > p.letter-header span[epub\\:type*="z3998:recipient"]',
    salutation: 'header > p[epub\\:type*="z3998:salutation"]',
    valediction: 'footer p[epub\\:type="z3998:valediction"]',
    signature: 'footer p[epub\\:type*="z3998:signature"]',
    text: '*',
  });

  data.docId = doc.docId;

  data.title ??= (doc.title ?? undefined);

  const cleaned = cleanup(data);

  const ndoc = nlp.readDoc(cleaned.text);
  cleaned.words = ndoc.out(its.readabilityStats).numOfWords;
  cleaned.sentiment = ndoc.out(its.sentiment);

  await db.update(t.letters).set(cleaned).where(eq(t.letters.docId, cleaned.docId));
  console.log(`${cleaned.docId} updated`);
}

function cleanup(letter) {
  const participants = /(.*), to (.*)/.exec(letter.title);
  if (participants) {
    letter.sender ??= participants[1] ?? undefined;
    letter.recipient ??= participants[2] ?? undefined;
  }
  if (letter.date) {
    const year = '1747';
    const segments = letter.date.split('-');
    if (segments.length === 2) {
      letter.date = [year, segments[0], segments[1]].join('-');
    } else {
      letter.date = [year, segments[1], segments[2]].join('-');
    }
  }
  letter.dateline = superTrim(letter.dateline, true);
  letter.salutation = superTrim(letter.salutation, true);
  letter.text = superTrim(letter.text);
  letter.valediction = superTrim(letter.valediction, true);
  letter.signature = superTrim(letter.signature, true);
  return letter;
}

function superTrim(input, collapseLines = false) {
  input = input?.replaceAll('\t', '').replaceAll(/\n+/g, '\n');
  if (collapseLines) {
    input = input?.replaceAll('\n', ' ');
  }
  if (input?.endsWith(',')) {
    input = input.slice(0, -1);
  }
  return input?.trim();
}