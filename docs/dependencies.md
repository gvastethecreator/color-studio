# Dependencies

Last reviewed: 2026-08-14.

pnpm 11.20.0 is the only package manager. Vite+ owns development, checks, tests, and builds. The matching Vite core and Vitest versions are pinned through the workspace catalog to prevent duplicate toolchain copies.

## Runtime responsibilities

- `react` and `react-dom`: application rendering.
- `@base-ui/react`: accessible, unstyled controls and popups.
- `@fontsource-variable/inter`: local variable font assets.
- `@tabler/icons-react`: icon components.
- `class-variance-authority`, `clsx`, and `tailwind-merge`: reusable class composition.

## Development responsibilities

- `vite-plus`, its aliased `vite` core, and `@vitejs/plugin-react`: dev server and production build.
- `vitest`, `@vitest/coverage-istanbul`, `jsdom`, and Testing Library: behavior tests and coverage.
- `typescript` and `@types/*`: static contracts.
- `tailwindcss`, `@tailwindcss/vite`, and `tw-animate-css`: design tokens and styles.

## 2026-08-14 upgrade review

| Package | Before | Current | Important change or value |
| --- | --- | --- | --- |
| Vite+ / Vite core | 0.1.14 | 0.2.9 | Official migration moved config to the current catalog model, unified Vitest 4.1.10, and includes the latest patch fixes. [Releases](https://github.com/voidzero-dev/vite-plus/releases) |
| TypeScript | 5.9.3 | 7.0.2 | Native compiler generation; the project passes current type and lint gates. [Release notes](https://www.typescriptlang.org/docs/handbook/release-notes/) |
| React / React DOM | 19.2.3 | 19.2.8 | Current 19.2 patch line with activity and rendering fixes. [React 19.2](https://react.dev/blog/2025/10/01/react-19-2) |
| Base UI | 1.5.0 | 1.7.0 | Focus restoration, popup/store bundle reductions, fewer redundant renders, and popup positioning fixes. [Changelog](https://base-ui.com/react/overview/releases) |
| DayPicker | `@daypicker/react` 10.0.1 | removed | Unused calendar wrapper was pruned with the unused UI kit. |
| GSAP | 3.15.0 | removed | No product import remained. |
| Tabler Icons React | 3.44.0 | 3.46.0 | Current icon catalog and fixes. [Releases](https://github.com/tabler/tabler-icons/releases) |
| Inter variable font | 5.2.8 | 5.3.0 | Current packaged font assets. [Changelog](https://github.com/fontsource/font-files/releases) |
| Tailwind CSS / Vite plugin | 4.1.12 | 4.3.3 | Current CSS pipeline and Vite integration. [Tailwind 4.3](https://tailwindcss.com/blog/tailwindcss-v4-3) |
| `@vitejs/plugin-react` | 5.0.0 | 6.0.5 | Current React transform integration for the Vite 8 line. [Releases](https://github.com/vitejs/vite-plugin-react/releases) |
| Vitest / Istanbul coverage | mixed 0.1.14 and 4.1.1 | 4.1.10 | One aligned Vitest graph; the prior mixed-version warning is gone. [Vitest releases](https://github.com/vitest-dev/vitest/releases) |
| jsdom | 26.1.0 | 30.0.1 | Major DOM conformance upgrade; 30.0.1 fixes computed styles with `calc()` and improves large range operations. [Releases](https://github.com/jsdom/jsdom/releases) |
| jest-dom | 6.6.3 | 7.0.0 | Current matcher major; the Vitest setup import remains the supported public entry. [Releases](https://github.com/testing-library/jest-dom/releases) |
| Testing Library React / user-event | 16.3.0 / 14.6.1 | 16.3.2 / 14.6.4 | Current behavior-test fixes. [React releases](https://github.com/testing-library/react-testing-library/releases), [user-event releases](https://github.com/testing-library/user-event/releases) |
| Node / React type packages | Node 24.6, React 19.2.2 | Node 26.2, React 19.2.18 | Current platform and React declarations; TypeScript 7 compilation passes. [DefinitelyTyped releases](https://github.com/DefinitelyTyped/DefinitelyTyped/releases) |

The 2026-08-14 pass also updated `@testing-library/jest-dom` from 7.0.0 to 7.0.1. Unchanged direct packages were checked against the registry. `pnpm outdated --format json` returns an empty object and `pnpm audit --json` reports zero vulnerabilities.

## Operational rules

- Use `pnpm install --frozen-lockfile` in CI and verification.
- Update `vite-plus`, aliased `vite`, `vitest`, and coverage together.
- Run the official `vp migrate` command when Vite+ changes its dependency model.
- Review major migration guides before accepting lockfile changes.
- Do not add Bun lockfiles or Bun-specific scripts; this project has no Bun runtime contract.
