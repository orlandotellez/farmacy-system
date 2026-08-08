# Tareas de Backend — Feature 08: Facturación

## Estado Actual
- **Módulo invoices** (service sobre Prisma): list, getById, create, cancel.
- Secuencia `FAC-YYYY-######` con lock de store.
- Regla: solo ventas `completada`; una factura `emitida` por venta.

---

## Checklist de Tareas Backend

### 1. Emisión
- [ ] Implementar `GET /invoices` (search, invoice_type, rango, paginación).
- [ ] Implementar `GET /invoices/:id`.
- [ ] Implementar `POST /invoices`:
  - [ ] Validar venta `completada` de la tienda.
  - [ ] Rechazar si ya existe factura `emitida` (409).
  - [ ] Generar número secuencial `FAC-<año>-<6 dígitos>` con lock de store.
  - [ ] Heredar subtotal/total de la venta.
  - [ ] Registrar `audit_log` (emitir).

### 2. Anulación
- [ ] Implementar `POST /invoices/:id/cancel`:
  - [ ] Solo facturas `emitida` → `anulada`.
  - [ ] Registrar motivo y `audit_log` (anular).

### 3. Pendientes / Mejoras
- [ ] Integración con `sales.cancel`: ya bloqueada la anulación de venta con factura emitida; verificar flujo completo "anular factura → anular venta".
- [ ] Impresión de factura en el frontend (ticket con datos fiscales).
- [ ] Reimpresión de facturas.
- [ ] RBAC: solo `cajero|admin` emiten/anulan.
- [ ] Tests de la secuencia de numeración y de la regla de una sola factura emitida.
