# Tareas de Base de Datos (DB) — Feature 07: Ventas

## Estado Actual
- **Tablas migradas**: `sale`, `sale_item`.
- Métodos de pago: `efectivo | tarjeta_debito | tarjeta_credito | transferencia | pago_movil | mixto`.
- Estados: `completada | anulada` con motivo/fechas/actor.
- Asignación de lote por item (`batch_id`).

---

## Checklist de Tareas DB

### 1. Ventas
- [ ] Crear tabla `sale` (subtotal, total, payment_method, amount_received, change_given, status, anulación, user/client/prescription, store).
- [ ] Índices: `user_id`, `client_id`, `status`, `[store_id, created_at]`.

### 2. Items de Venta
- [ ] Crear tabla `sale_item` (medicine_name snapshot, quantity, unit_price, line_total, batch_id).
- [ ] Índices: `sale_id`, `medicine_id`, `batch_id`.

### 3. Pendientes / Mejoras
- [ ] CHECK `payment_method IN (...)` (hoy String libre).
- [ ] CHECK `total >= 0` y `quantity > 0`.
- [ ] Índice `[store_id, payment_method, created_at]` para el filtro del historial de ventas.
- [ ] Índice `[store_id, prescription_id]` en sales (para validar autorización acumulada de recetas).
- [ ] Evaluar `UNIQUE (store_id, id)` de factura → mantener la regla "una factura emitida por venta" también en DB (índice parcial `WHERE status='emitida'`).
