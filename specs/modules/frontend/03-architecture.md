# Frontend Architecture

Arquitectura del frontend — FARMACY.

---

## Estructura de carpetas

```
src/
├── main.tsx                   # bootstrap + BrowserRouter
├── App.tsx                    # AuthProvider gate + AppShell + Outlet
├── routes/AppRoutes.tsx       # definición de rutas
├── components/
│   ├── layout/                # AppShell, UserMenu
│   ├── common/                # DataTable, BarcodeScanner, Toast, ConfirmDialog, ...
│   │   └── ui/                # ErrorBoundary, Toast, ConfirmDialog
│   └── pages/<feature>/       # modales CRUD por feature
├── pages/                     # 1 carpeta por pantalla (X.tsx + X.module.css)
│   ├── auth/ pos/ medicines/ categories/ clients/ prescriptions/
│   ├── suppliers/ purchases/ inventory/ sales/ invoices/ reports/
│   └── users/ settings/ audit/ not-found/
├── api/                       # client.ts + 1 archivo por recurso
├── context/                   # AuthContext, ThemeContext, AppBootstrap
├── hooks/                     # useCrudPagination, useDebounced*, useDialog, ...
├── lib/                       # fetch.ts (crossFetch), format.ts, print-ticket.ts, constants.ts, api-config.ts, simple-cache.ts, tcp-printer.ts
├── store/                     # ventaStore.ts (Zustand)
└── index.css                  # variables de tema globales
```

## Flujo de datos

```
Página → hook (useCrudPagination / state local) → api/<recurso>.ts → client.ts (api.get/post...)
      → lib/fetch.ts (crossFetch: Tauri invoke o fetch web)
      → Backend /api/v1
```

- `Paginated<T>` en `client.ts` tipa `{ data, meta }`.
- `ApiError` expone `status` y extrae `message` del backend.
- `crossFetch` detecta runtime Tauri (`__TAURI_INTERNALS__`) y usa `invoke("http_request", { args })` (Rust bypasea CORS); en web usa `fetch` nativo.
- Si el backend responde `403 Store context required`, `client.ts` limpia localStorage y redirige a `/auth`.

## Autenticación

- `AuthContext`: `user`, `store`, `loading`, `login`, `logout`, `registerStore`.
- Tokens en localStorage: `farmacy-token`, `farmacy-refresh-token`; user/store en `farmacy-user`, `farmacy-store`.
- Refresco automático: al iniciar y cada 14 min (intervalo).
- `App.tsx`: si `loading` → SplashScreen; si `!user` → Navigate `/auth`.

## Routing

| Ruta | Página |
|------|--------|
| `/auth` | Login/Registro de farmacia |
| `/pos` | Punto de venta |
| `/medicines` `/categories` `/clients` `/prescriptions` `/suppliers` | Catálogo |
| `/purchases` `/inventory` | Operaciones |
| `/sales` `/invoices` `/reports` | Ventas/Facturación/Reportes |
| `/users` `/settings` `/audit` | Administración (admin) |
| `/` | Redirige a `/reports` |
| `*` | NotFound |

## Estado de venta (Zustand `ventaStore`)

- `cart: { medicine, quantity }[]`, `paymentMethod`, `amountReceived`, `clientId`, `prescriptionId`, `checkingOut`, `currency`.
- Selectores puros: `selectSubtotal`, `selectTotal`.
- `addToCart` valida stock contra el carrito en el componente (`current >= medicine.stock`).
- Si el medicamento `requires_prescription`, se abre "Opciones de venta" automáticamente.

## Hooks clave

| Hook | Uso |
|------|-----|
| `useCrudPagination` | Paginación + búsqueda + filtros con cache namespace |
| `useDebouncedSearch` | Búsqueda con debounce |
| `useStoreSettings` | Carga settings (nombre, moneda, pie de ticket) |
| `useRoleGuard` | Restricción de rutas/páginas por rol |
| `useDialog` | Estado de modales |
