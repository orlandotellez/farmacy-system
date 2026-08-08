# `settings`

Configuración global de la tienda. Un registro por store.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `int` | `PK` `AUTOINCREMENT` | Identificador |
| `name` | `text` | `NOT NULL` `DEFAULT 'Mi Farmacia'` | Nombre de la farmacia |
| `address` | `text` | | Dirección |
| `phone` | `text` | | Teléfono |
| `email` | `text` | | Email |
| `ruc` | `text` | | RUC |
| `opening_hours` | `text` | | Horario |
| `low_stock_threshold` | `int` | `NOT NULL` `DEFAULT 5` | Umbral stock bajo |
| `expiration_alert_days` | `int` | `NOT NULL` `DEFAULT 60` | Días de alerta de vencimiento |
| `currency` | `text` | `NOT NULL` `DEFAULT 'NIO'` | Moneda (NIO/USD/EUR/MXN) |
| `ticket_footer` | `text` | | Pie del ticket |
| `store_id` | `uuid` | `NOT NULL` `UNIQUE` FK → store | Tienda |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | 1:1 | `settings.store_id → store.id` |

## Notas

- Creado por el seed y por `register-store`.
- Consumido por el frontend via `GET /settings` y `useStoreSettings` (moneda, cabecera de ticket).
