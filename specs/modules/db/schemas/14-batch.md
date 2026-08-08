# `batch`

Lotes de medicamentos con vencimiento. Base del control FEFO y alertas.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `batch_number` | `text` | `NOT NULL` | Número de lote |
| `medicine_id` | `uuid` | `NOT NULL` FK → medicine | Medicamento |
| `purchase_id` | `uuid` | FK → purchase | Origen: compra |
| `supplier_id` | `uuid` | FK → supplier | Proveedor |
| `manufacture_date` | `timestamptz` | | Fecha de fabricación |
| `expiry_date` | `timestamptz` | `NOT NULL` | Fecha de vencimiento |
| `initial_quantity` | `int` | `NOT NULL` `DEFAULT 0` | Cantidad inicial |
| `quantity` | `int` | `NOT NULL` `DEFAULT 0` | Cantidad actual |
| `unit_cost` | `decimal(10,2)` | | Costo unitario |
| `notes` | `text` | | Notas |
| `user_id` | `uuid` | `NOT NULL` FK → user | Usuario responsable |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(medicine_id)`, `@index(expiry_date)`, `@index([store_id, expiry_date])`, `@index([store_id, created_at])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `batch.store_id → store.id` |
| `medicine` | N:1 | `batch.medicine_id → medicine.id` |
| `purchase` | N:1 | `batch.purchase_id → purchase.id` |
| `supplier` | N:1 | `batch.supplier_id → supplier.id` |
| `user` | N:1 | `batch.user_id → user.id` |
| `inventory_movement` | 1:N | `batch.id → inventory_movement.batch_id` |
| `sale_item` | 1:N | `batch.id → sale_item.batch_id` |

## Notas

- FEFO: en venta, los lotes sin `batch_id` explícito se asignan por `expiry_date asc`.
- `expiring_soon` = `now < expiry_date <= now + expiration_alert_days` (settings, default 60).
