# Tareas de Frontend — Feature 08: Facturación

## Estado Actual
- **Página Facturas** (`/invoices`): listado con tipo/estado, `InvoiceModal` (emitir sobre venta), `InvoiceDetailModal` (detalle + anulación).

---

## Checklist de Tareas Frontend

### 1. Emisión
- [ ] `InvoiceModal`: seleccionar venta, tipo (simplificada/fiscal), datos del cliente.
- [ ] Manejo de errores (venta ya facturada, venta no completada).

### 2. Listado y Detalle
- [ ] Tabla con tipo y estado (emitida/anulada).
- [ ] `InvoiceDetailModal` con montos y datos fiscales.

### 3. Anulación
- [ ] Acción anular con motivo (ConfirmDialog).

### 4. Pendientes / Mejoras
- [ ] Impresión de la factura (ticket con datos fiscales) usando el sistema de tickets.
- [ ] Reimpresión de facturas.
- [ ] Emitir factura directamente desde la venta (`SaleDetailModal` → "Facturar").
- [ ] Tests del flujo de emisión.
