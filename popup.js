const $ = s => document.querySelector(s);
const send = m => chrome.runtime.sendMessage(m);
let st;

async function refresh(m = { cmd: 'state' }) {
  st = await send(m);
  render();
}

function render() {
  const cur = st.lists.find(l => l.id === st.active) ?? st.lists[0];
  const items = st.items.filter(i => i.list === cur.id);

  $('#tabs').replaceChildren(...st.lists.map(l => {
    const b = document.createElement('button');
    b.textContent = `${l.name} ${st.items.filter(i => i.list === l.id).length}`;
    b.className = l.id === cur.id ? 'on' : '';
    b.onclick = () => refresh({ cmd: 'active', list: l.id });
    return b;
  }));

  $('#items').replaceChildren(...items.slice().reverse().map(i => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    const x = document.createElement('button');
    span.textContent = span.title = i.text;
    x.textContent = '×';
    x.onclick = () => refresh({ cmd: 'del', list: i.list, text: i.text });
    li.append(span, x);
    return li;
  }));
  if (!items.length) $('#items').innerHTML = '<li class="empty">Tomt. Ctrl+S eller Ctrl+C på en sida.</li>';

  $('#tpl').value = cur.template;
  $('#tpl').onchange = () => { cur.template = $('#tpl').value; refresh({ cmd: 'lists', lists: st.lists }); };
  $('#copy').textContent = `Kopiera ${items.length} till Claude`;
  $('#copy').disabled = !items.length;
  $('#copy').onclick = async () => { await send({ cmd: 'copy', list: cur.id }); window.close(); };
  $('#clear').onclick = () => refresh({ cmd: 'clear', list: cur.id });
  if (!$('details').open) $('#json').value = JSON.stringify(st.lists, null, 2);
}

$('#save').onclick = () => {
  try {
    const lists = JSON.parse($('#json').value);
    if (!Array.isArray(lists) || !['ovrigt', 'klipp'].every(id => lists.some(l => l.id === id)))
      throw new Error('måste vara en array med listorna "ovrigt" och "klipp"');
    $('#err').textContent = '';
    refresh({ cmd: 'lists', lists });
  } catch (e) { $('#err').textContent = e.message; }
};

refresh();
