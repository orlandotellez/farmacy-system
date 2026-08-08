# `sale`

Ventas del POS con métodos de pago, montos y estado.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `subtotal` | `decimal(10,2)` | `NOT NULL` | Subtotal |
| `total` | `decimal(10,2)` | `NOT NULL` | Total |
| `payment_method` | `text` | `NOT NULL` | efectivo/tarjeta_debito/tarjeta_credito/transferencia/pago_movil/mixto |
| `amount_received` | `decimal(10,2)` | | Efectivo recibido |
| `change_given` | `decimal(10,2)` | | Cambio devuelto |
| `status` | `text` | `NOT NULL` `DEFAULT 'completada'` | completada/anulada |
| `cancellation_reason` | `text` | | Motivo de anulación |
| `cancelled_at` | `timestamptz` | | Fecha de anulación |
| `cancelled_by` | `text` | | Quién anuló |
| `user_id` | `uuid` | `NOT NULL` FK → user | Cajero |
| `user_name` | `text` | | Nombre del cajero (snapshot) |
| `client_id` | `uuid` | FK → client | Cliente opcional |
| `prescription_id` | `uuid` | FK → prescription | Receta opcional |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(user_id)`, `@index(client_id)`, `@index(status)`, `@index([store_id, created_at])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `sale.store_id → store.id` |
| `user` | N:1 | `sale.user_id → user.id` |
| `client` | N:1 | `sale.client_id → client.id` |
| `prescription` | N:1 | `sale.prescription_id → prescription.id` |
| `sale_item` | 1:N | `sale.id → sale_item.sale_id` |
| `invoice` | 1:N | `sale.id → invoice.sale_id` |
| `print_job` | 1:N | `sale.id → print_job.sale_id` |

## Notas

- `total = subtotal` (sin descuentos/impuestos calculados aún; `discount_pct` y `tax_rate` están en el contrato pero no en la tabla).
- Anulación: no permitida si existe factura `emitida`.
