# Architecture

## Summary

A React 19 + TypeScript SPA organized as a local-first color workbench. It
generates small harmony palettes and OKLCH token scales, composes production
CSS gradients, evaluates WCAG contrast, mixes colors, and exports reusable
values without a backend.

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
- `src/lib/studio-color.ts`
  - HEX/RGB/OKLCH conversion, literal harmony templates, deterministic 5/6
    color generation, sRGB mixing, and palette CSS/JSON serialization.
- `src/lib/gradient.ts`
  - Gradient stop ordering, bounded stop insertion, and compatible/enhanced
    CSS serialization for linear, radial, and conic gradients.
- `src/lib/studio-storage.ts`
  - Versioned, repaired persistence for the active tool and its palette,
    gradient, contrast, and mixer state.
- `src/types/studio.ts`
  - Workbench domain contracts and tool state.
- `src/components/studio/*`
  - Vertical tool slices for navigation, palette, gradient, scale, contrast,
    color input validation, and mix workflows.
- `src/components/*`
  - Existing scale presentation layer (grid, control panel, preview, export,
    toast), embedded in Scale Lab.

## Data flow

1. `App.tsx` owns both existing `GeneratorSettings` and versioned `StudioState`.
2. `StudioNavigation` changes only the active tool; each tool's work remains in
   memory and is persisted after meaningful changes.
3. Palette and gradient components call pure domain functions and emit complete
   state slices back to `App.tsx`.
4. Scale Lab merges built-in and imported preset registries, then reuses the
   existing `generatePalettes` and export flow.
5. Contrast + Mix derives ratios and mixed output directly from its stored
   color pair/endpoints.
6. Copy and download actions reuse shared browser adapters, while all
   calculations and serialization remain testable without the DOM.
7. `storage.ts` and `studio-storage.ts` write separate, compatible local keys;
   malformed or future-shaped studio payloads fall back to sanitized defaults.
8. `App.tsx` keeps Palette Composer in the initial bundle and loads Gradient,
   Scale, and Contrast tools on demand behind an accessible status fallback.

## Toolchain

- Bundling and dev server: Vite+ (Vite 8 with Rolldown).
- Lint and format: OXC (`oxlint`, `oxfmt`).
- Testing: Vitest 4 + Testing Library + Istanbul coverage in `logs/coverage`.
- Styling: local Tailwind 4 with CSS design tokens.
- Animation: GSAP with `useGSAP` and automatic cleanup.
- CI: GitHub Actions for `check`, `test`, and `build`.
