# Dependencias

## Dependencias de runtime

| Paquete        | Uso                                   | Sigue siendo necesario |
| -------------- | ------------------------------------- | ---------------------- |
| `react`        | Renderizado de la aplicación          | Sí                     |
| `react-dom`    | Montaje en el DOM                     | Sí                     |
| `lucide-react` | Iconografía de UI                     | Sí                     |
| `gsap`         | Animaciones declarativas y eficientes | Sí                     |
| `@gsap/react`  | Integración segura de GSAP en React   | Sí                     |

## Dependencias de desarrollo

| Paquete                                   | Uso                                      | Sigue siendo necesario |
| ----------------------------------------- | ---------------------------------------- | ---------------------- |
| `vite-plus`                               | CLI unificada para dev/check/test/build  | Sí                     |
| `vite` (`@voidzero-dev/vite-plus-core`)   | Core alineado con Vite+                  | Sí                     |
| `vitest` (`@voidzero-dev/vite-plus-test`) | Runtime de testing alineado con Vite+    | Sí                     |
| `@vitejs/plugin-react`                    | Integración React para Vite/Vite+        | Sí                     |
| `typescript`                              | Tipado estático                          | Sí                     |
| `tailwindcss`                             | Estilos utilitarios y tokens             | Sí                     |
| `@tailwindcss/vite`                       | Integración moderna de Tailwind con Vite | Sí                     |
| `jsdom`                                   | Entorno DOM para Vitest                  | Sí                     |
| `@testing-library/react`                  | Render y pruebas de componentes          | Sí                     |
| `@testing-library/jest-dom`               | Matchers para DOM                        | Sí                     |
| `@testing-library/user-event`             | Interacciones de usuario en tests        | Sí                     |
| `@types/node`                             | Tipos Node.js                            | Sí                     |
| `@types/react`                            | Tipos React                              | Sí                     |
| `@types/react-dom`                        | Tipos React DOM                          | Sí                     |

## Dependencias retiradas o implícitamente eliminadas

- Tailwind por CDN en `index.html`
- Variables y configuración relacionadas con `GEMINI_API_KEY`
- README y metadata arrastrados desde un scaffold ajeno al producto

## Notas sobre Vite+ y overrides

Se mantiene el override de `vite` y `vitest` hacia los paquetes oficiales de Vite+ para asegurar que la CLI y las APIs usen la misma base interna.# Dependencias

## Runtime

- `react`, `react-dom`: UI reactiva y render.
- `lucide-react`: iconografía.
- `gsap`: motor de animación.

## Desarrollo

- `vite`: build/dev (Vite 8 con integración Rolldown).
- `@vitejs/plugin-react`: transformación React.
- `typescript`: tipado estático.
- `vitest`, `@vitest/coverage-v8`, `jsdom`: pruebas y cobertura.
- `@testing-library/*`: pruebas de componentes y accesibilidad básica.
- `oxlint`, `oxfmt`: lint y format de alto rendimiento (OXC).
- `tailwindcss`, `@tailwindcss/postcss`, `postcss`: sistema de estilos.
- `vite-plus`: integración local con ecosistema `vp`.

## Criterios de limpieza

- Se retiró dependencia implícita de CDN Tailwind e importmaps remotos.
- Se eliminó acoplamiento a `GEMINI_API_KEY` del `vite.config.ts`.
- Se mantienen solo dependencias necesarias para build, calidad y pruebas.
