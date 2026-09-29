// Pure logic, no chrome APIs — tested by test.mjs.

export const DEFAULT_LISTS = [
  {
    id: 'github', name: 'GitHub', match: '^https?://github\\.com/', ttlMin: 60, clearAfterCopy: true,
    template: 'Researcha varje GitHub-repo nedan om det är något vi kan använda eller låna:',
  },
  {
    id: 'ovrigt', name: 'Övrigt', match: '', ttlMin: 60, clearAfterCopy: true,
    template: 'Researcha varje länk nedan. För varje: vad det är, huvudpoänger, källans trovärdighet och varför det är relevant. Avsluta med en sammanfattning av gemensamma teman.',
  },
  { id: 'klipp', name: 'Klipp', match: '', ttlMin: 60, clearAfterCopy: true, template: '' },
];

const TRACKING = /^(utm_\w+|fbclid|gclid|mc_eid|igshid|si|ref_src)$/;
const GH_RESERVED = new Set(['orgs', 'topics', 'settings', 'search', 'marketplace', 'features', 'sponsors',
  'collections', 'trending', 'notifications', 'login', 'apps', 'explore', 'users', 'enterprise', 'pricing',
  'about', 'site', 'security', 'new', 'codespaces', 'pulls', 'issues']);

function trimTail(u) {
  u = u.replace(/[.,;:!?'"]+$/, '');
  for (const [o, c] of [['(', ')'], ['[', ']']])
    while (u.endsWith(c) && u.split(o).length < u.split(c).length) u = u.slice(0, -1).replace(/[.,;:!?'"]+$/, '');
  return u;
}

export const extractUrls = text => (text.match(/https?:\/\/[^\s<>"'`]+/g) || []).map(trimTail);

export function normalize(raw) {
  let url;
  try { url = new URL(raw); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  for (const k of [...url.searchParams.keys()]) if (TRACKING.test(k)) url.searchParams.delete(k);
  url.hostname = url.hostname.replace(/^www\.github\.com$/, 'github.com');
  if (url.hostname === 'github.com') {
    // ponytail: always cut to repo root; add a per-list flag if you want deep links kept
    const [owner, repo] = url.pathname.split('/').filter(Boolean);
    if (owner && repo && !GH_RESERVED.has(owner)) return `https://github.com/${owner}/${repo.replace(/\.git$/, '')}`;
  }
  return url.href;
}

export function route(lists, url) {
  const hit = lists.find(l => {
    try { return l.match && new RegExp(l.match, 'i').test(url); } catch { return false; }
  });
  return hit ? hit.id : 'ovrigt';
}

export function purge(s, now = Date.now()) {
  s.items = s.items.filter(i => {
    const l = s.lists.find(l => l.id === i.list);
    return l && (!l.ttlMin || now - i.ts < l.ttlMin * 60000);
  });
}

export function put(s, list, text, now = Date.now()) {
  s.items = s.items.filter(i => !(i.list === list && i.text === text));
  s.items.push({ list, text, ts: now });
  if (list !== 'klipp') s.active = list; // copying page text must not steal Ctrl+Q from the link list
}

export function addUrl(s, raw) {
  const u = normalize(raw);
  if (u) put(s, route(s.lists, u), u);
  return !!u;
}

export function addText(s, text) {
  const urls = extractUrls(text).filter(u => addUrl(s, u));
  if (!urls.length && text.trim()) put(s, 'klipp', text.trim());
}

export function build(s, id) {
  const l = s.lists.find(l => l.id === id);
  const its = s.items.filter(i => i.list === id);
  if (!l || !its.length) return '';
  const body = its.map(i => i.text).join('\n');
  return l.template.trim() ? `${l.template.trim()}\n\n${body}` : body;
}
