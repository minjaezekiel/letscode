/* letscode — editors, Run, preview, terminal, download, storage.
   See docs/ARCHITECTURE.md for the data flow. */
'use strict';

const FILES = { web: ['html', 'css', 'js'], python: ['py'] };
const MODES = { html: 'htmlmixed', css: 'css', js: 'javascript', py: 'python' };
const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';

const $ = (id) => document.getElementById(id);

/* ---------- storage (Safari private mode throws on access) ---------- */

const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* no storage, no problem */ } };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

const codeKey = (id, f) => 'letscode:code:' + id + ':' + f;

/* ---------- terminal ---------- */

const termEl = $('term');

function term(text, cls) {
  const body = String(text).replace(/\n$/, '');
  const prefix = cls === 'err' ? '✗ ' : cls === 'warn' ? '! ' : '';
  for (const raw of body.split('\n')) {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = prefix + raw;
    termEl.appendChild(line);
  }
  termEl.scrollTop = termEl.scrollHeight;
}

const clearTerm = () => { termEl.textContent = ''; };

/* ---------- editor ---------- */

let ed;

if (window.CodeMirror) {
  const cm = CodeMirror.fromTextArea($('code'), {
    lineNumbers: true,
    lineWrapping: true,
    indentUnit: 2,
    tabSize: 2,
    autoCloseBrackets: true,
    matchBrackets: true,
    extraKeys: {
      'Cmd-Enter': run,
      'Ctrl-Enter': run,
      Tab: (c) => c.somethingSelected() ? c.indentSelection('add') : c.replaceSelection('  ')
    }
  });
  ed = {
    getValue: () => cm.getValue(),
    setValue: (v, mode) => { cm.setOption('mode', mode); cm.setValue(v); cm.clearHistory(); },
    setTheme: (dark) => cm.setOption('theme', dark ? 'material-darker' : 'default'),
    refresh: () => cm.refresh(),
    onChange: (fn) => cm.on('change', fn),
    focus: () => cm.focus()
  };
} else {
  // ponytail: CDN blocked or first load offline. Plain textarea keeps the app usable.
  const ta = $('code');
  ta.classList.add('fallback');
  ta.spellcheck = false;
  ed = {
    getValue: () => ta.value,
    setValue: (v) => { ta.value = v; },
    setTheme: () => {},
    refresh: () => {},
    onChange: (fn) => ta.addEventListener('input', fn),
    focus: () => ta.focus()
  };
}

const refreshEditor = () => requestAnimationFrame(() => ed.refresh());

/* ---------- state ---------- */

let current = null;        // the active challenge
let file = 'html';         // the active file key
const edited = new Map();  // `id:file` -> unsaved-to-disk editor text, kept across tab switches

function codeOf(ch, f) {
  const key = codeKey(ch.id, f);
  if (edited.has(key)) return edited.get(key);
  const saved = lsGet(key);
  if (saved !== null) return saved;
  return (ch.starter && ch.starter[f]) || '';
}

function stash() {
  if (current) edited.set(codeKey(current.id, file), ed.getValue());
}

let saveTimer;
ed.onChange(() => {
  stash();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (current) lsSet(codeKey(current.id, file), ed.getValue());
  }, 400);
});

/* ---------- rendering ---------- */

function renderChallenge(ch) {
  $('ch-title').textContent = ch.title;

  const badge = $('badge');
  badge.textContent = ch.level;
  badge.dataset.level = ch.level;

  const q = $('ch-question');
  q.textContent = '';
  for (const para of String(ch.question).split(/\n\n+/)) {
    const p = document.createElement('p');
    p.textContent = para;
    q.appendChild(p);
  }

  $('ch-expected').textContent = ch.expectedOutput;
}

function renderTabs() {
  const box = $('tabs');
  box.textContent = '';
  for (const f of FILES[current.lang]) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = f;
    b.setAttribute('aria-pressed', String(f === file));
    b.addEventListener('click', () => selectFile(f));
    box.appendChild(b);
  }
}

function selectFile(f) {
  if (current && f === file) return;
  stash();
  file = f;
  ed.setValue(codeOf(current, f), MODES[f]);
  renderTabs();
  refreshEditor();
  ed.focus();
}

function renderPicker() {
  const level = $('level').value;
  const sel = $('pick');
  sel.textContent = '';
  for (const ch of CHALLENGES) {
    if (level !== 'all' && ch.level !== level) continue;
    const o = document.createElement('option');
    o.value = ch.id;
    o.textContent = (ch.lang === 'python' ? 'Python · ' : 'Web · ') + ch.title;
    sel.appendChild(o);
  }
  return sel.options.length;
}

function load(id) {
  const ch = CHALLENGES.find((c) => c.id === id) || CHALLENGES[0];
  current = ch;
  file = FILES[ch.lang][0];

  document.body.dataset.lang = ch.lang;
  $('pick').value = ch.id;
  lsSet('letscode:lastChallenge', ch.id);

  renderChallenge(ch);
  ed.setValue(codeOf(ch, file), MODES[file]);
  renderTabs();
  refreshEditor();

  clearTerm();
  $('preview').removeAttribute('srcdoc');
  document.body.dataset.ran = 'no';
  term(ch.lang === 'python'
    ? 'Press Run to execute your Python.'
    : 'Press Run to render your page. console.log output appears here.', 'muted');
}

/* ---------- run: web ---------- */

// Forwards console and errors out of the sandboxed frame, which otherwise swallows them.
const HOOK = '<script>(function(){' +
  'var send=function(level,args){try{parent.postMessage({__letscode:1,level:level,text:' +
    'Array.prototype.map.call(args,function(a){' +
      'if(a instanceof Error)return a.message;' +
      'if(typeof a==="string")return a;' +
      'try{return JSON.stringify(a)}catch(e){return String(a)}' +
    '}).join(" ")},"*")}catch(e){}};' +
  '["log","info","debug","warn","error"].forEach(function(m){' +
    'var o=console[m]?console[m].bind(console):function(){};' +
    'console[m]=function(){send(m==="warn"||m==="error"?m:"log",arguments);o.apply(null,arguments)}});' +
  'window.onerror=function(m,s,l){send("error",[m+(l?" (line "+l+")":"")]);};' +
  'window.addEventListener("unhandledrejection",function(e){' +
    'send("error",["Unhandled promise rejection: "+((e.reason&&e.reason.message)||e.reason)])});' +
  '})();<\/script>';

function runWeb() {
  const get = (f) => (f === file ? ed.getValue() : codeOf(current, f));
  const css = get('css').replace(/<\/style/gi, '<\\/style');
  const js = get('js').replace(/<\/script/gi, '<\\/script');

  clearTerm();
  document.body.dataset.ran = 'yes';
  $('preview').srcdoc =
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>' + css + '</style></head><body>' +
    get('html') + HOOK + '<script>' + js + '<\/script></body></html>';
}

window.addEventListener('message', (e) => {
  if (e.source !== $('preview').contentWindow) return;
  const d = e.data;
  if (!d || d.__letscode !== 1) return;
  term(d.text, d.level === 'error' ? 'err' : d.level === 'warn' ? 'warn' : '');
});

/* ---------- run: python ---------- */

// ponytail: Pyodide runs on the main thread, so an infinite loop in user code
// freezes the tab. Move it into a Web Worker if that becomes a real complaint
// (costs a message protocol and blocking input() via SharedArrayBuffer).
let pyPromise = null;
let pyReady = false;

function ensurePyodide() {
  if (pyPromise) return pyPromise;
  pyPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PYODIDE_URL;
    s.onload = () => resolve(loadPyodide());
    s.onerror = () => reject(new Error(
      'Could not load Python. The first Python run needs to be online — reconnect and try again.'));
    document.head.appendChild(s);
  }).then((py) => {
    py.setStdout({ batched: (t) => term(t) });
    py.setStderr({ batched: (t) => term(t, 'err') });
    py.setStdin({ stdin: () => window.prompt('Python input():') || '' });
    pyReady = true;
    return py;
  }).catch((err) => {
    pyPromise = null;              // let the next Run retry
    throw err;
  });
  return pyPromise;
}

// Pyodide tracebacks start with its own _base.py frames, which mean nothing to
// a learner. Keep the header and everything from the user's own frame down.
function cleanTraceback(message) {
  const lines = String(message).split('\n');
  const start = lines.findIndex((l) => l.includes('File "<exec>"'));
  if (start === -1) return message;
  return ['Traceback (most recent call last):'].concat(lines.slice(start)).join('\n');
}

async function runPython() {
  const btn = $('run');
  btn.disabled = true;
  clearTerm();
  if (!pyReady) term('Loading Python… the first run downloads about 10 MB, then it is cached.', 'muted');
  try {
    const py = await ensurePyodide();
    clearTerm();
    await py.runPythonAsync(ed.getValue());
  } catch (err) {
    term(cleanTraceback((err && err.message) || String(err)), 'err');
  } finally {
    btn.disabled = false;
  }
}

function run() {
  if (!current) return;
  stash();
  if (current.lang === 'python') runPython();
  else runWeb();
}

/* ---------- download ---------- */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function saveFile(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  // Firefox cancels the download if the URL is revoked in the same tick.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ponytail: one self-contained file, no JSZip. Add it only if someone actually
// wants separate css/js files in a zip.
function download() {
  stash();
  const get = (f) => codeOf(current, f);
  if (current.lang === 'python') {
    saveFile(current.id + '.py', get('py'), 'text/x-python;charset=utf-8');
    return;
  }
  saveFile(current.id + '.html',
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(current.title) + '</title>\n<style>\n' + get('css') +
    '\n</style>\n</head>\n<body>\n' + get('html') + '\n<script>\n' +
    get('js').replace(/<\/script/gi, '<\\/script') + '\n<\/script>\n</body>\n</html>\n',
    'text/html;charset=utf-8');
}

/* ---------- theme ---------- */

const osDark = window.matchMedia('(prefers-color-scheme: dark)');
const isDark = () => { const t = lsGet('letscode:theme'); return t ? t === 'dark' : osDark.matches; };

function applyTheme() {
  const stored = lsGet('letscode:theme');
  if (stored) document.documentElement.dataset.theme = stored;
  else delete document.documentElement.dataset.theme;

  const dark = isDark();
  ed.setTheme(dark);
  $('theme-glyph').textContent = dark ? '☀' : '☽';
  $('theme').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}

osDark.addEventListener('change', () => { if (!lsGet('letscode:theme')) applyTheme(); });

/* ---------- wiring ---------- */

$('run').addEventListener('click', run);
$('download').addEventListener('click', download);
$('clear').addEventListener('click', clearTerm);

$('theme').addEventListener('click', () => {
  lsSet('letscode:theme', isDark() ? 'light' : 'dark');
  applyTheme();
});

$('reset').addEventListener('click', () => {
  if (!current) return;
  if (!window.confirm('Replace your code with the starter code for this challenge?')) return;
  for (const f of FILES[current.lang]) {
    lsDel(codeKey(current.id, f));
    edited.delete(codeKey(current.id, f));
  }
  load(current.id);
});

$('level').addEventListener('change', () => {
  lsSet('letscode:level', $('level').value);
  if (renderPicker()) load($('pick').value);
});

$('pick').addEventListener('change', () => load($('pick').value));

for (const b of document.querySelectorAll('.views button')) {
  b.addEventListener('click', () => {
    document.body.dataset.view = b.dataset.view;
    refreshEditor();
    for (const o of document.querySelectorAll('.views button')) {
      o.setAttribute('aria-pressed', String(o === b));
    }
  });
}

window.addEventListener('resize', refreshEditor);

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

/* ---------- start ---------- */

applyTheme();
document.body.dataset.view = 'code';

if (typeof CHALLENGES === 'undefined' || !CHALLENGES.length) {
  term('No challenges found. Check that challenges.js loaded.', 'err');
} else {
  $('level').value = lsGet('letscode:level') || 'all';
  if (!renderPicker()) { $('level').value = 'all'; renderPicker(); }
  const last = lsGet('letscode:lastChallenge');
  load($('pick').querySelector('option[value="' + last + '"]') ? last : $('pick').value);
}
