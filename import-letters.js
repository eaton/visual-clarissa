import jetpack from 'fs-jetpack';
import * as cheerio from 'cheerio';
import * as t from './db/schema.js';
import { connect } from './db/connection.js';

const db = connect();
const chapters = jetpack.dir('./samuel-richardson_clarissa/src/epub/text');
const documents = [];

for (const file of chapters.find({ matching: ['letter-*.xhtml'] })) {
  const html = chapters.read(file);
  let $ = cheerio.load(html);
  
  const parentId = $('hgroup h2 span[epub\\:type="ordinal"]').text().padStart(3, '0');
  const docId = parentId + '.000';
  const title = $('p[epub\\:type="title"]').text();

  const enclosures = [];
  $('section > blockquote blockquote[epub\\:type="z3998:letter"]')
    .each((i, elem) => {
      const childId = parentId + '.' + (i+1).toString().padStart(3, '0');
      enclosures.push({
        docId: childId,
        parent: docId,
        xml: $(elem).html(),
      });
      $(elem).attr('data-enclosure-id', childId)
      $(elem).html('');
    });

  const xml = $('section > blockquote').html();
  documents.push({ docId, title, xml });
  documents.push(...enclosures);
}

console.log(`${documents.length} letters extracted`);
const results = await db.insert(t.doc).values(documents);
console.log(`${results.length} letters inserted`);
