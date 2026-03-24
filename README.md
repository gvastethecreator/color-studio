# OKLCH Prism Architect

Aplicación React 19 + TypeScript para generar paletas OKLCH, ajustar familias por preset, previsualizar un dashboard con esos colores y exportar tokens listos para CSS, Tailwind 4 o JSON.

El proyecto fue modernizado para trabajar con el stack solicitado:

- Bun como package manager
- Vite+ como punto de entrada para dev, check, test y build
- Vite 8 / Rolldown vía Vite+
- OXC para lint y formato a través de `vp check`
- Vitest para pruebas unitarias con cobertura
- Tailwind CSS con tokens de diseño basados en variables
- GSAP para animaciones de entrada en React

## Estado actual

### Qué hace la aplicación

- Genera escalas OKLCH a partir de presets curados
- Permite ajustar hue, chroma y lightness global y localmente
- Mantiene IDs estables para exportaciones y selección segura
- Persiste settings y presets importados en `localStorage`
- Permite importar presets personalizados desde JSON
- Previsualiza una interfaz tipo dashboard con la familia activa
- Exporta tokens en tres formatos:
  - CSS custom properties
  - Tailwind 4 `@theme`
  - JSON para pipelines externos
- Permite copiar o descargar directamente cada formato de exportación

### Qué se mejoró en esta revisión

- Se consolidó toda la app en `src/`
- Se eliminó la dependencia de Tailwind por CDN
- Se retiró configuración heredada ligada a AI Studio / API keys no usadas
- Se migró el toolchain a Bun + Vite+
- Se añadieron logs automáticos para `check`, `lint`, `test` y `build`
- Se incorporaron tests y cobertura en `logs/coverage`
- Se añadió CI para `check`, `test` y `build`
- Se mejoró la accesibilidad del grid con navegación por teclado
- Se actualizaron tareas de VS Code con nombres cortos y emojis
- Se documentó arquitectura, dependencias, uso, deuda técnica y cambios realizados

## Estructura principal

- `src/App.tsx`: shell principal y coordinación del estado
- `src/components/`: panel de control, grid, preview, export y toast
- `src/data/presets.ts`: presets y curva base de color
- `src/lib/color.ts`: generación de paletas y utilidades OKLCH
- `src/lib/exports.ts`: exportación de tokens
- `src/lib/clipboard.ts`: copia segura al portapapeles
- `src/lib/file.ts`: descarga directa de artefactos exportados
- `src/lib/storage.ts`: persistencia local de settings y presets importados
- `src/lib/custom-presets.ts`: validación e importación de presets JSON
- `src/lib/accessibility.ts`: contraste y color de texto legible
- `src/styles/globals.css`: Tailwind + tokens base del sistema visual
- `docs/`: documentación funcional y técnica
- `logs/`: salidas de scripts y cobertura

## Requisitos

- Bun `1.3.11` o compatible

## Uso diario

### Instalar dependencias

`bun install`

### Desarrollo

`bun run dev`

### Verificación integral

`bun run check`

### Tests con cobertura

`bun run test`

### Build de producción

`bun run build`

### Limpiar artefactos generados

`bun run clean`

## Logs y debugging

Los scripts de verificación generan archivos en `logs/` con marca temporal y un archivo `latest-*.log` para acceso rápido.

- `bun run check` → `logs/*-check.log`
- `bun run lint` → `logs/*-lint.log`
- `bun run test` → `logs/*-test.log` + cobertura en `logs/coverage`
- `bun run build` → `logs/*-build.log`

## Tareas de VS Code

Se incluyen tareas listas para usar en `.vscode/tasks.json`:

- `📦 install`
- `👀 dev`
- `✅ check`
- `🧹 lint`
- `🧪 test`
- `🏗️ build`
- `🧼 clean`

## Documentación adicional

- `docs/README.md`: índice de documentación
- `docs/ARCHITECTURE.md`: arquitectura y flujo interno
- `docs/DEPENDENCIES.md`: dependencias y justificación
- `docs/WORKLOG.md`: tareas realizadas en esta modernización
- `docs/TECHNICAL_DEBT.md`: deuda técnica remanente
- `.github/workflows/ci.yml`: pipeline de validación continua

## Notas de mantenimiento

- Los tokens exportados usan IDs estables de familia para evitar cambios accidentales en integraciones externas.
- La UI mantiene el diseño original, pero ahora se apoya en Tailwind local, variables tokenizadas y helpers de contraste más robustos.
- Si se agregan nuevos presets, lo correcto es extender `src/data/presets.ts` y cubrirlos con tests en `src/lib/color.test.ts`.
