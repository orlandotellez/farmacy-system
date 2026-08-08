# Backend API

Endpoints, guards y autenticación — FARMACY API.

> El detalle por endpoint está en [../api/](../api/README.md). Este archivo cubre convenciones transversales.

## Registro de rutas

`src/http/routes.ts` registra cada módulo con su prefijo:

| Módulo | Prefijo |
|--------|---------|
| auth | `/auth` |
| users | `/users` |
| categories | `/categories` |
| suppliers | `/suppliers` |
| medicines | `/medicines` |
| clients | `/clients` |
| prescriptions | `/prescriptions` |
| purchases | `/purchases` |
| inventory | `/inventory` |
| batch-inventory | `/inventory/batches` |
| sales | `/sales` |
| invoices | `/invoices` |
| reports | `/reports` |
| settings | `/settings` |
| printers | `/printers` |
| audit-log | `/audit-log` |

Todas bajo el prefijo global `/api/v1` (más `/api/v1/health`).

## Guards por tipo de ruta

| Tipo | Guard | Ejemplos |
|------|-------|----------|
| Público | — | `/auth/login`, `/auth/register-store`, `/auth/refresh`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/resend-verification`, `/health` |
| Autenticado | `[authGuard, storeGuard]` | Todas las rutas de negocio |
| Admin | `[authGuard, adminGuard, storeGuard]` | `/users`, `/audit-log` |

## Autenticación

- **Access token**: JWT firmado con `JWT_SECRET`, expira 15 min, payload `{ userId, email, role, storeId, storeName }`.
- **Refresh token**: JWT firmado con `JWT_REFRESH_SECRET`, expira 7 días, payload `{ userId }`.
- El frontend envía `Authorization: Bearer <accessToken>` y guarda ambos en localStorage.
- `/auth/refresh` rota ambos tokens (revoca el anterior).
- `/auth/logout` revoca el refresh token (sesión).

## Roles (RBAC)

| Rol | Acceso |
|-----|--------|
| `admin` | Todo + users, settings, audit-log |
| `farmaceutico` | Catálogo, recetas, inventario, reportes |
| `cajero` | POS, ventas, facturación |
| `bodeguero` | Compras, lotes, inventario |

> El RBAC por ruta aún es solo `admin` vs resto; la distinción fina por rol (farmaceutico/cajero/bodeguero) es una tarea pendiente (ver tasks).

## Health

```
GET /api/v1/health → { status: "ok", timestamp }
```

## Swagger

- Registrado solo en `NODE_ENV !== "production"`.
- Schemas generados desde zod DTOs con `toJsonSchema()`.
- UI en `/docs` (swagger-ui).
