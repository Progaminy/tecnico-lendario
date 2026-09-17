import { GeralTecnico } from './engines/geral-tecnico.js';
import { colorFor } from './ui/semantic-colors.js';
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  appendMessage,
  deleteConversation as removeConversation,
  getActiveConversationId,
  setActiveConversationId,
  getPreferences,
  savePreferences,
  rememberValidatedChoice,
  addPendingKnowledge
} from './storage.js';

const $ = selector => document.querySelector(selector);
const els = {
  sidebar: $('#sidebar'),
  list: $('#conversationList'),
  title: $('#conversationTitle'),
  meta: $('#conversationMeta'),
  messages: $('#messages'),
  input: $('#input'),
  send: $('#send'),
  newConversation: $('#newConversation'),
  renameConversation: $('#renameConversation'),
  deleteConversation: $('#deleteConversation'),
  mobileMenu: $('#mobileMenu'),
  togglePreferences: $('#togglePreferences'),
  preferencesDialog: $('#preferencesDialog'),
  variantPreference: $('#variantPreference'),
  showCorrections: $('#showCorrections'),
  savePreferences: $('#savePreferences'),
  savePreference: $('#savePreference'),
  activeEngine: $('#activeEngine'),
  activeIntent: $('#activeIntent'),
  activeStatus: $('#activeStatus'),
  detectedCategories: $('#detectedCategories'),
  referencePanel: $('#referencePanel'),
  referenceContent: $('#referenceContent')
};

let preferences = getPreferences();
const engine = new GeralTecnico({ preferences });
let activeId = ensureConversation();

boot();

function boot() {
  hydratePreferences();
  renderConversationList();
  renderActiveConversation();
  bindEvents();
  els.input.focus();
}

function ensureConversation() {
  const storedId = getActiveConversationId();
  if (storedId && getConversation(storedId)) return storedId;
  const existing = getConversations()[0];
  if (existing) {
    setActiveConversationId(existing.id);
    return existing.id;
  }
  return createConversation().id;
}

function bindEvents() {
  els.send.addEventListener('click', sendCurrent);
  els.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendCurrent();
    }
  });

  els.newConversation.addEventListener('click', () => {
    const conversation = createConversation();
    activeId = conversation.id;
    renderConversationList();
    renderActiveConversation();
    closeMobileMenu();
    els.input.focus();
  });

  els.title.addEventListener('change', () => renameActive(els.title.value));
  els.title.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      els.title.blur();
    }
  });
  els.renameConversation.addEventListener('click', () => {
    els.title.focus();
    els.title.select();
  });

  els.deleteConversation.addEventListener('click', () => {
    const current = getConversation(activeId);
    if (!current) return;
    if (!confirm(`Apagar a conversa “${current.title}”?`)) return;
    const remaining = removeConversation(activeId);
    activeId = remaining[0]?.id || createConversation().id;
    setActiveConversationId(activeId);
    renderConversationList();
    renderActiveConversation();
  });

  els.mobileMenu.addEventListener('click', () => els.sidebar.classList.toggle('open'));

  els.togglePreferences.addEventListener('click', () => {
    hydratePreferences();
    els.preferencesDialog.showModal();
  });

  els.savePreferences.addEventListener('click', () => {
    preferences = savePreferences({
      variant: els.variantPreference.value,
      showCorrections: els.showCorrections.checked
    });
    engine.setPreferences(preferences);
  });

  document.querySelectorAll('.quick-tools button').forEach(button => {
    button.addEventListener('click', () => runQuickCommand(button.dataset.command));
  });
}

function sendCurrent() {
  const text = els.input.value.trim();
  if (!text) return;
  els.input.value = '';
  processUserText(text);
}

function processUserText(text) {
  let conversation = appendMessage(activeId, { role: 'user', text });
  if (!conversation) return;

  if (conversation.messages.filter(m => m.role === 'user').length === 1 && conversation.title === 'Nova conversa') {
    conversation = updateConversation(activeId, { title: generateTitle(text) });
  }

  const { route, result } = engine.process(text, {
    conversationId: activeId,
    preferences
  });

  registerPending(result, text);

  appendMessage(activeId, {
    role: 'engine',
    text: result.text,
    result: serializableResult(result),
    route
  });

  renderConversationList();
  renderActiveConversation();
  updateInspector(route, result);
}

function runQuickCommand(command) {
  const text = els.input.value.trim();
  const map = {
    'analise-morfologica': `Análise morfológica: ${text}`,
    'analise-sintatica': `Análise sintática: ${text}`,
    'dividir-oracao': `Divida a oração: ${text}`,
    referencia: 'Mostrar referência',
    explicar: 'Explicar'
  };
  const value = map[command];
  if (!value) return;
  if (!text && ['analise-morfologica', 'analise-sintatica', 'dividir-oracao'].includes(command)) {
    els.input.focus();
    return;
  }
  if (text) els.input.value = '';
  processUserText(value);
}

function renderConversationList() {
  els.list.replaceChildren();
  for (const conversation of getConversations()) {
    const button = document.createElement('button');
    button.className = `conversation-item${conversation.id === activeId ? ' active' : ''}`;
    button.type = 'button';

    const strong = document.createElement('strong');
    strong.textContent = conversation.title;
    const small = document.createElement('small');
    small.textContent = formatRelativeDate(conversation.updatedAt);
    button.append(strong, small);

    button.addEventListener('click', () => {
      activeId = conversation.id;
      setActiveConversationId(activeId);
      renderConversationList();
      renderActiveConversation();
      closeMobileMenu();
    });
    els.list.append(button);
  }
}

function renderActiveConversation() {
  const conversation = getConversation(activeId);
  if (!conversation) return;
  els.title.value = conversation.title;
  els.meta.textContent = `${conversation.messages.length} registo(s) · ${preferences.variant}`;
  els.messages.replaceChildren();

  if (!conversation.messages.length) {
    els.messages.append(emptyState());
  } else {
    for (const message of conversation.messages) {
      els.messages.append(renderMessage(message));
    }
  }
  requestAnimationFrame(() => { els.messages.scrollTop = els.messages.scrollHeight; });
}

function emptyState() {
  const wrap = document.createElement('article');
  wrap.className = 'message engine';
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const head = document.createElement('div');
  head.className = 'message-head';
  const title = document.createElement('strong');
  title.textContent = 'Técnico Lendário';
  const state = document.createElement('span');
  state.textContent = 'aguardando instrução';
  head.append(title, state);
  const body = document.createElement('div');
  body.className = 'engine-result';
  body.textContent = 'Escreva uma instrução. O geral-tecnico encaminhará apenas a análise necessária para o pt-tecnico.';
  bubble.append(head, body);
  wrap.append(bubble);
  return wrap;
}

function renderMessage(message) {
  const article = document.createElement('article');
  article.className = `message ${message.role === 'user' ? 'user' : 'engine'}`;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (message.role === 'user') {
    bubble.textContent = message.text;
    article.append(bubble);
    return article;
  }

  const result = message.result || {};
  const head = document.createElement('div');
  head.className = 'message-head';
  const title = document.createElement('strong');
  title.textContent = result.engine || 'geral-tecnico';
  const state = document.createElement('span');
  state.textContent = `${result.intent || 'resultado'} · ${result.status || 'incompleto'}`;
  head.append(title, state);

  const body = document.createElement('div');
  body.className = 'engine-result';
  body.textContent = message.text;
  bubble.append(head, body);

  const words = (result.tokens || []).filter(token => token.kind !== 'punctuation' && token.category);
  if (words.length) bubble.append(renderTokens(words));
  if (result.validation) bubble.append(renderValidation(result.validation));

  article.append(bubble);
  return article;
}

function renderTokens(tokens) {
  const line = document.createElement('div');
  line.className = 'token-line';
  for (const token of tokens) {
    const chip = document.createElement('span');
    chip.className = 'semantic-token';
    chip.style.setProperty('--token-color', colorFor(token.category));
    const word = document.createElement('span');
    word.textContent = token.surface;
    const category = document.createElement('b');
    category.textContent = token.category;
    chip.append(word, category);
    line.append(chip);
  }
  return line;
}

function renderValidation(validation) {
  const box = document.createElement('div');
  box.className = 'validation-box';
  const title = document.createElement('div');
  title.className = 'validation-title';
  title.textContent = validation.question;
  box.append(title);

  const options = document.createElement('div');
  options.className = 'validation-options';
  const group = `validation-${Math.random().toString(36).slice(2)}`;

  for (const option of validation.options || []) {
    const label = document.createElement('label');
    label.className = 'validation-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = group;
    radio.value = option.id;
    radio.addEventListener('change', () => validateChoice(validation, option.id, option.label));
    const text = document.createElement('span');
    text.textContent = option.label;
    label.append(radio, text);
    options.append(label);
  }
  box.append(options);

  if (validation.allowManual) {
    const manual = document.createElement('textarea');
    manual.className = 'manual-validation';
    manual.placeholder = 'Nenhuma opção serve? Escreva aqui a validação manual e pressione Ctrl+Enter.';
    manual.addEventListener('keydown', event => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && manual.value.trim()) {
        validateChoice(validation, 'manual', manual.value.trim());
        manual.disabled = true;
      }
    });
    box.append(manual);
  }
  return box;
}

function validateChoice(validation, id, label) {
  if (els.savePreference.checked) {
    preferences = rememberValidatedChoice(validation.key, { id, label });
    engine.setPreferences(preferences);
  }
  appendMessage(activeId, {
    role: 'engine',
    text: `Validação registada para este caso: ${label}.${els.savePreference.checked ? ' Também foi guardada como preferência.' : ''}`,
    result: {
      engine: 'geral-tecnico',
      intent: 'validacao',
      status: 'validado',
      tokens: [],
      references: []
    }
  });
  renderActiveConversation();
}

function updateInspector(route, result) {
  els.activeEngine.textContent = result.engine || route.engine || 'geral-tecnico';
  els.activeIntent.textContent = result.intent || route.intent || 'interpretar';
  els.activeStatus.textContent = result.status || 'incompleto';
  els.activeStatus.className = `status-text ${result.status || 'incomplete'}`;

  const categories = [...new Set((result.tokens || []).map(t => t.category).filter(Boolean))];
  els.detectedCategories.replaceChildren();
  for (const category of categories) {
    const chip = document.createElement('span');
    chip.className = 'category-chip';
    chip.textContent = category;
    chip.style.color = colorFor(category);
    els.detectedCategories.append(chip);
  }

  const references = result.references || [];
  els.referencePanel.hidden = !references.length;
  els.referenceContent.replaceChildren();
  for (const ref of references) {
    const p = document.createElement('p');
    p.textContent = [ref.author, ref.title, ref.year].filter(Boolean).join(' — ');
    els.referenceContent.append(p);
  }
}

function renameActive(value) {
  const title = String(value).trim() || 'Sem título';
  updateConversation(activeId, { title });
  renderConversationList();
  renderActiveConversation();
}

function hydratePreferences() {
  preferences = getPreferences();
  els.variantPreference.value = preferences.variant || 'hibrido';
  els.showCorrections.checked = preferences.showCorrections !== false;
  engine.setPreferences(preferences);
}

function registerPending(result, originalText) {
  if (!result.pending) return;
  const items = Array.isArray(result.pending) ? result.pending : [result.pending];
  for (const item of items) {
    addPendingKnowledge({ ...item, originalText, conversationId: activeId });
  }
}

function serializableResult(result) {
  return JSON.parse(JSON.stringify({
    engine: result.engine,
    intent: result.intent,
    status: result.status,
    tokens: result.tokens || [],
    references: result.references || [],
    validation: result.validation || null,
    data: result.data || null
  }));
}

function generateTitle(text) {
  const cleaned = String(text)
    .replace(/^(análise|analise|divida|defina|o que é|o que e|crie|faça|faca)\s+/iu, '')
    .replace(/\s+/g, ' ')
    .trim();
  const words = cleaned.split(' ').filter(Boolean).slice(0, 6);
  const title = words.join(' ') || 'Nova conversa';
  return title.length > 48 ? `${title.slice(0, 45)}…` : title;
}

function formatRelativeDate(iso) {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleString('pt', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function closeMobileMenu() {
  els.sidebar.classList.remove('open');
}
