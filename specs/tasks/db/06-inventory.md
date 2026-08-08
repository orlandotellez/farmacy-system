# Tareas de Base de Datos (DB) — Feature 06: Inventario (Lotes y Movimientos)

## Estado Actual
- **Tablas migradas**: `batch`, `inventory_movement`.
- FEFO: `expiry_date` indexado.
- Tipos de movimiento: `entrada | salida | ajuste | venta | merma | devolucion`.

---

## Checklist de Tareas DB

### 1. Lotes
- [ ] Crear tabla `batch` (batch_number, medicine, purchase, supplier, fechas, initial_quantity, quantity, unit_cost, notes, user, store).
- [ ] `expiry_date` NOT NULL.
- [ ] Índices: `medicine_id`, `expiry_date`, `[store_id, expiry_date]`, `[store_id, created_at]`.

### 2. Movimientos
- [ ] Crear tabla `inventory_movement` (medicine, movement_type, quantity, note, batch_id, user, store).
- [ ] Índices: `medicine_id`, `batch_id`, `[store_id, created_at]`, `[store_id, movement_type]`.

### 3. Pendientes / Mejoras
- [ ] CHECK `quantity > 0` en movimientos (o permitir signo solo en ajuste).
- [ ] Índice `[store_id, medicine_id, created_at]` para el historial por producto (`GET /inventory/product/:id`).
- [ ] Evaluar CHECK `expiry_date > manufacture_date` en batches.
- [ ] Script de auditoría: `medicine.stock == SUM(batch.quantity) + stock_sin_lote`.
