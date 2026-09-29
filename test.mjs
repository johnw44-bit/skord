// node test.mjs
import assert from 'node:assert';
import { DEFAULT_LISTS, extractUrls, normalize, addText, addUrl, build, purge } from './lib.js';

assert.deepEqual(extractUrls('se (https://en.wikipedia.org/wiki/Foo_(bar)) och https://x.se/a.'),
  ['https://en.wikipedia.org/wiki/Foo_(bar)', 'https://x.se/a']);
assert.equal(normalize('https://www.github.com/a/b.git/blob/main/x?utm_source=t'), 'https://github.com/a/b');
assert.equal(normalize('https://github.com/topics/rust'), 'https://github.com/topics/rust');
assert.equal(normalize('https://x.se/?utm_medium=a&q=1&fbclid=z'), 'https://x.se/?q=1');
assert.equal(normalize('brave://newtab'), null);

const s = { lists: structuredClone(DEFAULT_LISTS), items: [], active: 'github' };
addText(s, 'kolla https://github.com/a/b/issues/3 och https://example.com/x');
addUrl(s, 'https://github.com/a/b'); // dublett
addText(s, 'bara text');
assert.deepEqual(s.items.map(i => [i.list, i.text]), [
  ['ovrigt', 'https://example.com/x'], ['github', 'https://github.com/a/b'], ['klipp', 'bara text']]);
assert.equal(s.active, 'github'); // klipp stjäl inte aktiv lista
assert.match(build(s, 'github'), /^Researcha varje GitHub-repo.*\n\nhttps:\/\/github\.com\/a\/b$/s);

purge(s, Date.now() + 61 * 60000);
assert.equal(s.items.length, 0);
console.log('ok');
