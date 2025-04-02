import jetpack from 'fs-jetpack';
import * as cheerio from 'cheerio';

// First-pass letter import steps:
// 1. Loop through letter list
// 2. Assign an ID
// 3. Identify enclosed letters
// 4. Assign sub-IDs
// 5. Replace sub-letter bodies with ID pointers in parent letters
// 6. Generate "simple html" version of each letter
// 6. Generate plaintext version of each letter
// 7. Save to database

const letterTemplate = {
  id: 'hgroup h2 span[epub\\:type="ordinal"]',
  date: {
    selector: 'section > blockquote > p[epub\\:type="se:letter.dateline"] time, section > blockquote > header > p[epub\\:type="se:letter.dateline"] time',
    value: 'datetime'
  },
  title: 'hgroup p[epub\\:type="title"]',
  dateline: 'section > blockquote > p[epub\\:type="se:letter.dateline"], section > blockquote > header > p[epub\\:type="se:letter.dateline"]',
  sender: 'section > blockquote > footer span[epub\\:type*="z3998:sender"]',
  recipient: 'section > blockquote > header > p.letter-header span[epub\\:type*="z3998:recipient"]',
  salutation: 'section > blockquote > header > p[epub\\:type*="z3998:salutation"]',
  valediction: 'section > blockquote > footer p[epub\\:type="z3998:valediction"]',
  signature: 'section > blockquote > footer p[epub\\:type*="z3998:signature"]',
  enclosures: [{
    selector: 'section > blockquote > blockquote[epub\\:type="z3998:letter"]',
    value: 'outerHTML'
  }]
};

const enclosureTemplate = {
  id: 'hgroup h2 span[epub\\:type="ordinal"]',
  date: {
    selector: 'header p[epub\\:type="se:letter.dateline"] time',
    value: 'datetime'
  },
  title: 'p[epub\\:type="title"]',
  dateline: 'header p[epub\\:type="se:letter.dateline"]',
  sender: 'footer span[epub\\:type*="z3998:sender"]',
  recipient: 'p.letter-header span[epub\\:type*="z3998:recipient"]',
  salutation: 'header p[epub\\:type*="z3998:salutation"]',
  text: 'blockquote',
  markup: {
    selector: 'blockquote',
    value: 'innerHTML'
  },
  recipient: 'p.letter-header span[epub\\:type="z3998:recipient"]',
  valediction: 'footer p[epub\\:type="z3998:valediction"]',
  signature: 'footer p[epub\\:type*="z3998:signature"]',
};

const letters = [];
const chapters = jetpack.dir('samuel-richardson_clarissa/src/epub/text');
for (const file of   chapters.find({ matching: ['letter-*.xhtml'] })) {
  const list = parseLetter(chapters.read(file));
  for (const item of list) {
    letters.push(item);
  }
}
letters.sort((a, b) => a.id.localeCompare(b.id));
jetpack.write('letters.json', letters);

const people = new Set();
for (const letter of letters) {
  const from = letter.sender ?? letter.signature ?? false;
  const to = letter.recipient ?? letter.salutation ?? false;
  if (to) people.add(to);
  if (from) people.add(from);
}
jetpack.write('people.json', [...people]);


function parseLetter(html, isEnclosure) {
  const results = [];

  const $ = cheerio.load(html);
  let letter = $.extract(isEnclosure? enclosureTemplate : letterTemplate);
  if (!isEnclosure) {
    letter.id = letter.id.padStart(3, '0') + '.00';

    const replacement = $('<blockquote class="enclosure">[enclosure]</p>');
    $('section > blockquote > blockquote[epub\\:type="z3998:letter"]').replaceWith(replacement);
    letter.text = $('section > blockquote').text(); 
    letter.markup = $('section > blockquote').html(); 
  }

  results.push(cleanup(letter));
  
  if (letter.enclosures?.length) {
    let subId = 1;
    for (const enc of letter.enclosures) {
      const enclosure = parseLetter(enc, true).pop();
      enclosure.id = Number.parseInt(letter.id).toFixed(0).padStart(3, '0') + '.' + ((subId++).toFixed(0).padStart(2, '0'));
      results.push(cleanup(enclosure));
    }  
  }

  delete letter.enclosures;

  return results;
}

function cleanup(letter) {
  const participants = /(.*), to (.*)/.exec(letter.title);
  if (participants) {
    letter.sender ??= participants[1] ?? undefined;
    letter.recipient ??= participants[2] ?? undefined;
  }
  if (letter.date) {
    const [month, day] = letter.date.split('-');
    const year = '1747';
    letter.date = [year, month, day].join('-');
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