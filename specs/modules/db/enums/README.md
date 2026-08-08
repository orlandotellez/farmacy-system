# Enums — FARMACY

Catálogo de tipos enumerados usados en el esquema de base de datos.

Cada archivo documenta un enum con sus valores y descripciones.

## Listado

| Enum | Archivo | Tablas asociadas |
|------|---------|------------------|
| `ROLE` | [ROLE.md](./ROLE.md) | user |
| `UNIT_TYPE` | [UNIT_TYPE.md](./UNIT_TYPE.md) | medicine |
| `PRINTER_CONN_TYPE` | [PRINTER_CONN_TYPE.md](./PRINTER_CONN_TYPE.md) | printer |
| `PRINTER_PROFILE` | [PRINTER_PROFILE.md](./PRINTER_PROFILE.md) | printer |
| `PRINTER_STATUS` | [PRINTER_STATUS.md](./PRINTER_STATUS.md) | printer |

> Nota: los estados de negocio (receta, compra, venta, factura, movimiento) son `String` con valores documentados en cada schema, no enums de Postgres (para flexibilidad de migración).
