# `client`

Clientes de la farmacia con datos personales y de salud.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `full_name` | `text` | `NOT NULL` | Nombre completo |
| `document_type` | `text` | `NOT NULL` `DEFAULT 'cedula'` | Tipo de documento (cedula/ruc/pasaporte/otro) |
| `document_number` | `text` | | Número de documento |
| `phone` | `text` | | Teléfono |
| `email` | `text` | | Email |
| `address` | `text` | | Dirección |
| `birth_date` | `timestamptz` | | Fecha de nacimiento |
| `sex` | `text` | | Sexo |
| `allergies` | `text` | | Alergias |
| `chronic_diseases` | `text` | | Enfermedades crónicas |
| `observations` | `text` | | Observaciones |
| `is_frequent` | `boolean` | `NOT NULL` `DEFAULT false` | Cliente frecuente |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `deleted_at` | `timestamptz` | | Soft-delete |

## Índices

- `@index(full_name)`, `@index(document_number)`, `@index(phone)`, `@index(store_id)`, `@index([store_id, deleted_at])`, `@index([store_id, full_name])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `client.store_id → store.id` |
| `sale` | 1:N | `client.id → sale.client_id` |
| `prescription` | 1:N | `client.id → prescription.client_id` |
| `invoice` | 1:N | `client.id → invoice.client_id` |

## Notas

- `GET /clients/:id/history` agrega ventas, recetas, total gastado y productos frecuentes.
