import jetpack from 'fs-jetpack';
import * as cheerio from 'cheerio';

const html = jetpack.read('./samuel-richardson_clarissa/src/epub/text/endnotes.xhtml');
const $ = cheerio.load(html);

const notes = $.extract({
  notes: [{
    selector: 'li[epub\\:type="endnote"]',
    value: (el, key) => {
      return {
        id: $(el).attr('id'),
        xml: $(el).prop('innerHTML')
      }
    },
  }]
});
console.log(notes);