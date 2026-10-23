# letscode

A browser-based coding practice app. Pick a challenge by skill level, write
HTML/CSS/JS or Python in the editor, hit **Run**, and compare what you get to
the expected output.

No backend. No build step. No npm. Just static files.

- **Web challenges** render in a sandboxed live preview; `console.log` goes to the terminal.
- **Python challenges** run real CPython 3.12 compiled to WebAssembly ([Pyodide](https://pyodide.org)), entirely in the browser, in a worker — so an infinite loop can't freeze the page and **Stop** always ends it.
- `input()` reads from a **Program input** box that appears when your code needs it, and `import numpy` (or pandas, sympy…) just works.
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

Python runs in a Web Worker, which a `file://` page is not allowed to create, so
open it over HTTP rather than double-clicking the file (the HTML/CSS/JS side
works either way):

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `php -S localhost:8000`, VS Code Live
Server). `localhost` counts as a secure origin, so install and offline work
there too.

## Install it as an app

letscode is a PWA. Installing needs **HTTPS** (or `localhost`) — a `file://`
copy can't be installed, and can't run Python either. So put it on a host first
(see below), then install from that URL.

Once the page is open, letscode shows an **Install** button in its header as
soon as the browser says it is installable. Failing that, use the browser's own
control:

- **ChromeOS / Chrome / Edge** — the install icon at the right of the address bar, or ⋮ → *Cast, save and share* → *Install page as app*
- **Safari (macOS / iOS)** — Share → *Add to Dock* / *Add to Home Screen*
- **Android Chrome** — ⋮ → *Add to Home screen*

### For a class of Chromebooks

1. Deploy once (below) and give students the one HTTPS URL.
2. Each student opens it and clicks **Install**. letscode lands in the ChromeOS
   launcher and opens in its own window, no tabs, no address bar.
3. Have them run one Python challenge while still online. That downloads
   Pyodide (~10 MB) once; the service worker caches it, and Python keeps working
   offline afterwards. The HTML/CSS/JS side is offline from the first load.
4. Nothing is installed on the machine beyond the browser's own app entry, and
   no student work leaves the device — code is kept in that browser's
   `localStorage`.

Admins can also push it to managed Chromebooks as a web app via the Google Admin
console (Devices → Chrome → Apps & extensions → *Add by URL*), which installs it
for every student without them clicking anything.

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
