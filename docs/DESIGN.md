# Design

Everything here is implemented as custom properties in `styles.css`. Use the
tokens; don't write raw hex values in component rules.

## Principles

- **Legible before pretty.** The learner is reading a question and a column of code. Nothing decorative may cost contrast or line length.
- **Two themes, one set of rules.** Every token is defined in both themes, so no component needs a theme-specific override.
- **Web-safe only.** No webfonts, no icon fonts, no images beyond `icon.svg`. Everything renders offline and on first paint.
- **Accessibility is not a later pass.** Labels, focus rings, tap targets and contrast are part of writing the markup.

## Colour tokens

Measured contrast ratios, computed with the WCAG 2.1 formula:

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--bg` | `#ffffff` | `#15181e` | Page background |
| `--surface` | `#f4f6f9` | `#1e222b` | Panels, header, terminal, inputs |
| `--border` | `#d6dbe3` | `#2d323d` | Decorative panel dividers |
| `--border-strong` | `#818a9d` | `#6a7385` | Borders of inputs/buttons (≈3:1, WCAG 1.4.11) |
| `--text` | `#1a1d23` | `#e9ecf1` | Body and code — **16.9:1** / **15.0:1** on `--bg` |
| `--text-muted` | `#596173` | `#a3abbb` | Labels, hints — **6.2:1** / **7.7:1** on `--bg`, 5.7:1 / 6.9:1 on `--surface` |
| `--accent` | `#4f46e5` | `#93a4ff` | Run button, links, focus ring — **6.3:1** / **7.6:1** on `--bg` |
| `--accent-contrast` | `#ffffff` | `#15181e` | Text on `--accent` — **6.3:1** / **7.6:1** |

Level badges — foreground on its own tinted background:

| Level | Light fg / bg | Dark fg / bg | Ratio |
|---|---|---|---|
| Beginner | `#15703f` / `#e7f6ee` | `#4ade80` / `#16281d` | 5.5:1 / 8.9:1 |
| Intermediate | `#92610a` / `#fdf3dc` | `#fbbf24` / `#2b2314` | 4.8:1 / 9.3:1 |
| Master | `#7c3aed` / `#efe9fe` | `#c4b5fd` / `#241f33` | 4.8:1 / 8.6:1 |

Colour is never the only signal: each badge also spells out its level, and
terminal error lines are prefixed as well as coloured.

**Targets:** body text ≥ 4.5:1, large text and UI component borders ≥ 3:1, in
both themes. Re-check any new colour before committing it.

## Theme switching

```css
:root { /* light tokens */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark tokens */ }
}

:root[data-theme="dark"] { /* dark tokens */ }
```

No `data-theme` attribute means "follow the OS". The toggle sets
`data-theme="light"` or `"dark"` on `<html>` and persists it, and the guard on
the media query lets an explicit choice win in either direction. `body` always
sets an explicit `background`, so there is no white flash in dark mode.

`<meta name="color-scheme" content="light dark">` makes form controls and
scrollbars follow the theme for free. The CodeMirror theme is swapped in JS
(`default` ↔ `material-darker`) so the editor never stays light inside a dark app.

## Type

```
--font-ui:   -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas,
             "Liberation Mono", monospace
```

System stacks: no download, no layout shift, native on every platform.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Brand | 18px | 700 | |
| Panel heading | 13px | 600 | uppercase, `letter-spacing: .06em`, `--text-muted` |
| Challenge title | 20px | 650 | |
| Body / question | 16px | 400 | `line-height: 1.6`, `max-width: 62ch` |
| Buttons, selects | 15px | 550 | |
| Code, terminal, expected output | 14px | 400 | `--font-mono`, `line-height: 1.5` |

16px is the floor for body text, and for anything the user can focus on iOS —
smaller triggers Safari's zoom-on-focus.

## Spacing

A 4px scale: `--s1: 4px`, `--s2: 8px`, `--s3: 12px`, `--s4: 16px`, `--s5: 24px`,
`--s6: 32px`. Radii: `--r1: 6px` (inputs, buttons), `--r2: 10px` (panels).
Panels are padded `--s4`; the page keeps a 16px side gutter at every width.

## Interaction

- **Tap targets** — minimum 44×44px below 900px; 32px tall is fine for desktop pointer widths.
- **Focus** — `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` on everything interactive. The default ring is never removed without this replacement.
- **Hover** — background shifts one step only. No transforms, no shadows that move layout.
- **Transitions** — ≤ 120ms on background and border only, all wrapped in `@media (prefers-reduced-motion: reduce) { * { transition: none } }`.
- **Disabled** — `opacity: .55` plus the real `disabled` attribute, so it's exposed to assistive tech and not just dimmed.

## Layout

Breakpoint: **900px**.

```
≥900px   ┌──────────────── header ────────────────┐
         │ challenge 340px │ editor 1fr │ out 1fr │
         └────────────────────────────────────────┘

<900px   header
         [ Challenge | Code | Output ]   segmented control
         one panel, full width
```

Below 900px the segmented control sets `body[data-view="challenge|code|output"]`
and CSS hides the other two panels. The grid rows use `min-height: 0` so the
editor and terminal scroll internally instead of growing the page — nothing
scrolls horizontally at 320px.

## Output panel

Preview and Terminal are tabs, not a split — each gets the panel's full height.
The tabs reuse the editor's file-tab styling, and the Terminal tab carries a
7px accent dot when there is unread output. Tab state lives on `body[data-out]`
so the switching is CSS, and `aria-pressed` tracks it for screen readers.

## Accessibility checklist

Every control has a visible `<label>` or an `aria-label`. The terminal is
`aria-live="polite"` so new output is announced. The segmented control uses real
`<button>`s with `aria-pressed`. The preview `<iframe>` has a `title`. Landmarks:
`<header>`, `<main>`, and each panel is a `<section>` with an accessible name.
Run is reachable by keyboard and by `⌘/Ctrl+Enter`. Headings go `h1` → `h2`
with nothing skipped.
