# Dependencies

pnpm 12.0.0 is the only package manager. Vite+ owns development, checks, tests, and builds. The matching Vite core and Vitest versions are pinned through the workspace catalog to prevent duplicate toolchain copies.

## Runtime

- `react` and `react-dom`: application rendering.
- `@base-ui/react`: accessible, unstyled controls and popups.
- `@fontsource-variable/inter`: local variable font assets.
- `@tabler/icons-react`: icon components.
- `class-variance-authority`, `clsx`, and `tailwind-merge`: reusable class composition.

## Development

- `vite-plus`, its aliased `vite` core, and `@vitejs/plugin-react`: dev server and production build.
- `vitest`, `@vitest/coverage-istanbul`, `jsdom`, and Testing Library: behavior tests and coverage.
- `typescript` and `@types/*`: static contracts.
- `tailwindcss`, `@tailwindcss/vite`, and `tw-animate-css`: design tokens and styles.

## Setup rules

- Use `pnpm install --frozen-lockfile` in CI and verification.
- Update `vite-plus`, aliased `vite`, `vitest`, and coverage together.
- Run the official `vp migrate` command when Vite+ changes its dependency model.
- Review major migration guides before accepting lockfile changes.
- Do not add Bun lockfiles or Bun-specific scripts; this project has no Bun runtime contract.
