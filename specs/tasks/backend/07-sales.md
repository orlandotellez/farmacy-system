# Tareas de Backend — Feature 07: Ventas

## Estado Actual
- **Módulo sales** implementado con service + repository Drizzle + mappers.
- Transacción de venta con validación de tienda, stock condicional, FEFO, lotes explícitos y soporte de stock legado sin lote.
- Validación de receta validada, vigente, del mismo cliente y autorización acumulada.
- Anulación con devolución de stock y movimientos `devolucion`.
- Reporte y revenue-trend implementados.

---

## Checklist de Tareas Backend

### 1. Crear Venta
- [x] Implementar `POST /sales`.
  - [x] Validar medicamentos de la tienda y stock suficiente con actualización condicional de concurrencia.
  - [x] No vender lotes vencidos.
  - [x] Asignación FEFO (`expiry_date asc`) + soporte `batch_id` explícito.
  - [x] Validar receta validada, vigente, del mismo cliente y autorización acumulada.
  - [x] Validar `amount_received >= total` en efectivo; calcular `change_given`.
  - [x] Decrementar `medicine.stock` y `batch.quantity`.
  - [x] Crear `sale_item` por línea y movimiento `venta` por lote o stock legado.
- [x] Implementar `GET /sales/:id` y `GET /sales` con filtros de rango, método, usuario, estado, búsqueda, monto mínimo y cantidad mínima de items.

### 2. Anular Venta
- [ ] Bloquear si hay factura `emitida` (pendiente de la Feature 08 — invoices, porque la tabla `invoice` aún no existe en Drizzle).
- [x] Implementar `POST /sales/:id/cancel`.
- [x] Restaurar stock de `medicine` y `batch`.
- [x] Registrar movimiento `devolucion` por item.
- [ ] Registrar `audit_log` (pendiente de la Feature 11 — audit, porque la tabla aún no existe en Drizzle).

### 3. Reportes de Ventas
- [x] Implementar `GET /sales/report` (total, revenue, profit, ticket promedio, por método y top products).
- [x] Implementar `GET /sales/revenue-trend` (day/week/month con `DATE_TRUNC`).

### 4. Pendientes / Mejoras
- [ ] Descuentos e impuestos: el contrato menciona `discount_pct` y `tax_rate`; hoy `total = subtotal`.
- [ ] RBAC: solo `cajero|admin` crean ventas.
- [ ] Paginar/limitar `GET /sales/:id` items si el volumen crece.
- [ ] Tests de la transacción de venta (stock concurrente, FEFO, autorización de receta).
- [ ] Considerar snapshot de `unit_cost` en `sale_item` para `total_profit` histórico exacto.
