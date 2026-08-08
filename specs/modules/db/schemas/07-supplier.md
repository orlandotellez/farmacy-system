# `supplier`

Proveedores de medicamentos.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `name` | `text` | `NOT NULL` | Nombre del proveedor |
| `company` | `text` | | Razón social |
| `ruc` | `text` | | RUC |
| `contact_name` | `text` | | Persona de contacto |
| `email` | `text` | | Email |
| `phone` | `text` | | Teléfono |
| `address` | `text` | | Dirección |
| `notes` | `text` | | Notas |
| `is_active` | `boolean` | `NOT NULL` `DEFAULT true` | Activo/inactivo |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Índices

- `@index(name)`, `@index(is_active)`, `@index(store_id)`, `@index([store_id, deleted_at])`, `@index([store_id, name])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `supplier.store_id → store.id` |
| `medicine` | 1:N | `supplier.id → medicine.supplier_id` |
| `purchase` | 1:N | `supplier.id → purchase.supplier_id` |
| `batch` | 1:N | `supplier.id → batch.supplier_id` |

## Notas

- Seed: Distribuidora Farmacéutica Nacional (DIFAR), Laboratorios CEN, Mayorista Salud y Vida.
