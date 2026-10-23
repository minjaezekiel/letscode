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
manifest.webmanifest   PWA metadata
sw.js                  offline cache
icon.svg               app icon
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

The iframe is `sandbox="allow-scripts"` **without** `allow-same-origin`. It is
therefore a unique opaque origin that cannot touch the parent document,
`localStorage`, or the service worker. The only channel out is `postMessage`.

A small hook is prepended to the user's JS inside the frame: it wraps
`console.log/info/warn/error`, `window.onerror` and `unhandledrejection`, and
posts them to the parent, which appends them to the terminal. Without this,
errors in a sandboxed frame would be invisible.

`app.js` checks `event.source === iframe.contentWindow` before trusting a
message, so other frames or extensions can't write into the terminal.

The iframe is hidden (`body[data-ran="no"]`) until the first run of a
challenge, because an empty iframe is a white slab that looks broken in dark
mode. The terminal takes the whole output panel until then.

### Python run

Pyodide is injected on the **first** Python run, not in `index.html`:

```js
let pyPromise;
function ensurePyodide() {
  return pyPromise ??= new Promise((res, rej) => { /* append <script>, then loadPyodide() */ });
}
```

The promise is cached, so the ~10 MB download happens at most once per session,
and never at all for someone who only does web challenges.

- `setStdout` / `setStderr` with `batched:` handlers append to the terminal.
- `setStdin` returns `window.prompt(...)`, so `input()` works.
- `runPythonAsync` is awaited in a `try/catch`; the caught error's message is
  the Python traceback, which is printed to the terminal. A failing program
  must never break the app. `cleanTraceback()` drops Pyodide's own
  `_base.py` frames above the learner's `File "<exec>"` frame, which are noise
  to someone debugging their own code.

Pyodide runs on the **main thread**. An infinite loop in user code freezes the
tab, and the only way out is closing it. The fix is a Web Worker, which costs a
message protocol and loses the simple blocking `prompt()` for `input()` — not
worth it until someone actually complains. Marked in `app.js` with a
`ponytail:` comment naming the upgrade path.

## Decisions

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Python runtime | **Pyodide 0.26.4** — real CPython 3.12, maintained, correct semantics | **Skulpt**: ~1 MB and instant, but a stale Python 2/3 subset — limited stdlib, f-string and exception gaps would force us to write challenges around its bugs. **Brython**: transpiles to JS, also diverges from CPython. A 10 MB one-time cached download buys correctness |
| `input()` | **`window.prompt()`** via `setStdin`, ~5 lines | **Interactive terminal input line**: needs Pyodide in a Worker plus `SharedArrayBuffer`/`Atomics` for blocking reads, which needs COOP/COEP response headers — impossible on plain static hosting and on `file://` |
| Editor | **CodeMirror 5.65.16** from cdnjs, drop-in `<script>` | **CodeMirror 6**: better, but ESM-only and expects a bundler. **Monaco**: ~5 MB and a loader shim. **Plain `<textarea>`**: zero deps but no highlighting or line numbers, a real downgrade for the core activity |
| Challenge data | **`challenges.js` global** | **`challenges.json` + fetch**: breaks on `file://` and adds a request and a loading state for static content |
| Python sandbox | **Main thread** | **Web Worker**: safe from infinite loops, but needs a message protocol and loses blocking `input()` |
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

- **install** — precache the local shell (`.`, `index.html`, `styles.css`, `app.js`, `challenges.js`, `manifest.webmanifest`, `icon.svg`) and the CodeMirror CDN files.
- **activate** — delete caches whose name isn't the current `CACHE` constant.
- **fetch** — GET only. Cache-first; on a miss, go to the network and store a successful response. Pyodide is therefore cached after its first real use but never eagerly downloaded.

Bump the version in `CACHE` to invalidate everything.

Caveat: cache-first means a deployed update is picked up on the *next* load
after the new service worker activates. For a hand-edited static app that's an
acceptable trade for a simple, genuinely offline shell.

The manifest uses a single SVG icon (`purpose: "any maskable"`), which Chromium
and Safari accept for install. If a target browser ever rejects it, add PNG
192×192 and 512×512 beside it.

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
