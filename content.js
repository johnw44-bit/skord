// Catches Ctrl+C on web pages (not the address bar — use Ctrl+S for that).
document.addEventListener('copy', () => {
  const el = document.activeElement;
  let t = String(getSelection());
  if (!t && el && typeof el.selectionStart === 'number') t = el.value.slice(el.selectionStart, el.selectionEnd);
  if (!t.trim()) return;
  try { chrome.runtime.sendMessage({ cmd: 'add', text: t }).catch(() => {}); } catch { /* extension reloaded */ }
}, true);
