# `category`

Categorías de medicamentos.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `name` | `text` | `NOT NULL` | Nombre de la categoría |
| `description` | `text` | | Descripción |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Constraints & Índices

- `UNIQUE (store_id, name)`.
- `@index(name)`, `@index(deleted_at)`, `@index(store_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `category.store_id → store.id` |
| `medicine` | 1:N | `category.id → medicine.category_id` |

## Notas

- Seed: Analgésicos y Antiinflamatorios, Antibióticos, Antigripales y Respiratorios, Gastrointestinal, Vitaminas y Suplementos, Dermatología.
