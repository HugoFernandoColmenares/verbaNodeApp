# verbaNodeApp

Angular 22 workspace for [VerbaNode](../README.md). Commit, Pull request, Prompt, and Git each post to the local n8n webhook and show the draft. Prompt and Git do not call the model. Git does not run the commands it writes.

![Commit screen](docs/screenshot/01-commit.png)

## Screenshots

| Task | Preview |
| --- | --- |
| Commit | ![Commit](docs/screenshot/01-commit.png) |
| Pull request | ![Pull request](docs/screenshot/02-pull-request.png) |
| Prompt | ![Prompt](docs/screenshot/03-prompt.png) |
| Git | ![Git](docs/screenshot/04-git.png) |
| History | ![History](docs/screenshot/05-history.png) |

LM Studio and n8n are not started by this package. Boot them from the repository root. This app never calls the model port.

## Docs

| File | Contents |
| --- | --- |
| [docs/files/architecture_guidelines.md](docs/files/architecture_guidelines.md) | Modules, routes, webhook client |
| [docs/files/design_guidelines.md](docs/files/design_guidelines.md) | Tokens, layout, interaction |
| [../docs/files/n8n.md](../docs/files/n8n.md) | JSON the forms must send |

Screenshots of the real UI live in `docs/screenshot/` (copies of the root captures).

## Development server

```bash
npm start -- --host 127.0.0.1 --port 4200
```

Open [http://127.0.0.1:4200/](http://127.0.0.1:4200/). The proxy sends `/webhook` to n8n on port 5678. Bind to `127.0.0.1` so Angular SSR accepts the Host header.

## Tests and build

```bash
npm test
npm run build
```

The production build is written to `dist/`. Serving that build in Compose is a later step. The SSR process only serves the shell. It must not call n8n or LM Studio.
