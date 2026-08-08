# `user`

Usuarios del sistema con rol y pertenencia a una tienda.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `name` | `text` | `NOT NULL` | Nombre completo |
| `email` | `text` | `NOT NULL` | Email de acceso |
| `email_verified` | `boolean` | `NOT NULL` `DEFAULT false` | Email verificado |
| `phone` | `text` | | Teléfono |
| `image` | `text` | | Avatar/foto |
| `role` | `ROLE` | `NOT NULL` `DEFAULT 'cajero'` | Rol (admin/farmaceutico/cajero/bodeguero) |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Constraints & Índices

- `UNIQUE (store_id, email)` — un email por tienda.
- `@index(email)`, `@index(role)`, `@index(store_id)`, `@index([store_id, deleted_at])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `user.store_id → store.id` |
| `session` | 1:N | `user.id → session.user_id` |
| `account` | 1:N | `user.id → account.user_id` |
| `sale` | 1:N | `user.id → sale.user_id` |
| `purchase` | 1:N | `user.id → purchase.user_id` |
| `inventory_movement` | 1:N | `user.id → inventory_movement.user_id` |
| `batch` | 1:N | `user.id → batch.user_id` |
| `audit_log` | 1:N | `user.id → audit_log.user_id` |

## Enums usados

- `ROLE`
