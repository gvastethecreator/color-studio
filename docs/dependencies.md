# Dependencies

## Runtime

- `react`: declarative rendering for the SPA. Required.
- `react-dom`: DOM mounting and client runtime. Required.
- `lucide-react`: lightweight icon set for controls and actions. Required.
- `gsap`: entrance animations and smooth transitions. Required.
- `@gsap/react`: safe GSAP integration with React. Required.

## Development

- `vite-plus`: unified CLI (`vp dev`, `vp check`, `vp test`, `vp build`).
  Required.
- `vite` (aliased to `@voidzero-dev/vite-plus-core`): Vite+ compatible core
  with a Rolldown-based build. Required.
- `vitest` (aliased to `@voidzero-dev/vite-plus-test`): test runtime aligned
  with Vite+. Required.
- `@vitest/coverage-istanbul`: Vitest coverage in `logs/coverage`. Required.
- `@vitejs/plugin-react`: React transform with Fast Refresh. Required.
- `typescript`: static typing and contract checks. Required.
- `tailwindcss`: utility-first styling and design tokens. Required.
- `@tailwindcss/vite`: modern Tailwind integration for Vite/Vite+. Required.
- `jsdom`: DOM environment for component tests. Required.
- `@testing-library/react`: behavior-focused render and assertions.
  Required.
- `@testing-library/jest-dom`: additional DOM matchers. Required.
- `@testing-library/user-event`: realistic user interactions. Required.
- `@types/node`: Node.js types for scripts and config. Required.
- `@types/react`: React types. Required.
- `@types/react-dom`: React DOM types. Required.

## Removed dependencies

- Tailwind via CDN in `index.html`.
- Configuration and env variables tied to `GEMINI_API_KEY`.
- Scaffolding leftover from a prior AI Studio template.

## Operational notes

- The `vite` and `vitest` overrides pin the entire toolchain to Vite+ to
  avoid drift between related packages.
- `vp test --coverage` prints a non-blocking "mixed versions" warning
  because the Vite+ test alias and the Istanbul coverage provider
  publish separate versions. Tests and coverage still pass; the warning
  is treated as a tooling nuance, not a functional failure.
