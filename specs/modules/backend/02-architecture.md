# Backend Architecture

Arquitectura del backend — FARMACY API.

## Vista general

```
src/
├── app.ts                      # buildApp(): registra plugins, routes, error handler
├── server.ts                   # entrypoint: listen(PORT)
├── http/
│   ├── routes.ts               # registra todos los módulos con prefix /api/v1
│   └── swagger-schema.ts       # toJsonSchema(): zod → JSON Schema
├── config/
│   ├── env.ts                  # validación de env vars con zod (fail-fast)
│   ├── prisma.ts               # PrismaClient singleton
│   ├── logger.ts / redis.ts / cors.ts / swagger.ts / error-handler.ts
├── core/
│   ├── errors/AppError.ts      # clases de error tipadas
│   ├── guard/auth.guard.ts     # authGuard + adminGuard
│   ├── guard/store.guard.ts    # storeGuard (multi-tenant)
│   └── utils/                  # crypto, cookie, auth, token
├── scripts/
│   ├── seed.ts                 # datos demo destructivos (dev)
│   └── migrate-multi-tenant.ts # utilidad de migración de tiendas
└── modules/
    └── <feature>/
        ├── domain/             # types, interfaces, entities (puros)
        ├── application/        # servicios (lógica de negocio)
        ├── presentation/       # controller, routes, dto (zod)
        └── infrastructure/     # repositorios Prisma (+ mappers)
```

## Capas por módulo

| Capa | Responsabilidad | Ejemplo (medicines) |
|------|-----------------|---------------------|
| **domain** | Tipos y contratos sin dependencias | `IMedicineRepository`, `IMedicineResponse`, `CreateMedicineData` |
| **application** | Lógica de negocio, mapeo, reglas | `createMedicineService(repository)` valida barcode único, soft-delete |
| **presentation** | HTTP: rutas, guards, DTOs, controller | `medicines.routes.ts` con `preHandler: [authGuard, storeGuard]` |
| **infrastructure** | Acceso a datos con Prisma | `medicines.prisma.repository.ts` |

## Flujo de una request

```
Request → routes.ts (prefix /api/v1) → [authGuard, storeGuard]
       → DTO zod (parse del body/query) → controller → service → repository (Prisma)
       → response mapeado → reply.send()
```

- `authGuard` resuelve `userId / userRole / storeId / storeName` desde cookie o Bearer.
- `storeGuard` garantiza que exista `storeId` (403 si no) — es el pilar del multi-tenant.
- `errorHandler` traduce `ZodError`, `AppError` y errores desconocidos a `{ message }` con el status correcto.

## Multi-tenancy

- El token JWT incluye `storeId` y `storeName`.
- Todos los repositorios filtran por `store_id` en cada query (`findFirst`, `findMany`, `updateMany`, etc.).
- `storeGuard` rechaza requests sin contexto de tienda.
- Tablas de negocio (medicine, sale, batch, prescription, purchase, ...) tienen `store_id` + índices compuestos.

## Transacciones y concurrencia

- Las operaciones críticas usan `prisma.$transaction`:
  - **Ventas**: `SELECT ... FOR UPDATE` sobre la receta; chequeo de stock con `updateMany` condicional (si el count != 1 → "el stock cambió, intenta nuevamente").
  - **Anulación de venta**: lock de la store, chequeo de facturas emitidas, restauración de stock y lotes.
  - **Recepción de compra**: creación de lotes + incremento de stock + movimientos.
  - **Facturas**: lock de store + secuencia `FAC-YYYY-######`.
- Asignación de lotes en ventas: **FEFO** (orderBy `expiry_date asc`) con soporte de `batch_id` explícito y stock legacy sin lote.

## Errores

| Clase | HTTP | Uso |
|-------|------|-----|
| `BadRequestError` | 400 | Validación de negocio |
| `UnauthorizedError` | 401 | Sin autenticación |
| `ForbiddenError` | 403 | Sin permiso / sin store context |
| `NotFoundError` | 404 | Entidad no existe |
| `ConflictError` | 409 | Duplicados / conflictos de estado |
