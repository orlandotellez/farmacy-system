# Tareas de Frontend — Feature 05: Órdenes de Compra

## Estado Actual
- **Página Compras** (`/purchases`): tabla con estados de OC, `PurchaseModal` (creación/edición con items), `ReceivePurchaseModal` (recepción con lotes), acciones Aprobar/Anular.

---

## Checklist de Tareas Frontend

### 1. Listado y Filtros
- [ ] Tabla con estado (borrador/pendiente/aprobada/recibida/anulada) y búsqueda.
- [ ] Filtro por estado y proveedor.

### 2. Creación / Edición
- [ ] `PurchaseModal`: proveedor, fecha esperada, items (medicamento, cantidad, costo).
- [ ] Total calculado en vivo.

### 3. Ciclo de Vida
- [ ] Acción "Aprobar" (con ConfirmDialog).
- [ ] `ReceivePurchaseModal`: lotes por item (número, vencimiento, cantidad, costo).
- [ ] Acción "Anular" con motivo (ConfirmDialog).

### 4. Pendientes / Mejoras
- [ ] Recepción parcial visible en el modal (items ya recibidos).
- [ ] Editar una OC aprobada (hoy solo borrador/pendiente — el backend lo limita).
- [ ] Tests del flujo de recepción.
