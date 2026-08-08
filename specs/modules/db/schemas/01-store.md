# `store`

Tienda / farmacia. Raíz del modelo multi-tenant: todos los datos de negocio cuelgan de `store`.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `name` | `text` | `NOT NULL` | Nombre de la farmacia |
| `address` | `text` | | Dirección |
| `phone` | `text` | | Teléfono |
| `ruc` | `text` | | RUC |
| `email` | `text` | | Email |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `name`

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `user` | 1:N | `store.id → user.store_id` |
| `medicine` | 1:N | `store.id → medicine.store_id` |
| `category` | 1:N | `store.id → category.store_id` |
| `supplier` | 1:N | `store.id → supplier.store_id` |
| `client` | 1:N | `store.id → client.store_id` |
| `prescription` | 1:N | `store.id → prescription.store_id` |
| `purchase` | 1:N | `store.id → purchase.store_id` |
| `batch` | 1:N | `store.id → batch.store_id` |
| `inventory_movement` | 1:N | `store.id → inventory_movement.store_id` |
| `sale` | 1:N | `store.id → sale.store_id` |
| `invoice` | 1:N | `store.id → invoice.store_id` |
| `audit_log` | 1:N | `store.id → audit_log.store_id` |
| `settings` | 1:1 | `store.id → settings.store_id` |
| `printer` | 1:N | `store.id → printer.store_id` |

## Notas

- El seed crea "Farmacia Demo Salud".
- `POST /auth/register-store` crea una tienda + admin + settings en una transacción.
