# `purchase_item`

Items de la orden de compra con cantidades recibidas.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `purchase_id` | `uuid` | `NOT NULL` FK → purchase (`ON DELETE CASCADE`) | Orden |
| `medicine_id` | `uuid` | `NOT NULL` FK → medicine | Medicamento |
| `medicine_name` | `text` | `NOT NULL` | Nombre (snapshot) |
| `quantity` | `int` | `NOT NULL` | Cantidad pedida |
| `unit_cost` | `decimal(10,2)` | `NOT NULL` | Costo unitario |
| `line_total` | `decimal(10,2)` | `NOT NULL` | Subtotal del item |
| `received` | `int` | `NOT NULL` `DEFAULT 0` | Cantidad recibida |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(purchase_id)`, `@index(medicine_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `purchase` | N:1 | `purchase_item.purchase_id → purchase.id` |
| `medicine` | N:1 | `purchase_item.medicine_id → medicine.id` |

## Notas

- En recepción: `received + cantidad_lote <= quantity` (valida recepción parcial).
