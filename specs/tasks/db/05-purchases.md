# Tareas de Base de Datos (DB) — Feature 05: Órdenes de Compra

## Estado Actual
- **Tablas migradas**: `purchase`, `purchase_item`, `batch`, `inventory_movement`.
- Unique `(store_id, number)`.
- Estados: `borrador | pendiente | aprobada | recibida | anulada`.
- Recepción parcial soportada (`received` en items).

---

## Checklist de Tareas DB

### 1. Órdenes de Compra
- [x] Crear tabla `purchase` (number, status, supplier, expected_date, notes, total, aprobación/recepción por usuario y fecha, user_id, store_id).
- [x] Unique `(store_id, number)`.
- [x] Índices: `status`, `supplier_id`, `[store_id, created_at]`, `[store_id, status]`.

### 2. Items de Compra
- [x] Crear tabla `purchase_item` (medicine_name snapshot, quantity, unit_cost, line_total).
- [x] Campo `received` (cantidad recibida, para recepción parcial).
- [x] Cascade delete desde `purchase`.

### 3. Lotes y Movimientos (necesarios para la recepción)
- [x] Crear tabla `batch` (batch_number, medicine, purchase, supplier, manufacture/expiry date, initial_quantity, quantity, unit_cost, user, store).
- [x] Índices: `medicine_id`, `expiry_date`, `[store_id, expiry_date]`, `[store_id, created_at]`.
- [x] Crear tabla `inventory_movement` (medicine, movement_type `entrada|salida|ajuste|venta|merma|devolucion`, quantity, note, batch, user, store).
- [x] Índices: `medicine_id`, `batch_id`, `[store_id, created_at]`, `[store_id, movement_type]`.

### 4. Pendientes / Mejoras
- [ ] CHECK `received <= quantity` (integridad de recepción).
- [ ] Índice `[store_id, supplier_id, status]` si se filtra por proveedor+estado con frecuencia.
