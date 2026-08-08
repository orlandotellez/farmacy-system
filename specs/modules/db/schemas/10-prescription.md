# `prescription`

Recetas médicas. Controlan la venta de medicamentos que requieren receta.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `number` | `text` | `NOT NULL` | Número de receta |
| `doctor_name` | `text` | | Nombre del médico |
| `medical_center` | `text` | | Centro médico |
| `issue_date` | `timestamptz` | | Fecha de emisión |
| `expiry_date` | `timestamptz` | | Fecha de expiración |
| `image` | `text` | | Imagen de la receta |
| `notes` | `text` | | Notas |
| `status` | `text` | `NOT NULL` `DEFAULT 'pendiente'` | pendiente/validada/expirada/anulada |
| `validated_by` | `text` | | Usuario que validó |
| `validated_at` | `timestamptz` | | Fecha de validación |
| `client_id` | `uuid` | FK → client (`ON DELETE SET NULL`) | Cliente (opcional) |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Constraints & Índices

- `UNIQUE (store_id, number)`.
- `@index(status)`, `@index(client_id)`, `@index([store_id, created_at])`, `@index([store_id, status])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `prescription.store_id → store.id` |
| `client` | N:1 | `prescription.client_id → client.id` |
| `prescription_item` | 1:N | `prescription.id → prescription_item.prescription_id` |
| `sale` | 1:N | `prescription.id → sale.prescription_id` |

## Notas

- Estados: `pendiente | validada | expirada | anulada`.
- En venta: debe estar `validada`, no vencida, misma tienda y mismo cliente; respetar `authorized_quantity` acumulado.
