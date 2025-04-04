import ollama from 'ollama'
import * as cheerio from 'cheerio';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { htmlToText } from 'html-to-text';
import jetpack from 'fs-jetpack';

import { superTrim } from './util.js';

// Read in XML for each letter

const dir = jetpack.dir('./data/xml');

// Loop through the self-contained letters only; for this analysis we don't want
// to skew attribution statistics.
for (const file of dir.find({ matching: ['letter.???-???.xml'] })) {
  const xml = dir.read(file);
  const text = htmlToText(xml, { wordwrap: false });

  const id = file.split('.')[1];
  const data = {
    ...getLetterChunks(xml),
    ...getLetterStats(text),
    embedding: await getEmbedding(text),
  };

  console.log(data);

  break;
}

export function getLetterStats(letter) {
  const nlp = winkNLP(model, [ 'sbd', 'pos', 'negation', 'sentiment' ]);
  const its = nlp.its;
  const as = nlp.as;
  
  const doc = nlp.readDoc(letter);

  const adjectives = doc
    .tokens()
    .filter(t => !t.out(its.stopWordFlag) && t.out(its.pos) === 'ADJ')
    .out(its.normal, as.set);

  return {
    sentences: doc.out(its.readabilityStats).numOfSentences,
    wordCount: doc.out(its.readabilityStats).numOfWords,
    sentiment: doc.out(its.readabilityStats).sentiment,
    adjectives: [...adjectives].sort()
  }
}

export function getLetterChunks(letter) {
  const $ = cheerio.load(letter);
  const data = $.extract({
    salutation: 'header > p[epub\\:type*="z3998:salutation"]',
    valediction: 'footer p[epub\\:type="z3998:valediction"]',
    signature: 'footer p[epub\\:type*="z3998:signature"]',
  });

  return {
    salutation: data.salutation ? superTrim(data.salutation) : undefined,
    valediction: data.valediction ? superTrim(data.valediction) : undefined,
    signature: data.signature ? superTrim(data.signature) : undefined,
  }
}

export async function summarizeLetter(prompt, temperature = 0) {
  const system = "You are a literary critic analyzing the text of the novel 'Clarissa' written in 1784. The following text is a letter from one of the characters in the novel to another. List each of the characters mentioned in the letter, and the context in which they are mentioned, but do not include the letter's author or recipient.\n\n---\n\n";
  const summary = await ollama.generate({
    model: 'phi4:latest',
    system,
    prompt,
    format: 'json',
    options: { temperature }
  });
  
  return summary.response;
}

export async function getEmbedding(input) {
  const output = await ollama.embed({
    model: 'nomic-embed-text:latest',
    truncate: true,
    input
  });
  return output.embeddings[0];
}