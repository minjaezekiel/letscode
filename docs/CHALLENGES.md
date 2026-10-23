# Challenges

All content lives in one file: `challenges.js`. It defines a single global:

```js
const CHALLENGES = [ /* ... */ ];
```

No JSON, no fetch, no build step. Add an object, reload the page, done.

## Schema

```js
{
  id:       'py-b-03',          // unique, stable, kebab-case. Storage keys use it
  level:    'beginner',         // 'beginner' | 'intermediate' | 'master'
  lang:     'python',           // 'python' | 'web'
  title:    'Count the vowels', // short, shown in the picker and the panel
  question: 'Given the word ...', // the full brief. Markdown is NOT rendered
  expectedOutput: 'a: 2\ne: 1',   // literal text the learner compares against
  starter: { py: '# your code here\n' }   // python: { py }
                                          // web:    { html, css, js }
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Changing it orphans the learner's saved code for that challenge |
| `level` | yes | Drives the badge and the filter |
| `lang` | yes | `'web'` gives three editor tabs and a live preview; `'python'` gives one tab and the terminal |
| `title` | yes | Keep under ~40 characters so the picker stays readable |
| `question` | yes | Plain text. `\n\n` separates paragraphs |
| `expectedOutput` | yes | Rendered in a `<pre>`, so whitespace is exact |
| `starter` | yes | Keys must match `lang`. May be empty strings, but give the learner a running start |

**There is no `solution` field. Never add one.** Equally: no `tests`, no
`validate`, no `checkOutput`. The app shows the question and the expected
output and stops there — the learner does the comparing. If you want to add
checking, that's a different product; discuss it before writing code.

## Levels

| Level | The learner can already... | So a challenge at this level |
|---|---|---|
| **Beginner** | print, declare variables, write an `if` and a `for`, write basic tags and selectors | Needs one concept and a handful of lines. Give nearly complete starter code |
| **Intermediate** | write functions, handle lists/dicts/arrays/objects, use DOM events, write a loop with state | Composes two or three concepts, 15–40 lines. Starter code sets up the scaffolding only |
| **Master** | reach for recursion, classes, closures, generators, regex, `async`, algorithmic thinking | Needs a chosen approach or a non-obvious insight. Starter code is a signature and a docstring at most |

Keep the counts roughly even across levels, and mix `web` and `python` in each.

## Writing a good challenge

1. **Self-contained.** No links, no "as in the previous challenge". Everything needed is in `question`.
2. **Deterministic output.** No `random`, no `datetime.now()`, no dict-ordering assumptions — the learner has to be able to match `expectedOutput` exactly. Hardcode any input data in the starter code or the question.
3. **Expected output that is actually comparable.** A few short lines. "A red 200×200 box centred on the page" is fine for a `web` challenge, where the preview is visual; a wall of 40 numbers is not comparable by eye in either mode.
4. **Say what to print, literally.** `Total: 42` and `total = 42` are different outputs. If formatting matters, show it in `expectedOutput` and don't also describe it in prose.
5. **One idea per challenge.** Two ideas means two challenges.
6. **Starter code must run as given.** A learner hitting Run before typing should get output or an empty preview, never a syntax error.

### `input()` in Python challenges

`input()` reads from the **Program input** box, which appears under the terminal
as soon as the code contains `input(`. One line in the box per `input()` call, in
order. If the box runs out of lines the program raises `EOFError`, same as
CPython with no stdin.

So a challenge using `input()` must say in `question` exactly which lines to put
in the box, and `expectedOutput` must match that input. Prefer hardcoded data
when the exercise isn't about reading input.

### Web challenges

The preview is a sandboxed iframe with no `allow-same-origin`, so these do
**not** work: `localStorage`, `sessionStorage`, cookies, `fetch` to a same-origin
path, and access to `window.parent`. Forms, `alert`/`confirm`/`prompt` and
`window.open` do work. `console.log` and uncaught errors are forwarded to the
terminal.

Don't reference external images or CDNs — the challenge should work offline.

## Worked example

Adding an intermediate Python challenge:

```js
{
  id: 'py-i-04',
  level: 'intermediate',
  lang: 'python',
  title: 'Word frequency, top 3',
  question:
    'The list WORDS below holds words from a sentence.\n\n' +
    'Count how many times each word appears, then print the three most ' +
    'common as "word: count", one per line, highest count first. Where two ' +
    'words have the same count, print the one that comes first ' +
    'alphabetically.',
  expectedOutput: 'the: 4\ndog: 2\nfox: 2',
  starter: {
    py: 'WORDS = ["the", "fox", "the", "dog", "the", "fox", "dog", "the"]\n\n'
      + '# your code here\n'
  }
}
```

Note what it does: the data is in the starter so the output is deterministic,
the tie-break rule is stated because otherwise the output is ambiguous, the
output format is shown rather than only described, and no solution is given.

Append it to `CHALLENGES`, reload, and pick it from the dropdown. There is
nothing to register and no index to update.
