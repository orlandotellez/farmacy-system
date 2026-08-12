# Tareas de Backend — Feature 08: Facturación

## Estado Actual
- **Módulo invoices** (service sobre Drizzle): list, getById, create, cancel.
- Secuencia `FAC-YYYY-######` con lock de store (`SELECT ... FOR UPDATE`).
- Regla: solo ventas `completada`; una factura `emitida` por venta (409).

---

## Checklist de Tareas Backend

### 1. Emisión
- [x] Implementar `GET /invoices` (search, invoice_type, rango, paginación).
- [x] Implementar `GET /invoices/:id`.
- [x] Implementar `POST /invoices`:
  - [x] Validar venta `completada` de la tienda.
  - [x] Rechazar si ya existe factura `emitida` (409).
  - [x] Generar número secuencial `FAC-<año>-<6 dígitos>` con lock de store.
  - [x] Heredar subtotal/total de la venta.
  - [ ] Registrar `audit_log` (emitir) — pendiente de la tabla `audit_log` (Feature 11).

### 2. Anulación
- [x] Implementar `POST /invoices/:id/cancel`:
  - [x] Solo facturas `emitida` → `anulada`.
  - [x] Registrar motivo.
  - [ ] Registrar `audit_log` (anular) — pendiente de la tabla `audit_log` (Feature 11).

### 3. Pendientes / Mejoras
- [x] Integración con `sales.cancel`: bloqueada la anulación de venta con factura emitida; flujo "anular factura → anular venta" verificado.
- [ ] Impresión de factura en el frontend (ticket con datos fiscales).
- [ ] Reimpresión de facturas.
- [ ] RBAC: solo `cajero|admin` emiten/anulan.
- [ ] Tests de la secuencia de numeración y de la regla de una sola factura emitida.
