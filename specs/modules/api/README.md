# API Module

Documentación de la API REST de **FARMACY** organizada por features. Cada archivo cubre un dominio funcional e incluye (1) la tabla de endpoints del feature y (2) el detalle de cada endpoint: método, path, auth, request body, response, validaciones y errores.

## Base URL

```
http://localhost:3000/api/v1
```

## Convenciones transversales

- **Auth**: `Sí` requiere JWT Bearer (`Authorization: Bearer <token>`) o cookie httpOnly `accessToken` (15 min). `No` es público.
- **Content-Type**: `application/json`.
- **Errores**: se devuelven como `{ message: string }` vía `errorHandler` global.
- **Guards**: todas las rutas de negocio usan `[authGuard, storeGuard]`; las admin (users, audit-log) usan `[authGuard, adminGuard, storeGuard]`.
- **Multi-tenant**: `storeGuard` exige `storeId` en el token; todos los queries filtran por `store_id`.
- **Versionado**: prefijo `/api/v1` obligatorio (registrado en `app.ts`).

## Índice de features

| # | Feature | Descripción |
|---|---------|-------------|
| [01-auth.md](./01-auth.md) | Autenticación y sesión | Login, refresh, logout, verificación de email, reset de contraseña, registro de farmacia, sesiones |
| [02-users.md](./02-users.md) | Usuarios (admin) | CRUD de usuarios de la farmacia por rol |
| [03-categories.md](./03-categories.md) | Categorías | CRUD simple con soft-delete |
| [04-suppliers.md](./04-suppliers.md) | Proveedores | CRUD con datos fiscales y contacto |
| [05-medicines.md](./05-medicines.md) | Medicamentos | Catálogo con precios, stock y flags de receta/control |
| [06-clients.md](./06-clients.md) | Clientes | CRUD e historial de compras/recetas |
| [07-prescriptions.md](./07-prescriptions.md) | Recetas médicas | Registro, edición, validación y autorización |
| [08-purchases.md](./08-purchases.md) | Órdenes de compra | Borrador → aprobada → recibida, recepción con lotes |
| [09-batches.md](./09-batches.md) | Lotes | CRUD de lotes, expiring y expirados |
| [10-inventory.md](./10-inventory.md) | Inventario | Movimientos, stock bajo, por producto |
| [11-sales.md](./11-sales.md) | Ventas | POS, reportes, tendencias, anulación |
| [12-invoices.md](./12-invoices.md) | Facturación | Emisión secuencial y anulación |
| [13-reports.md](./13-reports.md) | Reportes | Dashboard y reporte financiero |
| [14-settings.md](./14-settings.md) | Configuración | Settings de la farmacia |
| [15-printers.md](./15-printers.md) | Impresoras | ESC/POS, test, probe, impresión de recibo |
| [16-audit.md](./16-audit.md) | Bitácora (admin) | Log de auditoría |

## Seguridad transversal

- JWT access token (15 min) + refresh token (7 días). El frontend guarda ambos en localStorage (`farmacy-token`, `farmacy-refresh-token`).
- Las rutas públicas son solo: `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/register-store`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password` y `/health`.
- `authGuard` resuelve el usuario desde cookie o Bearer y setea `request.userId`, `request.userRole`, `request.storeId`, `request.storeName`.
- `adminGuard` exige `role === "admin"`.
- Si el backend responde `403 Store context required`, el frontend fuerza un re-login limpio.

## Formato de cada archivo de feature

1. **Tabla resumen** — todos los endpoints del feature (método, path, auth, descripción).
2. **Detalle por endpoint** — para cada uno:
   - Auth requerida.
   - Request body (JSON) y/o query params.
   - Response (JSON) con código HTTP.
   - Validaciones (reglas de negocio).
   - Errores comunes.

## Convención de paginación

Todos los endpoints que devuelven listas siguen esta forma de respuesta (uniforme en toda la API):

```json
{
  "data": [/* ... */],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

- `page` parte en `1`.
- `limit` por defecto `20` (frontend usa `10` en listados admin).
- `totalPages` se calcula como `Math.max(1, Math.ceil(total / limit))`.

Excepciones que no usan este shape: `GET /auth/sessions` (devuelve `{ sessions: [...] }`), `GET /inventory/low-stock` (devuelve `{ data: [...] }` con forma específica), `GET /sales/report`, `GET /sales/revenue-trend`, `GET /reports/*`.
