# `printer_assignment`

Asignación de impresoras por rol y categoría.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `printer_id` | `uuid` | `NOT NULL` FK → printer (`ON DELETE CASCADE`) | Impresora |
| `category_id` | `uuid` | | Categoría (null = todas) |
| `role` | `text` | `NOT NULL` | receipt/kitchen |
| `priority` | `int` | `NOT NULL` `DEFAULT 0` | Prioridad |

## Constraints & Índices

- `UNIQUE (printer_id, category_id)`.
- `@index(printer_id)`, `@index(category_id)`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `printer` | N:1 | `printer_assignment.printer_id → printer.id` |

## Notas

- Permite enrutar impresiones por categoría de producto (ej. recetas a impresora de cocina/laboratorio).
