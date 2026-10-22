# Design guidelines

This document is the visual source of truth for **VerbaNode**, a local writing workspace for commit commands, pull request summaries, implementation prompts, and git command lists. The page should read like a sheet of paper on a quiet desk. Structure and the webhook live in [architecture_guidelines.md](architecture_guidelines.md).

Styling is vanilla CSS. Tokens and the reset live in `src/styles/` once the first feature is built. Until then, `src/styles.css` is the only global stylesheet, and it is still empty of product rules. Feature stylesheets only add layout that belongs to that component. No third-party component kit, no utility framework, no icon font loaded from a CDN.

The Angular CLI landing page in `src/app/app.html` is a placeholder. It is not a pattern for color, type, or layout. Replace it when the shell is implemented. Do not extend its gradient, pill links, or inline stylesheet.

## Documentation rule

Canonical writing lives in:

- `docs/files/design_guidelines.md` — look, tokens, interaction
- `docs/files/architecture_guidelines.md` — modules, routes, and the client
- the parent `docs/files/` — Compose, n8n, LM Studio, SQLite
- `README.md` — how to run this app

Do not add `ARCHITECTURE.md`, `DESIGN.md`, `PRODUCT.md`, or `setup.md`. Screenshots belong in `docs/screenshot/` and illustrate these rules. Parent documents do not set colors or layout.

## Product facts that shape the look

The person is here to write one thing and copy it. They pick Commit, Email, or Letter, fill a short form, wait, and read a draft.

Principles:

1. The draft is the result. The form is how they get it. Chrome stays quieter than both.
2. One task is on screen. The other tasks are navigation, not three competing columns.
3. Empty states are honest: no draft yet, n8n is not running, the local model server is not running, history has no rows yet.
4. The in-flight state replaces the draft area's status line. It does not jump the form down the page.

## Spacing

**No margins for layout.** Sibling spacing is the parent's `gap` on CSS Grid or Flexbox. Do not set `margin` on fields, buttons, or sections to push them apart.

Padding is allowed inside a single component (a field's inset, the draft pane, the page shell). Children of that shell are separated with `gap`.

| Intent | Size |
| :--- | :--- |
| Base step | 4px |
| Field inset | 12px |
| Control gap | 8px |
| Section gap | 24px |
| Page gap | 32px |
| Body | 16px |
| UI labels, meta | 13–14px |
| Task title | 28px |
| Control height | 40px minimum |

`html { font-size: 100%; }`. Sizes in these guidelines are pixels in the stylesheet. Do not introduce a second root scale.

## Color tokens

Role names only. Hex lives in one token file under `src/styles/`. The default theme is light, close to paper. A later dark theme may replace the hex. It may not rename the roles.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--color-canvas` | `#f3f0e8` | Application ground |
| `--color-surface` | `#fffcf6` | Form card, draft pane |
| `--color-surface-raised` | `#e7e1d6` | Nav hover, secondary wells |
| `--color-panel` | `#efeae1` | Field fill |
| `--color-text` | `#1c1915` | Titles, draft text, input text |
| `--color-text-soft` | `#5e584f` | Labels, hints, timestamps |
| `--color-main` | `#1f6f5b` | Primary action, active task |
| `--color-main-hot` | `#185a4a` | Hover and focus on the primary action |
| `--color-trim` | `rgba(28, 25, 21, 0.14)` | Hairlines, field borders |
| `--color-danger` | `#8f2d2d` | Validation and failed requests |

Do not paint a unique color per task. Commit, pull request, prompt, and git share the same surfaces. `--color-main` marks the active task and the button that asks for a draft.

### Balance

| Share | Use |
| :--- | :--- |
| Canvas | The ground around the sheet |
| Surface | The form and the draft |
| Accent | The active task and the submit button |
| Ink | What the person wrote and what the model returned |

## Typography

Use a sans for UI and a serif only for the wordmark **VerbaNode**, from the platform stack. Do not add a font CDN tag.

| Role | Face | Use |
| :--- | :--- | :--- |
| Wordmark | Georgia, or another platform serif | The mark in the header |
| UI | The platform sans (`Segoe UI`, `system-ui`) | Nav, labels, form |
| Draft and diff | The platform monospace | Commit draft, pasted diff, prompt, git commands |

The pull request paragraph uses the UI sans inside the draft pane. A commit, prompt, or git draft uses monospace. Diff text never sets the width of the page; the field scrolls inside itself.

## Layout and scroll

The shell is a column: a header, a task nav, then a main region. The window may scroll. This is a form, not a frozen dashboard.

The main region is a centered column with a max width of 880px. From 800px upward, the writing feature is a grid of two tracks: the form, then the draft pane, with `gap: 24px` and `align-items: start`. Below 800px, the draft pane stacks under the form. Gap stays the spacing tool.

```css
.task-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
```

The header holds the wordmark and a single status chip: ready, working, or unavailable. The chip states whether the last request succeeded. It does not poll LM Studio.

Task nav is a row of links: Commit, Pull request, Prompt, Git, and History. The current link uses `--color-main` as text and a 2px underline. It does not get a filled pill of a different hue.

## Surfaces

**Form card.** Surface, 1px `--color-trim` border, 8px radius, 16px padding. A task title, a language field, the brief, the optional context, the primary button. Fields use `--color-panel`, 1px `--color-trim`, 8px radius, and at least 40px of height for single-line controls. Text areas use a min height of 160px for a brief and 220px for a diff.

**Draft pane.** Same surface treatment. A label ("Draft"), the status line, the text, and a copy button. Before the first success the pane says "No draft yet." An error uses `--color-danger` in the status line and leaves the previous draft in place if one exists.

**History.** A single column of rows on the same surface. Each row is the time, the task name, the model id, the brief, and the draft. Rows are separated by the parent's `gap`, not by margins. No row is shown unless the history webhook returned it.

**Header.** Wordmark, task links, status chip. No account menu, no model picker, no cloud badge.

## Interaction

Hover and active states change color, background, or border. They do not change layout size. Transitions stay under 180ms and honor `prefers-reduced-motion`.

Focus-visible outlines use `--color-main` at 2px. Do not remove focus styling.

Buttons are native `button` elements with a shared class in the global stylesheet: `.btn` and `.btn-primary`. `.btn-primary` is `--color-main` background and a light label (`#fffcf6`). The copy control is `.btn`, not a second skin.

The primary button label is "Write draft". While the request is in flight the label is "Writing…" and the button is disabled. The form fields stay editable only after the request ends, so a late response cannot overwrite a newer edit: ignore a response whose abort signal already fired.

Copy writes the draft to the clipboard and sets the status line to "Copied" until the next edit or request.

## What not to do

- Import a UI kit or a utility-class framework
- Separate siblings with `margin` instead of the parent's `gap`
- Hard-code hex outside the token file
- Keep the CLI gradient, pills, or Angular logo as the product shell
- Add a model selector, an API key field, or a login form
- Animate the draft pane with slide or scale when text arrives
- Show a sample commit, a sample pull request, or invented history
- Call LM Studio from the page for a "live" status dot
- Add `ARCHITECTURE.md`, `DESIGN.md`, `PRODUCT.md`, or `setup.md`
