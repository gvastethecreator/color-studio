# Color Studio

> <img src="docs/color.png" align="right" width="160" alt="Color Studio preview" />

[![pnpm](https://img.shields.io/badge/pnpm-11.20-F69220?logo=pnpm)](https://pnpm.io/)
[![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&variant=primary&size=xs)](https://www.typescriptlang.org)
[![Vite+](https://img.shields.io/badge/Vite%2B-0.2.8-646CFF)](https://viteplus.dev/)
[![React](https://www.shieldcn.dev/badge/React-61DAFB.svg?logo=react&variant=primary&size=xs)](https://react.dev)
[![License](https://www.shieldcn.dev/github/license/gvastethecreator/color-studio.svg?variant=secondary&size=xs)](LICENSE)

Local-first workbench for harmony palettes, CSS gradients, OKLCH scales, WCAG contrast, color mixing, and production-ready exports.

Color Studio keeps project data in the browser. It has no backend and sends no palette data to a remote service.

## Tools

- **Palette Composer:** build deterministic five- or six-color harmonies.
- **Gradient Lab:** edit linear, radial, and conic gradients with ordered stops.
- **Scale Lab:** tune OKLCH token scales, import presets, and preview components.
- **Contrast + Mix:** check WCAG contrast and mix exact color endpoints.
- **Export:** copy or download CSS variables, Tailwind 4 theme tokens, and JSON.

## Requirements

- Node.js 20.19 or newer
- pnpm 11.20.0

## Start

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Open `http://localhost:3000`.

## Common commands

| Command | Purpose |
| --- | --- |
| `pnpm run dev` | Start the development server. |
| `pnpm run check` | Check formatting, lint, and types. |
| `pnpm run test` | Run tests with coverage. |
| `pnpm run build` | Build the production app. |
| `pnpm run preview` | Preview the production build. |
| `pnpm run clean` | Remove generated build and coverage output. |

VS Code users can run the same commands from the short emoji tasks in `.vscode/tasks.json`.

## Documentation

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Dependencies and upgrade notes](docs/dependencies.md)
- [Maintenance reviews](docs/reviews/README.md)
- [Technical debt](docs/TECHNICAL_DEBT.md)

## Quality gate

Before opening a pull request, run:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run test
pnpm run build
```

## License and support

See [LICENSE](LICENSE). You can also [sponsor the project](https://github.com/sponsors/gvastethecreator/) or [follow the author on X](https://x.com/gvastebb).
