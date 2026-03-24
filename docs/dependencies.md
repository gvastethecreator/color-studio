# Dependencias

## Runtime

- `react`: renderizado declarativo de la SPA. Necesario.
- `react-dom`: montaje en DOM y runtime cliente. Necesario.
- `lucide-react`: iconografía ligera para controles y acciones. Necesario.
- `gsap`: animaciones de entrada y transiciones suaves. Necesario.
- `@gsap/react`: integración segura de GSAP con React. Necesario.

## Desarrollo

- `vite-plus`: CLI unificada (`vp dev`, `vp check`, `vp test`, `vp build`). Necesario.
- `vite` (`@voidzero-dev/vite-plus-core`): core compatible con Vite+ y build sobre Rolldown. Necesario.
- `vitest` (`@voidzero-dev/vite-plus-test`): runtime de testing alineado con Vite+. Necesario.
- `@vitest/coverage-istanbul`: cobertura para Vitest en `logs/coverage`. Necesario.
- `@vitejs/plugin-react`: transformación React + Fast Refresh. Necesario.
- `typescript`: tipado estático y chequeo de contratos. Necesario.
- `tailwindcss`: utilidades y tokens de diseño. Necesario.
- `@tailwindcss/vite`: integración moderna de Tailwind en Vite/Vite+. Necesario.
- `jsdom`: entorno DOM para tests de componentes. Necesario.
- `@testing-library/react`: render y assertions centradas en comportamiento. Necesario.
- `@testing-library/jest-dom`: matchers adicionales para DOM. Necesario.
- `@testing-library/user-event`: interacciones realistas de usuario. Necesario.
- `@types/node`: tipos de Node.js para scripts y config. Necesario.
- `@types/react`: tipos de React. Necesario.
- `@types/react-dom`: tipos de React DOM. Necesario.

## Dependencias retiradas

- Tailwind por CDN en `index.html`
- Configuración y variables ligadas a `GEMINI_API_KEY`
- Restos de scaffold ajeno al producto original

## Notas operativas

- Se mantienen `overrides` de `vite` y `vitest` para que el ecosistema entero use la base de Vite+.
- Actualmente `vp test` muestra un warning no bloqueante de “mixed versions” entre el alias de `vite-plus-test` y el proveedor oficial de cobertura; los tests y la cobertura pasan correctamente, así que se documenta como matiz de tooling y no como fallo funcional.
