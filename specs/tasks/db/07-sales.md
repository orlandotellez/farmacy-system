# Tareas de Base de Datos (DB) — Feature 07: Ventas

## Estado Actual
- **Tablas migradas**: `sale`, `sale_item`.
- Métodos de pago: `efectivo | tarjeta_debito | tarjeta_credito | transferencia | pago_movil | mixto`.
- Estados: `completada | anulada` con motivo/fechas/actor.
- Asignación de lote por item (`batch_id`).

---

## Checklist de Tareas DB

### 1. Ventas
- [x] Crear tabla `sale` (subtotal, total, payment_method, amount_received, change_given, status, anulación, user/client/prescription, store).
- [x] Índices: `user_id`, `client_id`, `status`, `[store_id, created_at]`.

### 2. Items de Venta
- [x] Crear tabla `sale_item` (medicine_name snapshot, quantity, unit_price, line_total, batch_id).
- [x] Índices: `sale_id`, `medicine_id`, `batch_id`.

### 3. Índices de operación
- [x] Índice `[store_id, payment_method, created_at]` para el filtro del historial de ventas.
- [x] Índice `[store_id, prescription_id]` en sales para validar autorización acumulada de recetas.

### 4. Pendientes / Mejoras
- [ ] CHECK `payment_method IN (...)` (actualmente permanece como `text` para mantener el patrón de estados del proyecto).
- [ ] CHECK `total >= 0` y `quantity > 0`.
- [ ] Evaluar `UNIQUE (store_id, id)` de factura y la regla de una factura emitida por venta cuando se implemente `invoice`.
