# `print_job`

Cola de trabajos de impresión con reintentos.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `printer_id` | `uuid` | `NOT NULL` FK → printer (`ON DELETE CASCADE`) | Impresora |
| `sale_id` | `uuid` | FK → sale | Venta (opcional) |
| `payload` | `bytea` | `NOT NULL` | Payload ESC/POS |
| `status` | `text` | `NOT NULL` | pending/sent/success/failed |
| `attempts` | `int` | `NOT NULL` `DEFAULT 0` | Intentos |
| `max_attempts` | `int` | `NOT NULL` `DEFAULT 3` | Máximo de intentos |
| `error_msg` | `text` | | Mensaje de error |
| `enqueued_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `sent_at` | `timestamptz` | | Cuándo se envió |
| `finished_at` | `timestamptz` | | Cuándo terminó |

## Índices

- `@index([printer_id, status])`, `@index([status, enqueued_at])`, `@index(sale_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `printer` | N:1 | `print_job.printer_id → printer.id` |
| `sale` | N:1 | `print_job.sale_id → sale.id` |

## Notas

- El envío vía `/printers/:id/print-receipt` encola el trabajo y ejecuta con reintentos.
- El frontend Tauri también puede imprimir directo (Rust) sin pasar por la cola.
