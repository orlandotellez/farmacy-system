# Tareas de Base de Datos (DB) — Feature 05: Órdenes de Compra

## Estado Actual
- **Tablas migradas**: `purchase`, `purchase_item`.
- Unique `(store_id, number)`.
- Estados: `borrador | pendiente | aprobada | recibida | anulada`.
- Recepción parcial soportada (`received` en items).

---

## Checklist de Tareas DB

### 1. Órdenes de Compra
- [ ] Crear tabla `purchase` (number, status, supplier, expected_date, notes, total, aprobación/recepción por usuario y fecha, user_id, store_id).
- [ ] Unique `(store_id, number)`.
- [ ] Índices: `status`, `supplier_id`, `[store_id, created_at]`, `[store_id, status]`.

### 2. Items de Compra
- [ ] Crear tabla `purchase_item` (medicine_name snapshot, quantity, unit_cost, line_total).
- [ ] Campo `received` (cantidad recibida, para recepción parcial).
- [ ] Cascade delete desde `purchase`.

### 3. Pendientes / Mejoras
- [ ] CHECK `received <= quantity` (integridad de recepción).
- [ ] Índice `[store_id, supplier_id, status]` si se filtra por proveedor+estado con frecuencia.
