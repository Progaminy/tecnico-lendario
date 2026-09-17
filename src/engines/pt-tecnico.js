import { lexiconSeed } from '../knowledge/lexicon.seed.js';
import { tokenize, splitSentences, normalizeWord, normalizeLoose } from './tokenizer.js';

const CATEGORY_LABELS = Object.freeze({
  verbo: 'verbo',
  substantivo: 'substantivo',
  adjetivo: 'adjetivo',
  adverbio: 'advérbio',
  pronome: 'pronome',
  artigo: 'artigo',
  preposicao: 'preposição',
  conjuncao: 'conjunção',
  numeral: 'numeral',
  interjeicao: 'interjeição',
  desconhecido: 'desconhecido'
});

const FUNCTION_WORDS = Object.freeze({
  de: ['preposicao', 'de'], do: ['preposicao', 'de'], da: ['preposicao', 'de'], dos: ['preposicao', 'de'], das: ['preposicao', 'de'],
  em: ['preposicao', 'em'], no: ['preposicao', 'em'], na: ['preposicao', 'em'], nos: ['preposicao', 'em'], nas: ['preposicao', 'em'],
  por: ['preposicao', 'por'], para: ['preposicao', 'para'], com: ['preposicao', 'com'], sem: ['preposicao', 'sem'],
  e: ['conjuncao', 'e'], ou: ['conjuncao', 'ou'], mas: ['conjuncao', 'mas'], porque: ['conjuncao', 'porque'],
  eu: ['pronome', 'eu'], tu: ['pronome', 'tu'], ele: ['pronome', 'ele'], ela: ['pronome', 'ela'],
  nós: ['pronome', 'nós'], nos: ['pronome', 'nós'], vocês: ['pronome', 'vocês'], eles: ['pronome', 'eles'], elas: ['pronome', 'elas']
});

export class PTTecnico {
  constructor({ preferences = {} } = {}) {
    this.preferences = preferences;
    this.lastResult = null;
  }

  setPreferences(preferences = {}) {
    this.preferences = preferences;
  }

  async lookup(term) {
    const surface = String(term || '').trim();
    const key = normalizeWord(surface);
    const seedEntry = lexiconSeed[key];

    if (seedEntry) return this.remember(this.lookupResult(surface, seedEntry));

    const corpus = await this.lookupOfflineCorpus(surface);
    if (corpus?.entry) {
      const entry = {
        lemma: corpus.entry.lemma || corpus.entry.orth || surface,
        category: corpus.entry.category || 'desconhecido',
        morphology: corpus.entry.grammarRaw?.length ? { classificacao_original: corpus.entry.grammarRaw.join('; ') } : {},
        senses: (corpus.entry.senses || []).map(sense => sense.definition).filter(Boolean),
        status: corpus.entry.status || 'confirmado',
        references: corpus.entry.references || []
      };
      return this.remember(this.lookupResult(corpus.entry.orth || surface, entry));
    }

    const correction = this.findCorrection(key);
    const validation = correction
      ? {
          question: `Não encontrei “${surface}” na base carregada. Quis dizer “${correction.word}”?`,
          key: `correction:${key}`,
          options: [
            { id: correction.word, label: correction.word },
            { id: 'manter', label: `Manter “${surface}” como está` }
          ],
          allowManual: true
        }
      : {
          question: `“${surface}” ainda não existe na base lexical carregada. Como deve ser tratado?`,
          key: `unknown:${key}`,
          options: [
            { id: 'substantivo', label: 'Substantivo' },
            { id: 'verbo', label: 'Verbo' },
            { id: 'adjetivo', label: 'Adjetivo' },
            { id: 'outro', label: 'Outra classificação' }
          ],
          allowManual: true
        };

    const installNote = corpus?.notInstalled
      ? '\nO corpus completo ainda não está instalado neste computador. Execute `npm run dictionary:install` uma vez com internet; depois as consultas funcionam offline.'
      : '';

    return this.remember({
      engine: 'pt-tecnico',
      intent: 'consultar_palavra',
      status: 'pendente',
      text: `Não encontrei “${surface}” no conhecimento lexical atualmente carregado. Não vou inventar uma definição. O item pode ser validado com fonte ou guardado como pendência por resolver.${installNote}`,
      tokens: [{ surface, category: 'desconhecido', lemma: key, status: 'pendente' }],
      references: [],
      pending: { type: 'lexical', term: surface, context: surface },
      validation
    });
  }

  analyseMorphology(text) {
    const analysed = tokenize(text).map(token => {
      if (token.kind !== 'word') return { ...token, category: 'pontuação', status: 'confirmado' };
      return { ...token, ...this.classifyWord(token.surface) };
    });
    const unknownCount = analysed.filter(t => t.status === 'pendente').length;
    const incompleteCount = analysed.filter(t => t.status === 'incompleto').length;
    const status = unknownCount ? 'pendente' : incompleteCount ? 'incompleto' : 'confirmado';
    const lines = analysed.map(token => {
      if (token.kind !== 'word') return `${token.surface} — pontuação`;
      const pieces = [token.surface, CATEGORY_LABELS[token.category] || token.category];
      if (token.lemma && token.lemma !== normalizeWord(token.surface)) pieces.push(`lema: ${token.lemma}`);
      if (token.morphology) {
        const morph = Object.entries(token.morphology)
          .filter(([, value]) => value !== undefined && value !== null && value !== false)
          .map(([morphKey, value]) => `${morphKey}: ${value}`)
          .join(', ');
        if (morph) pieces.push(morph);
      }
      if (token.status !== 'confirmado') pieces.push(`estado: ${token.status}`);
      return pieces.join(' — ');
    });

    return this.remember({
      engine: 'pt-tecnico',
      intent: 'analise_morfologica',
      status,
      text: lines.join('\n'),
      tokens: analysed.filter(t => t.kind === 'word'),
      references: collectReferences(analysed),
      data: analysed
    });
  }

  divideSentence(text) {
    const sentences = splitSentences(text);
    const sentenceData = sentences.map((sentence, sentenceIndex) => ({
      sentenceIndex,
      sentence,
      tokens: tokenize(sentence)
    }));
    const lines = sentenceData.flatMap(({ sentenceIndex, sentence, tokens }) => [
      `Oração/frase ${sentenceIndex + 1}: ${sentence}`,
      `Unidades: ${tokens.map(t => `[${t.surface}]`).join(' ')}`
    ]);

    return this.remember({
      engine: 'pt-tecnico',
      intent: 'dividir_oracao',
      status: 'confirmado',
      text: lines.join('\n'),
      tokens: sentenceData.flatMap(s => s.tokens.filter(t => t.kind === 'word').map(t => ({
        ...t,
        ...this.classifyWord(t.surface)
      }))),
      references: [],
      data: sentenceData
    });
  }

  analyseSyntax(text) {
    const tokens = tokenize(text).filter(t => t.kind === 'word').map(t => ({ ...t, ...this.classifyWord(t.surface) }));
    const verbIndex = tokens.findIndex(t => t.category === 'verbo');

    if (verbIndex < 0) {
      return this.remember({
        engine: 'pt-tecnico',
        intent: 'analise_sintatica',
        status: 'incompleto',
        text: 'Não identifiquei com segurança um núcleo verbal usando a gramática atualmente carregada. A análise sintática completa fica pendente em vez de ser inventada.',
        tokens,
        references: collectReferences(tokens),
        validation: {
          question: 'Qual palavra funciona como núcleo verbal nesta oração?',
          key: `syntax:verb:${normalizeLoose(text)}`,
          options: tokens.map(t => ({ id: t.surface, label: t.surface })).slice(0, 8),
          allowManual: true
        }
      });
    }

    const subjectTokens = tokens.slice(0, verbIndex);
    const predicateTokens = tokens.slice(verbIndex);
    const subject = subjectTokens.map(t => t.surface).join(' ') || '(sujeito não expresso antes do verbo)';
    const predicate = predicateTokens.map(t => t.surface).join(' ');

    return this.remember({
      engine: 'pt-tecnico',
      intent: 'analise_sintatica',
      status: 'incompleto',
      text: [
        `Núcleo verbal detectado: ${tokens[verbIndex].surface}`,
        `Segmento anterior ao núcleo verbal: ${subject}`,
        `Segmento a partir do núcleo verbal: ${predicate}`,
        '',
        'Estado: incompleto. Esta primeira fundação só segmenta em torno do núcleo verbal; funções sintáticas completas serão ativadas quando a gramática formal estiver carregada.'
      ].join('\n'),
      tokens,
      references: collectReferences(tokens),
      data: { verbIndex, subjectTokens, predicateTokens }
    });
  }

  async interpret(text) {
    const words = tokenize(text).filter(t => t.kind === 'word');
    if (words.length === 1) return this.lookup(words[0].surface);

    const tokens = words.map(t => ({ ...t, ...this.classifyWord(t.surface) }));
    const pending = tokens.filter(t => t.status === 'pendente');
    return this.remember({
      engine: 'pt-tecnico',
      intent: 'interpretar',
      status: pending.length ? 'pendente' : 'confirmado',
      text: pending.length
        ? `Pedido recebido e decomposto. ${pending.length} unidade(s) ainda não estão no conhecimento carregado; o motor não as tratará como conhecidas sem validação ou fonte.`
        : 'Pedido recebido e decomposto tecnicamente. Nenhuma análise adicional foi solicitada.',
      tokens,
      references: collectReferences(tokens),
      pending: pending.map(t => ({ type: 'lexical', term: t.surface, context: text }))
    });
  }

  explainLast() {
    if (!this.lastResult) return this.remember({
      engine: 'pt-tecnico', intent: 'explicar', status: 'incompleto', text: 'Ainda não existe um resultado anterior para explicar.', tokens: [], references: []
    });

    const previous = this.lastResult;
    const statusLine = `Estado atribuído: ${previous.status}.`;
    let reason = 'O resultado foi produzido pelo módulo correspondente à intenção detectada.';
    if (previous.intent === 'consultar_palavra') reason = 'A consulta procura primeiro o léxico mínimo interno e depois o corpus lexical offline, quando instalado. Se não encontra a entrada, não cria definição e abre uma pendência.';
    if (previous.intent === 'analise_morfologica') reason = 'Cada unidade foi tokenizada e classificada primeiro pelo léxico carregado e depois por heurísticas limitadas, marcadas como incompletas quando não têm confirmação lexical.';
    if (previous.intent === 'analise_sintatica') reason = 'A análise atual procura um núcleo verbal e segmenta a oração. Ela não afirma funções sintáticas ainda não sustentadas pela gramática carregada.';

    return {
      engine: 'pt-tecnico',
      intent: 'explicar',
      status: previous.status,
      text: `${reason}\n${statusLine}`,
      tokens: previous.tokens || [],
      references: previous.references || []
    };
  }

  referenceLast() {
    if (!this.lastResult?.references?.length) {
      return {
        engine: 'pt-tecnico',
        intent: 'mostrar_referencia',
        status: 'incompleto',
        text: 'O último resultado não possui referência bibliográfica carregada. Isso é assinalado em vez de inventar uma fonte.',
        tokens: [],
        references: []
      };
    }
    return {
      engine: 'pt-tecnico',
      intent: 'mostrar_referencia',
      status: 'confirmado',
      text: this.lastResult.references.map(formatReference).join('\n\n'),
      tokens: [],
      references: this.lastResult.references
    };
  }

  classifyWord(surface) {
    const key = normalizeWord(surface);
    const direct = lexiconSeed[key];
    if (direct) return {
      category: direct.category,
      lemma: direct.lemma,
      morphology: direct.morphology,
      status: direct.status,
      references: direct.references || []
    };

    const functionWord = FUNCTION_WORDS[key];
    if (functionWord) return {
      category: functionWord[0],
      lemma: functionWord[1],
      morphology: { invariant: ['preposicao', 'conjuncao'].includes(functionWord[0]) },
      status: 'confirmado',
      references: []
    };

    const loose = normalizeLoose(key);
    if (/^(.*)(ar|er|ir)$/.test(loose) && loose.length > 3) {
      return {
        category: 'verbo',
        lemma: key,
        morphology: { form: 'infinitivo', conjugation: `-${loose.slice(-2)}` },
        status: 'incompleto',
        references: []
      };
    }

    const finite = inferFiniteVerb(loose);
    if (finite) return finite;

    if (/^\d+(?:[.,]\d+)?$/.test(surface)) {
      return { category: 'numeral', lemma: key, morphology: {}, status: 'confirmado', references: [] };
    }

    return { category: 'desconhecido', lemma: key, morphology: {}, status: 'pendente', references: [] };
  }

  lookupResult(surface, entry) {
    return {
      engine: 'pt-tecnico',
      intent: 'consultar_palavra',
      status: entry.status || 'confirmado',
      text: this.formatLookup(surface, entry),
      tokens: [{ surface, category: entry.category, lemma: entry.lemma, status: entry.status }],
      references: entry.references || [],
      data: entry
    };
  }

  formatLookup(surface, entry) {
    const morph = Object.entries(entry.morphology || {})
      .map(([morphKey, value]) => `${morphKey}: ${value}`)
      .join(', ');
    const senses = (entry.senses || []).slice(0, 3).map((sense, index) => `${index + 1}. ${typeof sense === 'string' ? sense : sense.definition || ''}`).filter(line => !line.endsWith('. '));
    const senseText = senses.length ? `\nDefinição/aceções:\n${senses.join('\n')}` : '';
    return `${surface} → ${CATEGORY_LABELS[entry.category] || entry.category}\nLema: ${entry.lemma}${morph ? `\nMorfologia: ${morph}` : ''}${senseText}`;
  }

  async lookupOfflineCorpus(term) {
    try {
      const response = await fetch(`/api/lexicon?term=${encodeURIComponent(term)}`);
      if (response.ok) return response.json();
      if (response.status === 503) return { notInstalled: true };
      const body = await response.json().catch(() => ({}));
      return { entry: null, candidates: body.candidates || [] };
    } catch {
      return { entry: null, unavailable: true };
    }
  }

  findCorrection(word) {
    if (!word || word.length < 3) return null;
    const ranked = Object.keys(lexiconSeed)
      .map(candidate => ({ word: candidate, distance: levenshtein(normalizeLoose(word), normalizeLoose(candidate)) }))
      .sort((a, b) => a.distance - b.distance || a.word.localeCompare(b.word));
    if (!ranked.length || ranked[0].distance > 2) return null;
    if (ranked[1] && ranked[1].distance === ranked[0].distance) return null;
    return ranked[0];
  }

  remember(result) {
    this.lastResult = result;
    return result;
  }
}

function inferFiniteVerb(word) {
  const patterns = [
    { suffix: 'aram', tense: 'pretérito/perfeito ou forma compatível', person: '3.ª pessoa do plural' },
    { suffix: 'eram', tense: 'forma verbal possível', person: '3.ª pessoa do plural' },
    { suffix: 'iram', tense: 'forma verbal possível', person: '3.ª pessoa do plural' },
    { suffix: 'ava', tense: 'imperfeito possível', person: '1.ª/3.ª pessoa do singular' },
    { suffix: 'avam', tense: 'imperfeito possível', person: '3.ª pessoa do plural' },
    { suffix: 'ou', tense: 'pretérito perfeito possível', person: '3.ª pessoa do singular' }
  ];
  const match = patterns.find(p => word.endsWith(p.suffix) && word.length > p.suffix.length + 1);
  if (!match) return null;
  return {
    category: 'verbo',
    lemma: word,
    morphology: { form: 'finita provável', tense: match.tense, person: match.person },
    status: 'incompleto',
    references: []
  };
}

function collectReferences(items) {
  const seen = new Map();
  for (const item of items) {
    for (const ref of item.references || []) seen.set(ref.id || JSON.stringify(ref), ref);
  }
  return [...seen.values()];
}

export function formatReference(ref) {
  const author = ref.author ? `${ref.author}. ` : '';
  const title = ref.title ? `${ref.title}. ` : '';
  const edition = ref.edition ? `${ref.edition}. ` : '';
  const publication = [ref.place, ref.publisher, ref.year].filter(Boolean).join(': ').replace(/: (\d{4})$/, ', $1');
  return `${author}${title}${edition}${publication}.${ref.resource ? ` Recurso digital: ${ref.resource}.` : ''}${ref.resourceLicense ? ` Licença do recurso: ${ref.resourceLicense}.` : ''}`.trim();
}

function levenshtein(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}
