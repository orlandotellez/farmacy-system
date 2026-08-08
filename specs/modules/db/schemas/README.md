# Schemas — FARMACY

Esquemas de tablas de la base de datos PostgreSQL.

Cada archivo documenta una tabla con su esquema, columnas, constraints, índices y relaciones.

Los archivos están numerados por orden de creación (las tablas padre tienen el número más bajo).

## Listado de tablas

### 1. Tenancy & Auth (01–05)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 01 | `store` | [01-store.md](./01-store.md) | Tienda/farmacia — raíz multi-tenant |
| 02 | `user` | [02-user.md](./02-user.md) | Usuarios por rol |
| 03 | `session` | [03-session.md](./03-session.md) | Sesiones / refresh tokens |
| 04 | `account` | [04-account.md](./04-account.md) | Credenciales (password/OAuth) |
| 05 | `verification` | [05-verification.md](./05-verification.md) | Códigos de verificación |

### 2. Catálogo (06–08)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 06 | `category` | [06-category.md](./06-category.md) | Categorías de medicamentos |
| 07 | `supplier` | [07-supplier.md](./07-supplier.md) | Proveedores |
| 08 | `medicine` | [08-medicine.md](./08-medicine.md) | Medicamentos |

### 3. Clientes & Recetas (09–11)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 09 | `client` | [09-client.md](./09-client.md) | Clientes |
| 10 | `prescription` | [10-prescription.md](./10-prescription.md) | Recetas médicas |
| 11 | `prescription_item` | [11-prescription_item.md](./11-prescription_item.md) | Items de receta (autorización) |

### 4. Compras & Lotes (12–14)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 12 | `purchase` | [12-purchase.md](./12-purchase.md) | Órdenes de compra |
| 13 | `purchase_item` | [13-purchase_item.md](./13-purchase_item.md) | Items de compra |
| 14 | `batch` | [14-batch.md](./14-batch.md) | Lotes con vencimiento |

### 5. Inventario & Ventas (15–17)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 15 | `inventory_movement` | [15-inventory_movement.md](./15-inventory_movement.md) | Movimientos de inventario |
| 16 | `sale` | [16-sale.md](./16-sale.md) | Ventas |
| 17 | `sale_item` | [17-sale_item.md](./17-sale_item.md) | Items de venta |

### 6. Facturación & Configuración (18–20)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 18 | `invoice` | [18-invoice.md](./18-invoice.md) | Facturas |
| 19 | `settings` | [19-settings.md](./19-settings.md) | Configuración de tienda |
| 20 | `audit_log` | [20-audit_log.md](./20-audit_log.md) | Bitácora de auditoría |

### 7. Impresión (21–23)

| # | Tabla | Archivo | Descripción |
|---|-------|---------|-------------|
| 21 | `printer` | [21-printer.md](./21-printer.md) | Impresoras ESC/POS |
| 22 | `printer_assignment` | [22-printer_assignment.md](./22-printer_assignment.md) | Asignaciones por rol/categoría |
| 23 | `print_job` | [23-print_job.md](./23-print_job.md) | Cola de trabajos de impresión |

---

> **Vista completa**: [full-schema.md](./full-schema.md) contiene todas las tablas en un solo archivo.
> **SQL completo**: [query.sql](./query.sql) contiene el DDL equivalente para PostgreSQL.
