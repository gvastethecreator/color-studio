# Architecture

Color Studio is a local-first React 19 single-page app. It builds palettes, OKLCH token scales, CSS gradients, and WCAG contrast checks in the browser. There is no backend.

## Layout

- `src/components/studio/` — Palette Composer, Gradient Lab, Scale Lab, and Contrast + Mix.
- `src/lib/` — color math, exports, clipboard, file download, and local persistence.
- `src/data/` — built-in presets.
- `src/hooks/` — session, theme, and media-query hooks.

Project data stays in `localStorage`. The app does not send palette data to a remote service.

## Toolchain

Vite+ (Vite 8) bundles the app. OXC lints and formats. Vitest 4 runs tests. Tailwind 4 styles the UI. GitHub Actions runs `check`, `test`, and `build`.
