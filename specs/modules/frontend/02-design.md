# Frontend Design

Identidad visual — FARMACY.

---

## Tema claro/oscuro

- Variables CSS globales en `src/index.css` con `[data-theme="dark"]` (ThemeContext).
- `ThemeContext` persiste la preferencia y el botón vive en el sidebar (`AppShell`) y drawer móvil.
- Sistema de badges globales: `.statusBadge` con variantes (receta, controlado, stock bajo/agotado, estados de receta/compra).

## Paleta (referencia)

| Uso | Nota |
|-----|------|
| Fondo / superficies | Variables `--bg`, `--surface`, `--border` en index.css |
| Texto | `--text`, `--muted-foreground` |
| Acento primario | botones `primaryButton` en cada página |
| Semánticos | `--success`, `--danger`, `--warning` (stock bajo, vencidos) |
| Badge receta | Azul celeste (`#0ea5e9`/`#0284c7`) — identidad "Rx" |

## Tipografía

- Sistema (sans-serif) con `font-family` definida en `index.css`.
- Monospace para tickets (print-ticket.ts).

## Componentes reutilizables (`src/components/`)

| Componente | Uso |
|------------|-----|
| `common/DataTable` | Tabla paginada con columnas tipadas, skeleton, row click, editar/eliminar |
| `common/TableSkeleton` / `Skeleton` | Loading states |
| `common/BarcodeScanner` | Modal con cámara para códigos de barras |
| `common/PrinterLoad` | Estado de carga de impresoras |
| `common/ui/Toast` | Notificaciones `toast(msg, "success"|"error")` |
| `common/ui/ConfirmDialog` | Confirmación de acciones destructivas |
| `common/ui/ErrorBoundary` | Captura errores de render |
| `layout/AppShell` | Sidebar (grupos), drawer móvil, UserMenu, tema |
| `pages/<feature>/<Feature>Modal` | Modales CRUD por entidad |

## Convenciones de página

Cada página sigue el patrón:

```
<header> (eyebrow + título + subtítulo + acciones) [filtros]
[tabla / contenido principal] [modales] [ConfirmDialog]
```

- Header con `h1` + contador total + botón primario ("Nuevo X").
- Filtros: buscador con icono, selects, botón "Limpiar".
- Errores en banner con botón "Reintentar".
- Estados vacíos con mensaje claro y contextual.

## Detalles de interacción

- Hover states en filas de tabla y resultados del POS.
- Transiciones suaves en drawer móvil y modales.
- Focus visible en inputs/selects para accesibilidad.
- `useSelectAllNumberInputs`: selecciona todo el contenido al enfocar inputs numéricos.
