# Architecture

## Goals

- Practice HTML/CSS/JS and Python in the browser with zero setup.
- Static hosting only — deployable free to Netlify/Vercel/GitHub Pages with no config.
- Installable and usable offline.
- Readable in light and dark mode on a phone or a desktop.

## Non-goals

These are deliberate. Don't "fix" them without a reason written down here.

- **No answer checking, no stored solutions, no scoring.** The learner compares their output to the expected output. See [CHALLENGES.md](CHALLENGES.md).
- **No accounts, no backend, no database.** Work is kept in `localStorage`.
- **No build step, no npm, no bundler.** Libraries come from a CDN via `<script>`.

## File map

```
index.html             app shell: header, three panels, CDN script tags
styles.css             tokens, light/dark, responsive grid
app.js                 everything behavioural
challenges.js          const CHALLENGES = [...]  (content only)
py-worker.js           Pyodide, off the main thread
manifest.webmanifest   PWA metadata
sw.js                  offline cache
icon.svg               app icon (source)
icon-192.png           app icon, rendered from icon.svg
icon-512.png           app icon, rendered from icon.svg
docs/                  this folder
```

`challenges.js` is a plain script assigning a global, not JSON fetched at
runtime. That means the app also works when opened as a `file://` URL (no CORS,
no fetch), and adding a challenge is a text edit with no tooling.

## Data flow

```
CHALLENGES ──> challenge <select> ──> loadChallenge(id)
                                        │
                        ┌───────────────┴───────────────┐
                        v                               v
              #challenge panel                   CodeMirror docs
          (question, expected output)        (starter code, or the saved
                                              version from localStorage)
                                                        │
                                                   Run (⌘/Ctrl+Enter)
                                                        │
                        ┌───────────────────────────────┴──────────┐
                        v                                          v
                 lang === 'web'                            lang === 'python'
         iframe.srcdoc = style+html+hook+js          await ensurePyodide()
                        │                            runPythonAsync(code)
         iframe console/onerror                                   │
           ──postMessage──> #term            setStdout/setStderr ──> #term
```

### Web run

`Run` assembles a document string and assigns it to `iframe.srcdoc`. Assigning
`srcdoc` reloads the frame, so each run starts from a clean global scope — no
teardown code needed.

The iframe is `sandbox="allow-scripts allow-forms allow-modals allow-popups"`
**without** `allow-same-origin`. It is therefore a unique opaque origin that
cannot touch the parent document, `localStorage`, or the service worker. The
only channel out is `postMessage`.

`allow-forms` is not optional: without it the HTML form submission algorithm
bails out *before* firing the `submit` event, so a form-based app (a chat box, a
sign-up form, a search field) does nothing at all when you press the button, with
no error anywhere. `allow-modals` lets `alert`/`confirm`/`prompt` work, which
beginners use constantly.

A small hook is prepended to the user's JS inside the frame: it wraps
`console.log/info/warn/error`, `window.onerror` and `unhandledrejection`, and
posts them to the parent, which appends them to the terminal. Without this,
errors in a sandboxed frame would be invisible.

`app.js` checks `event.source === iframe.contentWindow` before trusting a
message, so other frames or extensions can't write into the terminal.

The output panel is a two-tab view — **Preview** and **Terminal** — stacked in
one full-height grid cell, with `body[data-out]` deciding which shows. A fixed
split wasted most of the column on whichever half was empty. Rules:

- A challenge starts on **Terminal** (which carries the "press Run" hint), so no one sees an empty white iframe.
- A web run switches to **Preview**.
- Output arriving while Preview is showing lights a dot on the Terminal tab.
- An **uncaught** error switches to Terminal by itself, so a broken page is never silently broken. The hook sends `level: "fatal"` for `window.onerror` and `unhandledrejection`, as distinct from a deliberate `console.error`.
- A Python challenge hides the Preview tab entirely.

### Python run

Python runs in `py-worker.js`, a classic Web Worker that `importScripts` Pyodide
from the CDN on first use. The main thread only sends code and receives output,
so a `while True:` in a learner's program freezes nothing, output keeps
streaming, and **Stop** (`worker.terminate()`) ends it outright.

- **stdout/stderr** are batched in the worker and flushed at most every 50ms. A
  runaway print loop blocks the worker, so its timers never fire — the flush is
  therefore triggered by a `Date.now()` check inside the write callback, not by a
  timer. Each flush carries at most 200 lines; anything faster than that is
  dropped like terminal scrollback, and the page prints `… N lines dropped`.
  Without that cap, a tight print loop delivers one message per line and buries
  the main thread even though Python is in a worker.
- **The terminal keeps at most `TERM_MAX` (5000) lines**, dropping the oldest, so
  the DOM cannot grow without bound.
- **stdin** comes from the "Program input" textarea, consumed one line per
  `input()` call. Past the last line the handler returns `null`, which Pyodide
  treats as EOF, so `input()` raises `EOFError` exactly as CPython would, and the
  page adds a hint pointing at the box. The box is hidden until the code actually
  matches `/\binput\s*\(/`.
- `loadPackagesFromImports(code)` runs before the code, so `import numpy` (or
  pandas, sympy…) pulls the package from the Pyodide distribution automatically.
- Terminating the worker throws away the loaded interpreter, so the run after a
  Stop boots Pyodide again — from the HTTP cache, so it is quick.
- A worker cannot be created from a `file://` page, so Python needs a served
  origin. The app says so in the terminal instead of failing silently.

## Decisions

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Python runtime | **Pyodide 0.26.4** — real CPython 3.12, maintained, correct semantics | **Skulpt**: ~1 MB and instant, but a stale Python 2/3 subset — limited stdlib, f-string and exception gaps would force us to write challenges around its bugs. **Brython**: transpiles to JS, also diverges from CPython. A 10 MB one-time cached download buys correctness |
| `input()` | **A "Program input" textarea**, read one line per call | **`window.prompt()`**: impossible from a worker, and one dialog per call is miserable past the second one. **A typed terminal line**: needs `SharedArrayBuffer`/`Atomics` for blocking reads, which needs COOP/COEP response headers — impossible on plain static hosting |
| Editor | **CodeMirror 5.65.16** from cdnjs, drop-in `<script>` | **CodeMirror 6**: better, but ESM-only and expects a bundler. **Monaco**: ~5 MB and a loader shim. **Plain `<textarea>`**: zero deps but no highlighting or line numbers, a real downgrade for the core activity |
| Challenge data | **`challenges.js` global** | **`challenges.json` + fetch**: breaks on `file://` and adds a request and a loading state for static content |
| Python sandbox | **Web Worker** — an infinite loop cannot freeze the page, and Stop can kill it | **Main thread**: simpler and allows a blocking `prompt()` for `input()`, but one `while True:` locks the tab with no way out but closing it. That is the single worst failure mode in a learning app |
| Fonts | **System stacks** | **Google Fonts**: a render-blocking third-party request that also breaks the offline story, for a font nobody asked for |
| Download | **Single self-contained file** via `Blob` | **JSZip**: a dependency so a 3-file project can arrive as 3 files instead of 1 |
| Deploy config | **None** | `vercel.json` / `netlify.toml`: both platforms serve a static root correctly by default |

## Degradations

Two failure modes are handled rather than left to crash:

- **CodeMirror missing** (CDN blocked, or a first load with no network) — `app.js` checks `window.CodeMirror` and otherwise drives the raw `<textarea>` through the same small adapter (`getValue`/`setValue`/`setTheme`/`refresh`/`onChange`/`focus`). Everything except highlighting keeps working.
- **No `localStorage`** — every access goes through `try/catch` helpers. The app runs, it just doesn't remember anything.

CodeMirror measures its gutter when it is created, so `refreshEditor()` re-measures
on a file or challenge change, on resize, and when the mobile panel switches
back to the editor. Without it the line numbers sit under the code at narrow widths.

## Layout note

`body` is a flex column, not a grid with three rows. The mobile panel switcher is
`display: none` above 900px, and a `display: none` child takes no grid row — which
pushed `main` into the `auto` row and left the `1fr` row empty at the bottom of
the page. Flex ignores it cleanly.

## PWA and caching

`sw.js`:

- **install** — precache the local shell (`.`, `index.html`, `styles.css`, `app.js`, `challenges.js`, `py-worker.js`, `manifest.webmanifest`, `icon.svg`) and the CodeMirror CDN files.
- **activate** — delete caches whose name isn't the current `CACHE` constant.
- **fetch** — GET only. Cache-first; on a miss, go to the network and store a successful response. Pyodide is therefore cached after its first real use but never eagerly downloaded.

Bump the version in `CACHE` to invalidate everything.

Caveat: cache-first means a deployed update is picked up on the *next* load
after the new service worker activates. For a hand-edited static app that's an
acceptable trade for a simple, genuinely offline shell.

The manifest lists PNG icons at 192 and 512 (plus a maskable 512 and the SVG).
Chrome's installability check wants a raster icon of at least 192px, and
ChromeOS and iOS are happier with PNG than SVG, so the PNGs are the ones that
matter — they are rendered from `icon.svg`, which stays the source of truth.

`app.js` listens for `beforeinstallprompt`, stashes the event and reveals the
header's **Install** button, because the omnibox install icon is easy to miss.
The button hides itself again on `appinstalled`.

## Storage

All access goes through `lsGet`/`lsSet` helpers wrapped in `try/catch` —
Safari private mode throws on access, and the app must render fine with no
storage at all.

| Key | Value |
|---|---|
| `letscode:code:<challengeId>:<file>` | Editor contents. `<file>` is `html`, `css`, `js` or `py` |
| `letscode:lastChallenge` | Challenge id to restore on load |
| `letscode:theme` | `light` or `dark`. Absent means "follow the OS" |
| `letscode:level` | Level filter selection |

Saves are debounced (~400 ms) off CodeMirror's `change` event. **Reset** removes
the keys for the current challenge and restores its starter code, after a
confirm dialog. The terminal's **Clear** button only empties the terminal.

## Responsive behaviour

One breakpoint at `900px`.

- **≥ 900px** — three columns: challenge (340px), editor, output.
- **< 900px** — one column. A segmented control sets `body[data-view]` to `challenge`, `code` or `output`, and CSS shows only the matching panel. The switching is pure CSS; JS only sets the attribute and `aria-pressed`.

See [DESIGN.md](DESIGN.md) for tokens, type and accessibility rules.
