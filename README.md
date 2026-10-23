# letscode

A browser-based coding practice app. Pick a challenge by skill level, write
HTML/CSS/JS or Python in the editor, hit **Run**, and compare what you get to
the expected output.

No backend. No build step. No npm. Just static files.

- **Web challenges** render in a sandboxed live preview; `console.log` goes to the terminal.
- **Python challenges** run real CPython 3.12 compiled to WebAssembly ([Pyodide](https://pyodide.org)), entirely in the browser.
- **Installable** — it's a PWA, so you can install it from the browser and use it offline.
- **Light and dark mode**, following your system setting, with a manual toggle.
- **Download** your work as a single runnable file.

## The no-solution rule

Every challenge shows a **question** and an **expected output**. That's it.

There are no stored solutions and no automatic answer checking — on purpose.
You read the question, write code, run it, and compare your output to the
expected output yourself. That comparison is the exercise.

Please don't add a `solution` field or an output-diffing "Check" button. See
[docs/CHALLENGES.md](docs/CHALLENGES.md).

## Run it locally

A service worker and `fetch` need a real origin, so open it over HTTP rather
than double-clicking the file:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `php -S localhost:8000`, VS Code Live
Server). `localhost` counts as a secure origin, so install and offline work
there too.

## Install as an app

Load it over HTTPS (or `localhost`), then:

- **Chrome / Edge** — the install icon in the address bar, or ⋮ → *Install letscode*
- **Safari (macOS / iOS)** — Share → *Add to Dock* / *Add to Home Screen*
- **Android Chrome** — ⋮ → *Add to Home screen*

The app shell is cached on first load. Python needs one online run to download
Pyodide (~10 MB), after which it is cached and works offline too.

## Deploy for free

The repo root *is* the site. No build command, no config file.

**Netlify** — drag the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop). Or from the CLI:

```sh
npx netlify deploy --dir . --prod
```

Connecting a Git repo instead: build command empty, publish directory `.`.

**Vercel**:

```sh
npx vercel --prod
```

Framework preset *Other*, build command empty, output directory `.`.

**GitHub Pages** — push, then Settings → Pages → deploy from branch, root.

All three serve HTTPS, which the PWA install and the service worker require.
No `vercel.json` or `netlify.toml` is needed; don't add one.

## Where things live

| File | What it is |
|---|---|
| `index.html` | App shell and the three panels |
| `styles.css` | Design tokens, light/dark themes, responsive grid |
| `app.js` | State, editors, Run, preview, terminal, download, storage |
| `challenges.js` | All challenge content — **edit this to add challenges** |
| `manifest.webmanifest`, `sw.js`, `icon.svg` | The installable/offline bits |

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how it works and why it's built this way
- [docs/DESIGN.md](docs/DESIGN.md) — colours, fonts, spacing, accessibility rules
- [docs/CHALLENGES.md](docs/CHALLENGES.md) — challenge schema and how to write one
