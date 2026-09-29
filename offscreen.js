// Service workers have no clipboard; this hidden page does the copy.
chrome.runtime.onMessage.addListener((m, _, send) => {
  if (m.cmd !== 'clip') return;
  const t = document.querySelector('textarea');
  t.value = m.text;
  t.select();
  send(document.execCommand('copy'));
});
