# Color Studio

Local-first React 19 color workbench. No backend.
Palette data stays in the browser.

## Stack

- Family: web
- Package manager: pnpm@12.0.0 only.
- Vite+ (vp) owns dev, check, lint, fmt, test, and build.
- React 19, TypeScript 7, Tailwind 4, Vitest 4.

## Commands

| Command | Purpose |
| --- | --- |
| pnpm install --frozen-lockfile | Install from the lockfile |
| pnpm run dev | Dev server at http://127.0.0.1:3000 |
| pnpm run check | Format, lint, and types |
| pnpm run test | Tests with coverage |
| pnpm run build | Production build |
| pnpm run clean | Remove generated output |

Wrapped scripts write logs under logs/.

## Boundaries

- Keep the current stack. No manager, bundler, or framework swap.
- No backend, accounts, sync, or telemetry.
- Keep existing localStorage keys compatible.
- Ask before deleting public API or product paths.
- Tickets live in .scratch/color-studio/issues/, never under tracked docs/.
- Never print or commit secrets.
- Preserve unrelated dirty work.

## Context pointers

- Product overview: README.md
- Module layout: docs/architecture.md
- Code map: docs/codemap/codemap.md
- Dependency policy: docs/dependencies.md
- Setup: docs/README.md
- Vulnerability reports: SECURITY.md
