# Architecture guidelines

This document is the architecture of **verbaNodeApp**, the Angular workspace for VerbaNode. The app collects a commit summary, a pull request use case, an implementation task, or a GitHub origin, sends it to the local n8n webhook, and shows the draft. The model is LM Studio on the host, model **liquid/lfm2.5-1.2b**. The browser does not call it.

The repository app is Angular 22 with SSR. The rules below are the Angular 17+ baseline (standalone components, signals, OnPush) applied to this codebase. Visual rules live in [design_guidelines.md](design_guidelines.md). Stack, Compose, the webhook JSON, and SQLite live in the parent `docs/files/` directory. The public boot steps live in the repository README and in this app's README.

Do not recreate `ARCHITECTURE.md`, `DESIGN.md`, `PRODUCT.md`, or `setup.md`.

The current `src/app` tree is the Angular CLI placeholder. The layout below is the target for the first implementation. Do not treat the placeholder as a feature.

---

## 1. Architectural vision

The workspace is a client of one local webhook. It is not an automation engine and it is not a model host. The Git task only writes command text. It does not run `git`.

* **One request path.** A feature builds the JSON body from [the n8n contract](../../../docs/files/n8n.md) and posts it to `http://localhost:5678/webhook/verba/draft`. Prompts, temperature, and the model id stay in n8n.
* **SSR is a shell.** `src/server.ts` serves the application. It does not call n8n, LM Studio, or SQLite. Draft requests run in the browser after submit. Rendering the placeholder, and later the empty form, must succeed with both local services stopped.
* **Local only.** The dev server is the host process on port 4200. There is no account screen. History, when it exists, is a list returned by n8n, not a store inside the Angular process.
* **Separation of concerns.** `core/` knows the webhook. `features/` render a task. `pages/` bind a route to a feature. Feature templates do not assemble fetch URLs inline.

**Out of scope for the first UI:** sending mail, running git, choosing a cloud model, and editing n8n workflows from the page.

---

## 2. Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| UI | Angular 22 (standalone, signals, OnPush) | Task forms, draft pane, history list |
| HTTP | `HttpClient` | `POST` the draft webhook, later `GET` history |
| Server | Angular SSR and the generated Express server | Serve the shell. No model calls. |
| Styling | Vanilla CSS and design tokens | See the design guidelines. No component kit. |
| Upstream | n8n on `127.0.0.1:5678` | The only backend the UI calls |
| Model | LM Studio, `liquid/lfm2.5-1.2b`, reached by n8n | Not a dependency of this app |

`ng serve` is how the UI is built today. A production image is a later Compose service, described in the parent [docker note](../../../docs/files/docker.md). Do not add that image while the screen is still the CLI placeholder.

The webhook base URL is a small injectable constant, default `http://localhost:5678`. The root `.env` file is documentation for operators. Angular does not load it. When the production image exists, the same constant is set at build time. It is not a secret.

---

## 3. Directory structure

Target layout. Route coordinators stay thin. Domain UI lives in `features/`.

```text
src/
├── app/
│   ├── core/
│   │   ├── api/                 # DraftClient, history client, error mapping
│   │   └── models/              # DraftRequest, DraftResponse, DraftRecord
│   ├── shared/                  # Draft pane, field, task status
│   ├── features/
│   │   ├── commit/
│   │   ├── pr/
│   │   ├── prompt/
│   │   ├── git/
│   │   └── history/
│   └── pages/                   # Route coordinators
├── styles/                      # Tokens, reset, global rules
└── index.html
```

**One component per folder.** A feature folder holds that feature's parent files. A child such as `commit/diff-field/` gets its own folder.

Today, global CSS is the single file `src/styles.css`. When the first feature lands, add `src/styles/tokens.css` and import it from `src/styles.css`. Do not leave hex values in a feature stylesheet.

### `core/`

* **`api/`** exposes `submit(request)` and, later, `listDrafts()`. Both return signals or a single async result mapped into signals by the caller. The client translates HTTP 400, 502, 503, and 504 into a typed error with the server's `error` string. A network failure becomes "n8n is not running," not a raw status of 0 with no text.
* **`models/`** are interfaces for the webhook body and the history row. Templates do not receive untyped JSON.

`core/` does not import LM Studio, Docker, or a SQLite driver.

### `features/` and `pages/`

| Surface | Feature | Route |
| :--- | :--- | :--- |
| Commit command | `features/commit` | `''` |
| Pull request summary | `features/pr` | `'pr'` |
| Implementation prompt | `features/prompt` | `'prompt'` |
| Git init and push commands | `features/git` | `'git'` |
| Local history | `features/history` | `'history'` |

`pages/` reads the route and renders the feature. It does not validate a diff or format a commit subject. The commit feature owns that.

Each writing feature holds its form state in signals: the brief, the optional context, the language, the in-flight flag, the draft, and the error. Submitting sets the in-flight flag, clears the previous error, and replaces the draft only when the response arrives.

### `shared/`

A draft pane (title, preformatted or prose body, copy button), a labeled field, and an inline status line. Buttons and tokens are global CSS, not a component library.

---

## 4. Data the UI sends

The body matches the parent contract.

| Task | `brief` | `context` / `origin` |
| :--- | :--- | :--- |
| Commit | What changed, if the user typed a summary | The diff, when they pasted one. At least one of the two must be non-empty. |
| Pull request | The use case. Always sent with `language: "en"`. | Optional notes |
| Prompt | The instruction placed after the fixed preamble | Optional notes |
| Git | The commit message, one line | `origin`: `https://github.com/owner/repo.git` |

`language` is a field on the commit form. The default is `en`. Pull request summaries are always English.

The client refuses to send a `brief` over 4 000 characters or a `context` over 24 000 characters and shows the limit next to the field. That duplicates the workflow check so a rejected payload does not wait on the model.

The commit screen does not shell out to `git diff`. The user pastes the diff. Reading the local repository from the page is a later decision, and it does not belong in the first client.

---

## 5. History

Until `GET /webhook/verba/drafts` exists, the history route renders an empty state that says history is not stored yet. It does not invent rows and it does not scrape n8n's editor.

When the endpoint exists, the feature loads at most 50 rows and maps them to `DraftRecord`: `createdAt`, `task`, `language`, `brief`, `draft`, `model`. The model column shows the id that came back, which on this machine is `liquid/lfm2.5-1.2b` unless `.env` says otherwise. The UI does not hard-code that name as the only successful model.

---

## 6. Angular standards

* **Standalone** components, imported explicitly.
* **`inject()`** instead of constructor injection.
* **Signals.** Form fields, the in-flight flag, the draft, the error, and the history rows are `signal` or `computed`. Templates do not subscribe to Observables for that state. `HttpClient` may return an Observable inside `core/api`; the feature converts the result once.
* **OnPush** on every component.
* **Control flow** is `@if`, `@for`, and `@else`.
* **Routes** use static `component` imports. Coordinators in `pages/` bind the feature to the URL. The default route is the commit task.
* **Async boundaries.** Leaving the route unsubscribes the draft request. The client also sets an HTTP timeout of 130 seconds. A hung call ends in that timeout or in the workflow's 504, with a visible message, not an endless spinner.

```typescript
private drafts = inject(DraftClient);
```

```angular-html
@if (error(); as message) {
  <p role="alert">{{ message }}</p>
}
```

---

## 7. Coding standards

* **KISS.** One webhook, one client, three forms that share the draft pane.
* **DRY.** The draft pane and the field exist once under `shared/`.
* **Small units.** Keep a component near 200 lines. Split the form and the draft pane rather than growing one screen into a grab bag.
* **Type the boundary.** `DraftRequest` and `DraftResponse` are the only shapes that cross from n8n into a template.
* **Failures stay on the task.** A 400, a stopped n8n, or a stopped LM Studio sets that feature's error signal. It does not throw through the event loop and it does not clear the text the user typed.
* **Honesty.** Do not show a sample commit, a sample pull request, or a history row the webhook did not return.

---

## 8. Documentation

Canonical docs for this app:

- `docs/files/architecture_guidelines.md` — this file
- `docs/files/design_guidelines.md` — look, tokens, interaction
- `README.md` — how to serve and test the workspace

Parent docs that this app must not contradict:

- `docs/files/architecture.md` — process boundaries
- `docs/files/n8n.md` — request and response JSON
- `docs/files/lmstudio.md` — why the UI never calls port 1234
- `docs/files/sqlite.md` — why the UI never opens a database file

Screenshots, when a real screen exists, live in `docs/screenshot/`. Do not recreate `ARCHITECTURE.md`, `DESIGN.md`, `PRODUCT.md`, or `setup.md`.
