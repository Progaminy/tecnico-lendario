import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const dictionaryRaw = join(root, 'vendor', 'dicionario-aberto', 'raw');
const dictionaryCache = new Map();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const sourceReference = Object.freeze({
  id: 'figueiredo-1913',
  author: 'Cândido de Figueiredo',
  title: 'Novo Diccionário da Língua Portuguesa',
  edition: 'Nova edição essencialmente refundida, corrigida e copiosamente ampliada',
  place: 'Lisboa',
  publisher: 'Livraria Clássica Editora de A. M. Teixeira',
  year: 1913,
  volumes: 2,
  resource: 'Dicionário Aberto / edição digital derivada da obra',
  resourceLicense: 'CC BY-SA 2.5 Portugal'
});

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

    if (url.pathname === '/api/health') {
      const installed = Boolean(await stat(dictionaryRaw).catch(() => null));
      return sendJson(res, 200, { ok: true, dictionaryInstalled: installed });
    }

    if (url.pathname === '/api/lexicon') {
      const term = (url.searchParams.get('term') || '').trim();
      if (!term) return sendJson(res, 400, { ok: false, error: 'term_required' });
      const result = await lookupDictionary(term);
      if (result.error === 'dictionary_not_installed') return sendJson(res, 503, { ok: false, ...result });
      if (!result.entry) return sendJson(res, 404, { ok: false, ...result });
      return sendJson(res, 200, { ok: true, ...result });
    }

    return await serveStatic(url.pathname, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { ok: false, error: 'internal_error' });
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Técnico Lendário: http://127.0.0.1:${port}`);
  console.log('Corpus lexical: npm run dictionary:install (necessário apenas para instalar/atualizar).');
});

async function serveStatic(pathname, res) {
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safe = normalize(requested);
  if (safe.startsWith('..') || safe.includes(`..${process.platform === 'win32' ? '\\' : '/'}`) || safe.startsWith('vendor')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 — acesso recusado');
    return;
  }

  let target = join(root, safe);
  const rel = relative(root, target);
  if (rel.startsWith('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 — acesso recusado');
    return;
  }

  const info = await stat(target).catch(() => null);
  if (info?.isDirectory()) target = join(target, 'index.html');
  const body = await readFile(target).catch(() => null);
  if (!body) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 — ficheiro não encontrado');
    return;
  }
  res.writeHead(200, {
    'Content-Type': mime[extname(target)] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

async function lookupDictionary(term) {
  const normalized = normalizeLexical(term);
  const first = normalized.charAt(0).toUpperCase();
  if (!/^[A-Z]$/.test(first)) return { entry: null, candidates: [] };

  const file = join(dictionaryRaw, `${first}.xml`);
  const exists = await stat(file).catch(() => null);
  if (!exists) {
    const dictionaryExists = await stat(dictionaryRaw).catch(() => null);
    return dictionaryExists
      ? { entry: null, candidates: [] }
      : { error: 'dictionary_not_installed', entry: null, candidates: [] };
  }

  const index = await loadDictionaryLetter(first, file);
  const exact = index.byNormalized.get(normalized) || [];
  if (exact.length === 1) return { entry: exact[0], candidates: [] };
  if (exact.length > 1) return { entry: exact[0], candidates: exact.slice(1, 8).map(e => e.orth) };

  const loose = normalizeLoose(term);
  const looseMatches = index.byLoose.get(loose) || [];
  if (looseMatches.length === 1) return { entry: looseMatches[0], candidates: [] };
  return { entry: null, candidates: looseMatches.slice(0, 8).map(e => e.orth) };
}

async function loadDictionaryLetter(letter, file) {
  if (dictionaryCache.has(letter)) return dictionaryCache.get(letter);
  const xml = await readFile(file, 'utf8');
  const parsed = parseDictionaryXml(xml);
  dictionaryCache.set(letter, parsed);
  return parsed;
}

function parseDictionaryXml(xml) {
  const byNormalized = new Map();
  const byLoose = new Map();
  const entryPattern = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = entryPattern.exec(xml))) {
    const block = match[1];
    const orth = cleanXmlText(firstTag(block, 'orth'));
    if (!orth) continue;

    const senses = [];
    const grammarRaw = [];
    const sensePattern = /<sense\b[^>]*>([\s\S]*?)<\/sense>/gi;
    let senseMatch;
    while ((senseMatch = sensePattern.exec(block))) {
      const sense = senseMatch[1];
      const grammar = cleanXmlText(firstTag(sense, 'gramGrp'));
      const definition = cleanXmlText(firstTag(sense, 'def'));
      if (grammar) grammarRaw.push(grammar);
      if (definition) senses.push({ grammar, definition });
    }

    const category = categoryFromGrammar(grammarRaw);
    const entry = {
      orth,
      lemma: orth,
      category,
      grammarRaw,
      senses,
      status: category === 'desconhecido' ? 'incompleto' : 'confirmado',
      references: [sourceReference]
    };

    addToMap(byNormalized, normalizeLexical(orth), entry);
    addToMap(byLoose, normalizeLoose(orth), entry);
  }

  return { byNormalized, byLoose };
}

function categoryFromGrammar(groups) {
  const value = groups.join(' ').toLocaleLowerCase('pt');
  if (/\b(v\.|vb\.|verbo|v\.\s*(t|i|p|r))/u.test(value)) return 'verbo';
  if (/\badj/u.test(value)) return 'adjetivo';
  if (/\badv/u.test(value)) return 'adverbio';
  if (/\bpron/u.test(value)) return 'pronome';
  if (/\bprep/u.test(value)) return 'preposicao';
  if (/\bconj/u.test(value)) return 'conjuncao';
  if (/\binterj/u.test(value)) return 'interjeicao';
  if (/\bnum/u.test(value)) return 'numeral';
  if (/(^|\s)(m\.|f\.|s\.|subst)/u.test(value)) return 'substantivo';
  return 'desconhecido';
}

function firstTag(text, tag) {
  const match = text.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1] || '';
}

function cleanXmlText(value) {
  return decodeXmlEntities(String(value || '').replace(/<[^>]+>/g, ' '))
    .replace(/[_*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function normalizeLexical(value) {
  return String(value).toLocaleLowerCase('pt').trim();
}

function normalizeLoose(value) {
  return normalizeLexical(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function addToMap(map, key, value) {
  if (!key) return;
  const current = map.get(key) || [];
  current.push(value);
  map.set(key, current);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}
