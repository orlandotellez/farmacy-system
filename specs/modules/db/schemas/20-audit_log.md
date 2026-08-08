# `audit_log`

Bitácora de auditoría de acciones del sistema.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `user_id` | `uuid` | FK → user | Usuario (opcional) |
| `user_name` | `text` | | Nombre (snapshot) |
| `action` | `text` | `NOT NULL` | Acción (crear/anular/emitir/…) |
| `module` | `text` | `NOT NULL` | Módulo (sales/invoices/…) |
| `entity_id` | `text` | | ID de la entidad |
| `details` | `text` | | Detalle / motivo |
| `ip_address` | `text` | | IP |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(user_id)`, `@index(module)`, `@index([store_id, created_at])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `audit_log.store_id → store.id` |
| `user` | N:1 | `audit_log.user_id → user.id` |

## Notas

- Hoy se registra en: anulación de venta, emisión/anulación de facturas.
- Pendiente: auditar CRUD de medicamentos, recetas, compras, usuarios, etc.
