# `medicine`

Medicamentos del catálogo. Entidad central con flags regulatorios.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `barcode` | `text` | | Código de barras |
| `internal_code` | `text` | | Código interno |
| `commercial_name` | `text` | `NOT NULL` | Nombre comercial |
| `generic_name` | `text` | | Nombre genérico |
| `active_ingredient` | `text` | | Principio activo |
| `concentration` | `text` | | Concentración (ej. 500 mg) |
| `presentation` | `text` | | Presentación (ej. Caja x 20) |
| `pharmaceutical_form` | `text` | | Forma farmacéutica |
| `laboratory` | `text` | | Laboratorio |
| `category_id` | `uuid` | FK → category | Categoría |
| `supplier_id` | `uuid` | FK → supplier | Proveedor |
| `unit_type` | `UNIT_TYPE` | | Tipo de unidad |
| `unit_quantity` | `int` | | Cantidad por unidad |
| `purchase_price` | `decimal(10,2)` | `NOT NULL` `DEFAULT 0` | Precio de compra |
| `sale_price` | `decimal(10,2)` | `NOT NULL` | Precio de venta |
| `stock` | `int` | `NOT NULL` `DEFAULT 0` | Stock total |
| `low_stock_threshold` | `int` | `NOT NULL` `DEFAULT 5` | Umbral de stock bajo |
| `requires_prescription` | `boolean` | `NOT NULL` `DEFAULT false` | Se vende solo con receta |
| `is_controlled` | `boolean` | `NOT NULL` `DEFAULT false` | Medicamento controlado |
| `image` | `text` | | URL/imagen |
| `active` | `boolean` | `NOT NULL` `DEFAULT true` | Activo/inactivo |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Índices

- `@index(barcode)`, `@index(commercial_name)`, `@index(generic_name)`, `@index(active_ingredient)`, `@index(category_id)`, `@index(supplier_id)`, `@index(requires_prescription)`, `@index(is_controlled)`, `@index(active)`, `@index(store_id)`, `@index([store_id, deleted_at])`, `@index([store_id, commercial_name])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `medicine.store_id → store.id` |
| `category` | N:1 | `medicine.category_id → category.id` |
| `supplier` | N:1 | `medicine.supplier_id → supplier.id` |
| `sale_item` | 1:N | `medicine.id → sale_item.medicine_id` |
| `inventory_movement` | 1:N | `medicine.id → inventory_movement.medicine_id` |
| `batch` | 1:N | `medicine.id → batch.medicine_id` |
| `purchase_item` | 1:N | `medicine.id → purchase_item.medicine_id` |
| `prescription_item` | 1:N | `medicine.id → prescription_item.medicine_id` |

## Enums usados

- `UNIT_TYPE`

## Notas

- `stock` se mantiene en sincronía con los lotes (batch.quantity) — ver flujos FEFO en use-cases.
