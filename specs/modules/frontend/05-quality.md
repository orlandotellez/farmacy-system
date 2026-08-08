# Frontend Quality

Criterios de calidad — FARMACY.

---

## Obligatorio

### Tipado
- `strict: true` (tsconfig.app.json). Sin `any` en código nuevo.
- Tipos de API exportados desde `src/api/index.ts` y reutilizados en páginas/modales.
- Columnas de `DataTable` tipadas con `Column<T>`.

### Validación con typecheck
- `npx tsc --noEmit -p tsconfig.app.json` debe pasar antes de entregar.

### Manejo de errores
- Todo `catch` muestra el mensaje del backend via `messageOf(error, fallback)`.
- Toasts para éxito/error (`useToast`).
- Banners de error con "Reintentar" en catálogos (no dejar pantalla en blanco).
- `ErrorBoundary` global captura errores de render.

### Estados de UI
- Loading: `TableSkeleton`/`Skeleton` en tablas, "Buscando…" en el POS.
- Vacío: mensajes contextuales ("Todavía no hay medicamentos registrados").
- Deshabilitar botones durante envío (`submitting`, `checkingOut`).

### Accesibilidad
- `aria-label` en inputs con icono, botones de icono y filtros.
- Focus visible en todos los controles.
- Selects con `<option value="">` por defecto.

## Rendimiento

- Debounce (220 ms) en búsquedas (POS, tablas).
- Cache por namespace (`simple-cache.ts`) en listados paginados.
- `cacheClear(namespace)` tras mutaciones.
- Paginación real (no cargar todo): PAGE_LIMIT = 10.
- Imágenes/iconos tree-shakeable (lucide-react).

## Consistencia

- Misma estructura de página (header → filtros → tabla → modales) en todas las features.
- Reutilizar `DataTable`, `ConfirmDialog`, `Toast` — no crear variantes.
- CSS Modules por página; variables de tema en `index.css`.
- Formato de moneda centralizado en `lib/format.ts` (`money()`), con moneda desde settings.

## Pruebas

- Sin suite de tests configurada aún (ver tasks/frontend).
- Al menos validar manualmente los flujos críticos: login, venta con receta, recepción de compra, anulación, impresión.

## Convenciones de código

- Prettier + ESLint (`eslint.config.js`) configurados.
- Imports ordenados (react → librerías → internos).
- Componentes de página en `pages/`, modales reutilizables en `components/pages/`.
