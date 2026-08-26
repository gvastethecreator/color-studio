# Code map · color-studio

generated: 2026-08-26T21:15:00Z
commit: 226bd39e17ab
scope: .

counts: 10 nodes · 22 edges · 5 flows · 0 overflow · 0 unknown

## Modules

- `external-dependencies` · `src/App.tsx` · external · External
  callers: src (imports), src-components (imports), src-hooks (imports), src-lib (imports), vite-config (imports)
  callees: (none)
  tests: (none)
  entry: src/App.tsx:react

- `repository` · `package.json` · module · Repository
  callers: (none)
  callees: scripts (calls)
  tests: (none)
  entry: package.json:name

- `scripts` · `scripts` · service · Scripts
  callers: repository (calls)
  callees: (none)
  tests: (none)
  entry: scripts/clean-generated.mjs:rootDir

- `src` · `src` · module · Src
  callers: (none)
  callees: external-dependencies (imports), src-components (imports), src-data (imports), src-hooks (imports), src-lib (imports), src-types (imports)
  tests: src/App.test.tsx
  entry: src/App.tsx:GradientEditor

- `src-components` · `src/components` · interface · Src
  callers: src (imports), src-lib (imports)
  callees: external-dependencies (imports), src-data (imports), src-hooks (imports), src-lib (imports), src-types (imports)
  tests: src/App.test.tsx, src/components/ControlPanel.test.tsx, src/components/ExportMenu.test.tsx, src/components/PaletteGrid.test.tsx, src/components/PreviewPanel.test.tsx
  entry: src/components/BrandLogo.tsx:BrandLogo

- `src-data` · `src/data` · module · Src
  callers: src (imports), src-components (imports), src-hooks (imports), src-lib (imports)
  callees: src-types (imports)
  tests: src/App.test.tsx, src/lib/color.test.ts
  entry: src/data/official-presets.ts:swatch

- `src-hooks` · `src/hooks` · module · Src
  callers: src (imports), src-components (imports)
  callees: external-dependencies (imports), src-data (imports), src-lib (imports), src-types (imports)
  tests: (none)
  entry: src/hooks/use-accent-theme.ts:useAccentTheme

- `src-lib` · `src/lib` · module · Src
  callers: src (imports), src-components (imports), src-hooks (imports)
  callees: external-dependencies (imports), src-components (imports), src-data (imports), src-types (imports)
  tests: src/App.test.tsx, src/components/ExportMenu.test.tsx, src/components/PaletteGrid.test.tsx, src/components/PreviewPanel.test.tsx, src/lib/accessibility.test.ts
  entry: src/lib/accent-palettes.ts:AccentPaletteId

- `src-types` · `src/types` · module · Src
  callers: src (imports), src-components (imports), src-data (imports), src-hooks (imports), src-lib (imports)
  callees: (none)
  tests: src/App.test.tsx, src/components/ControlPanel.test.tsx, src/components/ExportMenu.test.tsx, src/components/PaletteGrid.test.tsx, src/components/PreviewPanel.test.tsx
  entry: src/types/palette.ts:ColorStep

- `vite-config` · `vite.config.ts` · module · Vite.Config
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: vite.config.ts:rootDir

## Overflow

- none

## Edges

- repository -> scripts · calls
- src -> external-dependencies · imports
- src -> src-components · imports
- src -> src-data · imports
- src -> src-hooks · imports
- src -> src-lib · imports
- src -> src-types · imports
- src-components -> external-dependencies · imports
- src-components -> src-data · imports
- src-components -> src-hooks · imports
- src-components -> src-lib · imports
- src-components -> src-types · imports
- src-data -> src-types · imports
- src-hooks -> external-dependencies · imports
- src-hooks -> src-data · imports
- src-hooks -> src-lib · imports
- src-hooks -> src-types · imports
- src-lib -> external-dependencies · imports
- src-lib -> src-components · imports
- src-lib -> src-data · imports
- src-lib -> src-types · imports
- vite-config -> external-dependencies · imports

## Unknown

- none

## Flows

- src/App.tsx:GradientEditor
  src -> external-dependencies
  reached external-dependencies
- src/components/BrandLogo.tsx:BrandLogo
  src-components -> external-dependencies
  reached external-dependencies
- package.json:name
  repository -> scripts
  reached scripts
- src/data/official-presets.ts:swatch
  src-data -> src-types
  reached src-types
- src/hooks/use-accent-theme.ts:useAccentTheme
  src-hooks -> external-dependencies
  reached external-dependencies
