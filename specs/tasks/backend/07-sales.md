# Tareas de Backend — Feature 07: Ventas

## Estado Actual
- **Módulo sales** completo con service + repository + mappers.
- Transacción de venta con `SELECT ... FOR UPDATE`, FEFO, validación de receta, concurrencia.
- Anulación con devolución de stock, movimiento `devolucion` y auditoría.
- Reporte y revenue-trend.

---

## Checklist de Tareas Backend

### 1. Crear Venta
- [ ] Implementar `POST /sales`:
  - [ ] Validar medicamentos de la tienda y stock suficiente (con chequeo condicional de concurrencia).
  - [ ] No vender lotes vencidos.
  - [ ] Asignación FEFO de lotes (`expiry_date asc`) + soporte `batch_id` explícito.
  - [ ] Validar receta (validada, no vencida, mismo cliente, autorización acumulada).
  - [ ] Validar `amount_received >= total` en efectivo; calcular `change_given`.
  - [ ] Decrementar `medicine.stock` y `batch.quantity`.
  - [ ] Crear `sale_item` por línea y movimiento `venta` por lote.
- [ ] Implementar `GET /sales/:id` y `GET /sales` (filtros: rango, método, estado, búsqueda).

### 2. Anular Venta
- [ ] Implementar `POST /sales/:id/cancel`:
  - [ ] Bloquear si hay factura `emitida` (409).
  - [ ] Restaurar stock de medicines y batches.
  - [ ] Registrar movimiento `devolucion` por item.
  - [ ] Registrar `audit_log`.

### 3. Reportes de Ventas
- [ ] Implementar `GET /sales/report` (total, revenue, profit, ticket promedio, por método, top productos).
- [ ] Implementar `GET /sales/revenue-trend` (day/week/month con `DATE_TRUNC`).

### 4. Pendientes / Mejoras
- [ ] Descuentos e impuestos: el contrato menciona `discount_pct` y `tax_rate`; decidir si `total = subtotal - descuento + impuesto` (hoy `total = subtotal`).
- [ ] RBAC: solo `cajero|admin` crean ventas.
- [ ] Paginar/limitar `GET /sales/:id` items si el volumen crece.
- [ ] Tests de la transacción de venta (stock concurrente, FEFO, autorización de receta).
- [ ] Considerar snapshot de `unit_cost` en sale_item para `total_profit` histórico exacto.
