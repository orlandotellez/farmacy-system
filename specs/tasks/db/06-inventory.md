# Tareas de Base de Datos (DB) — Feature 06: Inventario (Lotes y Movimientos)

## Estado Actual
- **Tablas ya migradas en Feature 05**: `batch`, `inventory_movement`.
- FEFO: `expiry_date` indexado.
- Tipos de movimiento: `entrada | salida | ajuste | venta | merma | devolucion`.

---

## Checklist de Tareas DB

### 1. Lotes
- [x] Crear tabla `batch` (implementada en la migración de compras: batch_number, medicine, purchase, supplier, fechas, initial_quantity, quantity, unit_cost, notes, user, store).
- [x] `expiry_date` NOT NULL.
- [x] Índices: `medicine_id`, `expiry_date`, `[store_id, expiry_date]`, `[store_id, created_at]`.

### 2. Movimientos
- [x] Crear tabla `inventory_movement` (implementada en la migración de compras: medicine, movement_type, quantity, note, batch_id, user, store).
- [x] Índices: `medicine_id`, `batch_id`, `[store_id, created_at]`, `[store_id, movement_type]`.
- [x] Índice `[store_id, medicine_id, created_at]` para el historial por producto.

### 3. Pendientes / Mejoras
- [ ] CHECK `quantity > 0` en movimientos (el ajuste permite signo positivo/negativo y se valida en la aplicación).
- [ ] Evaluar CHECK `expiry_date > manufacture_date` en batches.
- [ ] Script de auditoría: `medicine.stock == SUM(batch.quantity) + stock_sin_lote`.
