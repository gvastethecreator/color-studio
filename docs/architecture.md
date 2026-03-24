# Arquitectura

## Resumen

Aplicación SPA en React 19 + TypeScript para generar paletas OKLCH y previsualizar su aplicación en UI.

## Módulos

- `src/data/presets.ts`
  - Define presets de familias de color y curva base de pasos.
- `src/lib/color.ts`
  - Núcleo de cálculo: normalización de hue, conversión OKLCH->HEX, generación de pasos.
- `src/lib/exports.ts`
  - Exportación de paletas a CSS Variables y bloque `@theme` de Tailwind 4.
- `src/lib/clipboard.ts`
  - Copia al portapapeles con fallback para navegadores restringidos.
- `src/components/*`
  - Capa de presentación y UX (grid, control panel, preview y feedback toast).

## Flujo de datos

1. Estado de `GeneratorSettings` vive en `src/App.tsx`.
2. `generatePalettes(settings)` computa familias y pasos memoizados.
3. Los componentes consumen paletas derivadas y emiten cambios de estado.
4. Export/copy reutiliza funciones puras en `src/lib`.

## Toolchain

- Bundling/dev server: Vite 8 (base Rolldown).
- Lint/format: OXC (`oxlint`, `oxfmt`).
- Testing: Vitest + RTL + cobertura V8.
- Estilos: Tailwind local + design tokens CSS.
- Animaciones: GSAP con `useGSAP` y cleanup automático.
