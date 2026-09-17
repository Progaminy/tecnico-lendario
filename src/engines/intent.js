import { normalizeLoose } from './tokenizer.js';

const rules = [
  { intent: 'analise_morfologica', tests: [/analise morfologica/, /morfologia/] },
  { intent: 'analise_sintatica', tests: [/analise sintatica/, /sintaxe/] },
  { intent: 'dividir_oracao', tests: [/divid(?:a|ir).*oracao/, /separ(?:e|ar).*oracao/] },
  { intent: 'consultar_palavra', tests: [/^o que e\s+/, /^que e\s+/, /^defin(?:a|ir)\s+/, /^significado de\s+/] },
  { intent: 'mostrar_referencia', tests: [/^(mostrar )?referencia/, /qual (e )?a fonte/, /fonte disso/] },
  { intent: 'explicar', tests: [/^explica(?:r| isto| isso)?/, /^por que/, /^porque classific/] }
];

export function detectIntent(text = '') {
  const normalized = normalizeLoose(text).replace(/[?!.,;:]+/g, ' ').replace(/\s+/g, ' ').trim();
  for (const rule of rules) {
    if (rule.tests.some(test => test.test(normalized))) {
      return { intent: rule.intent, confidence: 0.98, normalized };
    }
  }

  if (/\b(cria|crie|faca|faça|gere|construa|execute|abra|guarde|apague|edite)\b/u.test(String(text).toLocaleLowerCase('pt'))) {
    return { intent: 'executar_instrucao', confidence: 0.82, normalized };
  }

  return { intent: 'interpretar', confidence: 0.62, normalized };
}

export function extractLookupTerm(text = '') {
  const raw = String(text).trim().replace(/[?!.]+$/u, '');
  const normalized = normalizeLoose(raw);
  const prefixes = ['o que e ', 'que e ', 'defina ', 'definir ', 'significado de '];
  const found = prefixes.find(prefix => normalized.startsWith(prefix));
  if (!found) return raw.split(/\s+/u).at(-1) || '';
  return raw.slice(found.length).trim();
}
