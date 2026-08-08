# `purchase`

Órdenes de compra con ciclo de vida y totales.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `number` | `text` | `NOT NULL` | Número de OC |
| `status` | `text` | `NOT NULL` `DEFAULT 'borrador'` | borrador/pendiente/aprobada/recibida/anulada |
| `supplier_id` | `uuid` | FK → supplier | Proveedor |
| `expected_date` | `timestamptz` | | Fecha esperada |
| `notes` | `text` | | Notas |
| `total` | `decimal(10,2)` | `NOT NULL` `DEFAULT 0` | Total calculado |
| `approved_by` | `text` | | Quién aprobó |
| `approved_at` | `timestamptz` | | Cuándo se aprobó |
| `received_by` | `text` | | Quién recibió |
| `received_at` | `timestamptz` | | Cuándo se recibió |
| `user_id` | `uuid` | `NOT NULL` FK → user | Creador |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Constraints & Índices

- `UNIQUE (store_id, number)`.
- `@index(status)`, `@index(supplier_id)`, `@index([store_id, created_at])`, `@index([store_id, status])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `purchase.store_id → store.id` |
| `supplier` | N:1 | `purchase.supplier_id → supplier.id` |
| `user` | N:1 | `purchase.user_id → user.id` |
| `purchase_item` | 1:N | `purchase.id → purchase_item.purchase_id` |
| `batch` | 1:N | `purchase.id → batch.purchase_id` |

## Notas

- `number` se genera como `OC-${Date.now()}` al crear.
- Recepción parcial: `status` permanece `aprobada` hasta que todos los items estén completos.
