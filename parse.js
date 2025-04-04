import jetpack from 'fs-jetpack';
import * as cheerio from 'cheerio';

import { generateId } from './util.js';

const input = jetpack.dir('./samuel-richardson_clarissa/src/epub/text');
const output = jetpack.dir('./data');

const documents = [];
const markupProperty = 'innerHTML';

for (const file of input.find({ matching: ['letter-*.xhtml'] })) {
  const raw = input.read(file);
  let $ = cheerio.load(raw);

  const root = $('hgroup h2 span[epub\\:type="ordinal"]').text();
  const title = $('p[epub\\:type="title"]').text();
  const fullXml = $('section > blockquote').prop(markupProperty);

  const enclosures = [];
  $('section > blockquote blockquote[epub\\:type="z3998:letter"]')
    .each((i, elem) => {
      const id = generateId(root, i+1)
      enclosures.push({ id, xml: $(elem).prop(markupProperty) });
      
      // Add an enclosure-id to the wrapping blockquote, and remove the contents
      $(elem).attr('data-enclosure-id', id)
      $(elem).html('');
    });
  
  // Generate the xml for the root letter now that enclosures have been removed
  const xml = $('section > blockquote').prop(markupProperty);
  documents.push({ id: generateId(root), title, xml, fullXml });
  documents.push(...enclosures);
}

for (const { id, title, xml, fullXml } of documents) {
  output.dir('xml').write(`letter.${id}.xml`, xml);
  if (fullXml && (xml !== fullXml)) {
    output.dir('xml').write(`letter.${id}.full.xml`, fullXml);
  };
  console.log('Wrote letter', id, title ?? '');
}

const raw = input.read('endnotes.xhtml');
const $ = cheerio.load(raw);

const data = $.extract({
  notes: [{
    selector: 'li[epub\\:type="endnote"]',
    value: (el, key) => {
      return {
        id: $(el).attr('id'),
        backlink: $('a[epub\\:type="backlink"]', undefined, el).attr('href'),
        xml: $(el).prop(markupProperty)
      }
    },
  }]
});

for (const { id, xml, backlink } of data.notes) {
  const nid = id.replace('note-', '');
  if (backlink.startsWith('letter-')) {
    const lid = generateId(backlink.split('.')[0].split('-')[1]);
    output.dir('xml').write(`note.${lid}.${nid}.xml`, xml);
    console.log('Wrote endnote', nid, "for letter", lid);  
  }
}
