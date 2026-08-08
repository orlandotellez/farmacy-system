# Tareas de Base de Datos (DB) — Feature 08: Facturación

## Estado Actual
- **Tabla migrada**: `invoice`.
- Unique `(store_id, number)`.
- Tipos: `ticket | simplificada | fiscal`.
- Estados: `emitida | anulada`.

---

## Checklist de Tareas DB

### 1. Facturas
- [ ] Crear tabla `invoice` (number, invoice_type, sale_id, cliente snapshot, subtotal, total, status, anulación, issued_by, store).
- [ ] Unique `(store_id, number)`.
- [ ] Índices: `sale_id`, `client_id`, `invoice_type`, `[store_id, created_at]`.

### 2. Pendientes / Mejoras
- [ ] Índice parcial `UNIQUE (sale_id) WHERE status = 'emitida'` → garantiza a nivel DB que una venta no tenga dos facturas emitidas.
- [ ] CHECK `invoice_type IN ('ticket','simplificada','fiscal')`.
- [ ] Índice `[store_id, number]` ya cubierto por el unique.
