# Architecture

## Summary

A React 19 + TypeScript SPA that generates OKLCH color palettes, previews
their application in a dashboard UI, and exports ready-to-use tokens for
CSS, Tailwind 4, or JSON.

## Modules

- `src/data/presets.ts`
  - Defines the preset registry and the baseline lightness/chroma curve.
- `src/lib/color.ts`
  - Calculation core: hue normalization, OKLCH to HEX conversion, scale
    generation, and dynamic preset registry support.
- `src/lib/exports.ts`
  - Exports palettes to CSS custom properties, Tailwind 4 `@theme`, and
    JSON.
- `src/lib/clipboard.ts`
  - Clipboard copy with a fallback for restricted browsers.
- `src/lib/file.ts`
  - Direct download of exports as local files.
- `src/lib/storage.ts`
  - Persists `GeneratorSettings` and imported presets in `localStorage`.
- `src/lib/custom-presets.ts`
  - Validates and safely parses user-imported JSON presets.
- `src/lib/accessibility.ts`
  - Luminance, contrast, and readable text color helpers.
- `src/components/*`
  - Presentation layer (grid, control panel, preview, export, toast).

## Data flow

1. `GeneratorSettings` state lives in `src/App.tsx`.
2. `App.tsx` merges the built-in preset registry with imported presets and
   ensures an active preset is valid.
3. `generatePalettes(settings, presetRegistry)` computes families and steps
   in a memo.
4. Components consume the derived palettes and emit state changes.
5. Export, copy, and download reuse pure functions in `src/lib`.
6. `storage.ts` writes settings and custom presets to `localStorage` after
   each meaningful change.

## Toolchain

- Bundling and dev server: Vite+ (Vite 8 with Rolldown).
- Lint and format: OXC (`oxlint`, `oxfmt`).
- Testing: Vitest + Testing Library + Istanbul coverage in `logs/coverage`.
- Styling: local Tailwind 4 with CSS design tokens.
- Animation: GSAP with `useGSAP` and automatic cleanup.
- CI: GitHub Actions for `check`, `test`, and `build`.
