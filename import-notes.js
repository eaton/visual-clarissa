import jetpack from 'fs-jetpack';
import * as cheerio from 'cheerio';
import * as t from './db/schema.js';
import { connect } from './db/connection.js';

const html = jetpack.read('./samuel-richardson_clarissa/src/epub/text/endnotes.xhtml');
const $ = cheerio.load(html);

const notes = $.extract({
  notes: [{
    selector: 'li[epub\\:type="endnote"]',
    value: (el, key) => {
      return {
        noteId: $(el).attr('id'),
        xml: $(el).prop('innerHTML')
      }
    },
  }]
});

const db = connect();
console.log(`${notes.notes.length} notes extracted`);
const results = await db.insert(t.notes).values(notes.notes).onConflictDoNothing()
console.log(`${results.count ?? 'No'} notes inserted`);
