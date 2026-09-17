export const semanticColors = Object.freeze({
  verbo: '#58a6ff',
  substantivo: '#f6a54d',
  adjetivo: '#ef7bbd',
  adverbio: '#56d4dd',
  pronome: '#b392f0',
  artigo: '#4fd1b5',
  preposicao: '#d2a8ff',
  conjuncao: '#ff9b7a',
  numeral: '#a5d6ff',
  interjeicao: '#ff7b72',
  desconhecido: '#91a0b2',
  confirmado: '#36c98f',
  validado: '#58a6ff',
  pendente: '#f3c969',
  conflitante: '#ff6b6b',
  incompleto: '#b392f0'
});

export function colorFor(category) {
  return semanticColors[normalizeCategory(category)] || semanticColors.desconhecido;
}

export function normalizeCategory(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
