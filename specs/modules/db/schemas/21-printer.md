# `printer`

Impresoras térmicas ESC/POS configuradas en la tienda.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `name` | `text` | `NOT NULL` | Nombre (ej. "Caja 1") |
| `connection_type` | `PRINTER_CONN_TYPE` | `NOT NULL` | net/usb/bluetooth |
| `address` | `text` | `NOT NULL` | IP o identificador |
| `port` | `int` | | Puerto (default 9100) |
| `paper_width` | `int` | `NOT NULL` | 58 o 80 mm |
| `profile` | `PRINTER_PROFILE` | `NOT NULL` `DEFAULT 'escpos'` | escpos/star_line |
| `codepage` | `text` | `NOT NULL` `DEFAULT 'PC850'` | Codepage |
| `auto_cut` | `boolean` | `NOT NULL` `DEFAULT true` | Corte automático |
| `cut_type` | `text` | | full/partial |
| `open_cash_drawer` | `boolean` | `NOT NULL` `DEFAULT false` | Abre cajón |
| `default_copies` | `int` | `NOT NULL` `DEFAULT 1` | Copias |
| `role` | `text` | `NOT NULL` | receipt/kitchen/both |
| `is_default` | `boolean` | `NOT NULL` `DEFAULT false` | Predeterminada |
| `is_active` | `boolean` | `NOT NULL` `DEFAULT true` | Activa |
| `last_status` | `PRINTER_STATUS` | `NOT NULL` `DEFAULT 'unknown'` | Último estado |
| `last_seen_at` | `timestamptz` | | Última conexión |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Constraints & Índices

- `UNIQUE (store_id, name)`.
- `@index([store_id, is_active])`, `@index([store_id, is_default])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `printer.store_id → store.id` |
| `printer_assignment` | 1:N | `printer.id → printer_assignment.printer_id` |
| `print_job` | 1:N | `printer.id → print_job.printer_id` |

## Enums usados

- `PRINTER_CONN_TYPE`, `PRINTER_PROFILE`, `PRINTER_STATUS`
