const KEYS = Object.freeze({
  conversations: 'tecnico-lendario:conversations:v1',
  activeConversation: 'tecnico-lendario:active-conversation:v1',
  preferences: 'tecnico-lendario:preferences:v1',
  pendingKnowledge: 'tecnico-lendario:pending-knowledge:v1'
});

const defaultPreferences = Object.freeze({
  variant: 'hibrido',
  showCorrections: true,
  validatedChoices: {}
});

function safeParse(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function now() { return new Date().toISOString(); }
function id() { return globalThis.crypto?.randomUUID?.() || `c-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export function createConversation(title = 'Nova conversa') {
  const item = {
    id: id(),
    title,
    createdAt: now(),
    updatedAt: now(),
    messages: []
  };
  const all = getConversations();
  all.unshift(item);
  saveConversations(all);
  setActiveConversationId(item.id);
  return item;
}

export function getConversations() {
  return safeParse(localStorage.getItem(KEYS.conversations), []);
}

export function saveConversations(items) {
  localStorage.setItem(KEYS.conversations, JSON.stringify(items));
}

export function getConversation(conversationId) {
  return getConversations().find(c => c.id === conversationId) || null;
}

export function updateConversation(conversationId, patch) {
  const all = getConversations();
  const index = all.findIndex(c => c.id === conversationId);
  if (index < 0) return null;
  all[index] = { ...all[index], ...patch, updatedAt: now() };
  saveConversations(all);
  return all[index];
}

export function appendMessage(conversationId, message) {
  const convo = getConversation(conversationId);
  if (!convo) return null;
  const messages = [...convo.messages, { id: id(), createdAt: now(), ...message }];
  return updateConversation(conversationId, { messages });
}

export function deleteConversation(conversationId) {
  const remaining = getConversations().filter(c => c.id !== conversationId);
  saveConversations(remaining);
  if (getActiveConversationId() === conversationId) {
    setActiveConversationId(remaining[0]?.id || '');
  }
  return remaining;
}

export function getActiveConversationId() {
  return localStorage.getItem(KEYS.activeConversation) || '';
}

export function setActiveConversationId(conversationId) {
  if (conversationId) localStorage.setItem(KEYS.activeConversation, conversationId);
  else localStorage.removeItem(KEYS.activeConversation);
}

export function getPreferences() {
  return { ...defaultPreferences, ...safeParse(localStorage.getItem(KEYS.preferences), {}) };
}

export function savePreferences(patch) {
  const next = { ...getPreferences(), ...patch };
  localStorage.setItem(KEYS.preferences, JSON.stringify(next));
  return next;
}

export function rememberValidatedChoice(key, value) {
  const prefs = getPreferences();
  const validatedChoices = { ...prefs.validatedChoices, [key]: value };
  return savePreferences({ validatedChoices });
}

export function addPendingKnowledge(item) {
  const current = safeParse(localStorage.getItem(KEYS.pendingKnowledge), []);
  const pending = {
    id: id(),
    status: 'pendente',
    createdAt: now(),
    ...item
  };
  current.unshift(pending);
  localStorage.setItem(KEYS.pendingKnowledge, JSON.stringify(current));
  return pending;
}

export function getPendingKnowledge() {
  return safeParse(localStorage.getItem(KEYS.pendingKnowledge), []);
}
