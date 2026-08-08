# `sale_item`

Items de la venta con precio de venta y lote asignado.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `sale_id` | `uuid` | `NOT NULL` FK → sale | Venta |
| `medicine_id` | `uuid` | `NOT NULL` FK → medicine | Medicamento |
| `medicine_name` | `text` | `NOT NULL` | Nombre (snapshot) |
| `quantity` | `int` | `NOT NULL` | Cantidad |
| `unit_price` | `decimal(10,2)` | `NOT NULL` | Precio unitario |
| `line_total` | `decimal(10,2)` | `NOT NULL` | Subtotal del item |
| `batch_id` | `uuid` | FK → batch | Lote asignado (FEFO o explícito) |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(sale_id)`, `@index(medicine_id)`, `@index(batch_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `sale` | N:1 | `sale_item.sale_id → sale.id` |
| `medicine` | N:1 | `sale_item.medicine_id → medicine.id` |
| `batch` | N:1 | `sale_item.batch_id → batch.id` |

## Notas

- En anulación, el stock se devuelve al `batch_id` correspondiente.
- `batch_id` puede ser `NULL` para stock legacy sin lote (movimiento sin batch).
