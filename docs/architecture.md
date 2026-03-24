# Arquitectura

## Resumen

Aplicación SPA en React 19 + TypeScript para generar paletas OKLCH, previsualizar su aplicación en UI y exportar tokens listos para CSS, Tailwind 4 o JSON.

## Módulos

- `src/data/presets.ts`
  - Define presets de familias de color y curva base de pasos.
- `src/lib/color.ts`
  - Núcleo de cálculo: normalización de hue, conversión OKLCH->HEX, generación de pasos y soporte para registros dinámicos de presets.
- `src/lib/exports.ts`
  - Exportación de paletas a CSS Variables, bloque `@theme` de Tailwind 4 y JSON.
- `src/lib/clipboard.ts`
  - Copia al portapapeles con fallback para navegadores restringidos.
- `src/lib/file.ts`
  - Descarga directa de exportaciones como archivo local.
- `src/lib/storage.ts`
  - Persistencia de `GeneratorSettings` y presets importados en `localStorage`.
- `src/lib/custom-presets.ts`
  - Validación y parsing seguro de presets JSON importados por el usuario.
- `src/lib/accessibility.ts`
  - Utilidades de luminancia, contraste y selección de color legible.
- `src/components/*`
  - Capa de presentación y UX (grid, control panel, preview, export y feedback toast).

## Flujo de datos

1. El estado de `GeneratorSettings` vive en `src/App.tsx`.
2. `App.tsx` mezcla presets built-in con presets importados y asegura un preset activo válido.
3. `generatePalettes(settings, presetRegistry)` computa familias y pasos memoizados.
4. Los componentes consumen paletas derivadas y emiten cambios de estado.
5. Exportar, copiar y descargar reutiliza funciones puras en `src/lib`.
6. `storage.ts` persiste settings y presets personalizados después de cada cambio relevante.

## Toolchain

- Bundling/dev server: Vite 8 (base Rolldown).
- Lint/format: OXC (`oxlint`, `oxfmt`).
- Testing: Vitest + RTL + cobertura Istanbul en `logs/coverage`.
- Estilos: Tailwind local + design tokens CSS.
- Animaciones: GSAP con `useGSAP` y cleanup automático.
- CI: GitHub Actions para `check`, `test` y `build`.
