# `prescription_item`

Items de receta con cantidad prescrita y cantidad autorizada tras validación.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `prescription_id` | `uuid` | `NOT NULL` FK → prescription (`ON DELETE CASCADE`) | Receta |
| `medicine_id` | `uuid` | `NOT NULL` FK → medicine | Medicamento |
| `medicine_name` | `text` | `NOT NULL` | Nombre (snapshot) |
| `quantity` | `int` | `NOT NULL` | Cantidad prescrita |
| `authorized_quantity` | `int` | `NOT NULL` `DEFAULT 0` | Cantidad autorizada |
| `authorized_by` | `text` | | Usuario que autorizó |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `@index(prescription_id)`, `@index(medicine_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `prescription` | N:1 | `prescription_item.prescription_id → prescription.id` |
| `medicine` | N:1 | `prescription_item.medicine_id → medicine.id` |

## Notas

- `authorized_quantity` se rellena en `POST /prescriptions/:id/validate`.
- La validación de venta compara `consumido_previo + cantidad_nueva <= authorized_quantity`.
