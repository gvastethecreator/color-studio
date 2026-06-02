# OKLCH Prism Architect

Generate OKLCH color scales from curated presets, tune hue, chroma, and
lightness globally or per family, preview them in a live dashboard, and
export design tokens as CSS custom properties, Tailwind 4 `@theme`, or JSON.

![status: maintained](https://img.shields.io/badge/status-maintained-blue)
![license: MIT](https://img.shields.io/badge/license-MIT-green)
![node: 22+](https://img.shields.io/badge/node-22%2B-43853d)
![package manager: bun](https://img.shields.io/badge/package_manager-bun-f9f1e1)

## What it does

- Generate OKLCH color scales from curated presets
  (Prism Spectrum, Tailwind-ish, Material, Shadcn Bases, Neon Punk).
- Adjust hue, chroma, and lightness globally and per family.
- Persist settings and imported presets in `localStorage`.
- Import custom preset collections from a JSON file.
- Preview the active family on a dashboard-style UI.
- Export design tokens in three formats:
  - CSS custom properties
  - Tailwind 4 `@theme`
  - JSON for external pipelines
- Copy tokens to the clipboard or download them as files.

## Quick start

Requirements: [Bun](https://bun.sh) 1.3.11 or compatible.

```bash
bun install
bun run dev
```

The dev server runs on <http://localhost:3000>.

## Available scripts

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Start the Vite+ dev server with HMR.          |
| `bun run check`     | Run OXC lint, format check, and type check.   |
| `bun run check:fix` | Auto-fix lint and formatting issues.          |
| `bun run lint`      | Lint only.                                    |
| `bun run fmt`       | Format only.                                  |
| `bun run test`      | Run unit and integration tests with coverage. |
| `bun run build`     | Produce a production build in `dist/`.        |
| `bun run preview`   | Serve the production build locally.           |
| `bun run clean`     | Remove `dist/` and `logs/coverage/`.          |

Each command writes a timestamped log to `logs/` and updates the
`latest-<task>.log` shortcut.

## Project layout

```
src/
  App.tsx              Shell, state coordination
  main.tsx             React entry
  components/          ControlPanel, PaletteGrid, PreviewPanel, ExportMenu, Toast
  data/presets.ts      Preset registry and baseline curve
  lib/                 color, exports, clipboard, file, storage,
                       custom-presets, accessibility
  styles/globals.css   Tailwind layer + design tokens
  test/setup.ts        Test environment setup
  types/palette.ts     Shared types and defaults
docs/                  Architecture, dependencies, worklog, technical debt
scripts/               Log runner, cleanup
.github/workflows/     CI: check, test, build
```

See [docs/README.md](docs/README.md) for the full documentation index.

## Custom presets

Use **Import preset JSON** in the sidebar to load a JSON file in the same
shape as `src/data/presets.ts`. The parser validates structure, hue, and
chroma ranges before accepting the file. Imported presets are merged with
the built-in registry and persisted to `localStorage`.

## VS Code tasks

The repo ships with a small set of named tasks in `.vscode/tasks.json`
(install, dev, check, lint, test, build, clean). Run them from the
Command Palette with `Tasks: Run Task`.

## CI

GitHub Actions runs `check`, `test`, and `build` on every push and pull
request. The full logs and coverage are uploaded as an artifact for
failed runs. See `.github/workflows/ci.yml`.

## Documentation

- [docs/README.md](docs/README.md) - documentation index
- [docs/architecture.md](docs/architecture.md) - module layout and data flow
- [docs/dependencies.md](docs/dependencies.md) - dependency inventory and rationale
- [docs/WORKLOG.md](docs/WORKLOG.md) - modernization log
- [docs/TECHNICAL_DEBT.md](docs/TECHNICAL_DEBT.md) - known gaps and next steps
- [SECURITY.md](SECURITY.md) - how to report vulnerabilities

## License

[MIT](LICENSE). See the file for the full text.

## Maintainer notes

- Exported token names use stable family IDs, so renaming a family
  display name will not break existing integrations.
- New presets belong in `src/data/presets.ts` and should be covered by
  tests in `src/lib/color.test.ts`.
