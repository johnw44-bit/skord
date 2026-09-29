import { DEFAULT_LISTS, purge, put, addUrl, addText, build } from './lib.js';

const DEFAULTS = { lists: DEFAULT_LISTS, items: [], active: 'github' };

// All storage writes go through one queue so parallel copy events can't overwrite each other.
let queue = Promise.resolve();
function mutate(fn) {
  const p = queue.then(async () => {
    const s = await chrome.storage.local.get(DEFAULTS);
    purge(s);
    const r = await fn(s);
    await chrome.storage.local.set(s);
    badge(s);
    return r === undefined ? s : r;
  });
  queue = p.catch(e => console.error(e));
  return p;
}

function badge(s, flash) {
  const n = s.items.filter(i => i.list === s.active).length;
  const name = s.lists.find(l => l.id === s.active)?.name ?? '';
  chrome.action.setBadgeBackgroundColor({ color: '#2f7d32' });
  chrome.action.setBadgeText({ text: flash ?? (n ? String(n) : '') });
  chrome.action.setTitle({ title: `Skörd – ${name}: ${n}` });
  if (flash) setTimeout(async () => badge(await chrome.storage.local.get(DEFAULTS)), 1500);
}

async function writeClipboard(text) {
  try {
    await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['CLIPBOARD'], justification: 'Kopiera lista' });
  } catch { /* already open */ }
  return chrome.runtime.sendMessage({ cmd: 'clip', text });
}

async function copyList(id) {
  const n = await mutate(async s => {
    const text = build(s, id);
    if (!text) return 0;
    const n = s.items.filter(i => i.list === id).length;
    await writeClipboard(text);
    if (s.lists.find(l => l.id === id).clearAfterCopy) s.items = s.items.filter(i => i.list !== id);
    return n;
  });
  badge(await chrome.storage.local.get(DEFAULTS), n ? '✓' : '0');
  return n;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'skord', title: 'Skörda', contexts: ['link', 'page', 'selection'] });
});

chrome.contextMenus.onClicked.addListener(info => mutate(s => {
  if (info.linkUrl) addUrl(s, info.linkUrl);
  else if (info.selectionText) addText(s, info.selectionText);
  else addUrl(s, info.pageUrl);
}));

chrome.commands.onCommand.addListener(async cmd => {
  if (cmd === 'add-tabs') {
    const tabs = await chrome.tabs.query({ highlighted: true, currentWindow: true });
    mutate(s => { tabs.forEach(t => addUrl(s, t.url)); });
  }
  if (cmd === 'copy-active') {
    const { active } = await chrome.storage.local.get(DEFAULTS);
    copyList(active);
  }
});

const handlers = {
  state: () => {},
  add: (s, m) => addText(s, m.text),
  del: (s, m) => { s.items = s.items.filter(i => !(i.list === m.list && i.text === m.text)); },
  clear: (s, m) => { s.items = s.items.filter(i => i.list !== m.list); },
  active: (s, m) => { s.active = m.list; },
  lists: (s, m) => { s.lists = m.lists; },
};

chrome.runtime.onMessage.addListener((m, _, send) => {
  if (m.cmd === 'copy') { copyList(m.list).then(send); return true; }
  const h = handlers[m.cmd];
  if (!h) return; // 'clip' is for offscreen.js
  mutate(s => { h(s, m); return s; }).then(send);
  return true;
});

chrome.alarms.create('purge', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => mutate(() => {}));
