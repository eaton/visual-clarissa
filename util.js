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

export function getLetter(letter, format = 'xml') {
  const path = `./data/${format}/${generateId(letter)}.${format}`;
  if (jetpack.exists(path) === 'file') {
    return jetpack.read(path, 'utf8');
  }
  return false;
}
