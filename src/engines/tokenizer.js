const WORD_OR_PUNCT = /[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*|\d+(?:[.,]\d+)?|[^\s\p{L}\p{M}\d]/gu;

export function tokenize(text = '') {
  return String(text)
    .match(WORD_OR_PUNCT)
    ?.map((surface, index) => ({
      index,
      surface,
      normalized: normalizeWord(surface),
      kind: classifySurface(surface)
    })) || [];
}

export function normalizeWord(value = '') {
  return String(value).toLocaleLowerCase('pt').trim();
}

export function normalizeLoose(value = '') {
  return normalizeWord(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function splitSentences(text = '') {
  const input = String(text).trim();
  if (!input) return [];
  return input
    .split(/(?<=[.!?])\s+/u)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

function classifySurface(value) {
  if (/^[\p{L}\p{M}]/u.test(value)) return 'word';
  if (/^\d/u.test(value)) return 'number';
  return 'punctuation';
}
