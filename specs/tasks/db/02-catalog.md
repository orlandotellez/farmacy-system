# Tareas de Base de Datos (DB) — Feature 02: Catálogo (Categorías, Proveedores, Medicamentos)

## Estado Actual
- **Tablas migradas**: `category`, `supplier`, `medicine`.
- Enum `UNIT_TYPE` con 16 valores.
- Unique `(store_id, name)` en categories.
- Índices de búsqueda en medicines (nombre, genérico, principio activo, barcode).

---

## Checklist de Tareas DB

### 1. Categorías
- [x] Crear tabla `category` (name, description, store_id, deleted_at).
- [x] Unique `(store_id, name)`.
- [x] Índices: `name`, `deleted_at`, `store_id`.

### 2. Proveedores
- [x] Crear tabla `supplier` (RUC, contacto, is_active, deleted_at).
- [x] Índices: `name`, `is_active`, `[store_id, name]`, `[store_id, deleted_at]`.

### 3. Medicamentos
- [x] Crear tabla `medicine` con todos los campos farmacéuticos (barcode, internal_code, comercial/genérico, principio activo, concentración, presentación, forma, laboratorio, unit_type, unit_quantity).
- [x] Precios `DECIMAL(10,2)`: `purchase_price`, `sale_price`.
- [x] Stock + `low_stock_threshold`.
- [x] Flags regulatorios: `requires_prescription`, `is_controlled`.
- [x] Índices de búsqueda: `commercial_name`, `generic_name`, `active_ingredient`, `barcode`, `[store_id, commercial_name]`.

### 4. Pendientes / Mejoras
- [ ] Índice compuesto `[store_id, requires_prescription]` ya existe; evaluar `[store_id, is_controlled, requires_prescription]` para consultas de POS.
- [ ] Evaluar `UNIQUE (store_id, barcode)` para prevenir duplicados de código de barras por tienda (hoy validado a nivel de servicio).
- [ ] Chequeo de consistencia: `medicine.stock` == `SUM(batch.quantity)` (script de auditoría de inventario).
