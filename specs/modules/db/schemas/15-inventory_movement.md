# `inventory_movement`

Movimientos de inventario: entrada, salida, ajuste, venta, merma, devolución.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `medicine_id` | `uuid` | `NOT NULL` FK → medicine | Medicamento |
| `movement_type` | `text` | `NOT NULL` | entrada/salida/ajuste/venta/merma/devolucion |
| `quantity` | `int` | `NOT NULL` | Cantidad (ajuste = ±) |
| `note` | `text` | | Nota |
| `batch_id` | `uuid` | FK → batch | Lote opcional |
| `user_id` | `uuid` | `NOT NULL` FK → user | Usuario |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(medicine_id)`, `@index(batch_id)`, `@index([store_id, created_at])`, `@index([store_id, movement_type])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `inventory_movement.store_id → store.id` |
| `medicine` | N:1 | `inventory_movement.medicine_id → medicine.id` |
| `user` | N:1 | `inventory_movement.user_id → user.id` |
| `batch` | N:1 | `inventory_movement.batch_id → batch.id` |

## Notas

- Se generan automáticamente en: recepción de compra (`entrada`), venta (`venta`), anulación (`devolucion`), ajuste manual (`ajuste`).
