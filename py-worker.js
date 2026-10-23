/* Runs the learner's Python off the main thread, so an infinite loop freezes
   nothing and Stop can terminate it. See docs/ARCHITECTURE.md. */
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let ready = null;
let stdinLines = [];
let stdinAt = 0;

// A runaway print loop blocks this worker, so timers never fire: batch by size
// and by a clock check instead, or the main thread drowns in one message per line.
const PER_FLUSH = 200;   // a terminal can only show so much; the rest is dropped like scrollback
let buf = [];
let dropped = 0;
let lastFlush = 0;

function flush() {
  if (!buf.length && !dropped) return;
  postMessage({ type: 'batch', items: buf, dropped: dropped });
  buf = [];
  dropped = 0;
  lastFlush = Date.now();
}

function emit(type, text) {
  buf.push([type, text]);
  if (buf.length > PER_FLUSH) {
    dropped += buf.length - PER_FLUSH;
    buf.splice(0, buf.length - PER_FLUSH);
  }
  if (Date.now() - lastFlush > 50) flush();
}

function boot() {
  return loadPyodide().then((py) => {
    py.setStdout({ batched: (text) => emit('out', text) });
    py.setStderr({ batched: (text) => emit('err', text) });
    // input() reads the stdin box, one line per call. null past the end means
    // EOF, so an empty box raises EOFError instead of silently handing back "".
    py.setStdin({ stdin: () => (stdinAt < stdinLines.length ? stdinLines[stdinAt++] : null) });
    return py;
  });
}

onmessage = async (e) => {
  const code = e.data.code || '';
  stdinLines = e.data.stdin ? e.data.stdin.replace(/\n$/, '').split('\n') : [];
  stdinAt = 0;

  try {
    ready = ready || boot();
    const py = await ready;
    postMessage({ type: 'ready' });
    // pulls in numpy and friends when the code imports them
    await py.loadPackagesFromImports(code);
    await py.runPythonAsync(code);
  } catch (err) {
    emit('err', (err && err.message) || String(err));
  }
  flush();
  postMessage({ type: 'done' });
};
