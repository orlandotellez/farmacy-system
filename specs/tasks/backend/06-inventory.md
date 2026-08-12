# Tareas de Backend — Feature 06: Inventario (Lotes y Movimientos)

## Estado Actual
- **Módulo batch-inventory** (ruta `/inventory/batches`): list con filtros, getById, create/update manuales y alertas de vencimiento.
- **Módulo inventory**: movimientos con filtros, historial por producto, low-stock y create manual transaccional.

---

## Checklist de Tareas Backend

### 1. Lotes
- [x] Implementar `GET /inventory/batches` (search, medicine, supplier, expiring, expired).
- [x] Implementar `GET /inventory/batches/:id`.
- [x] Implementar `POST /inventory/batches` (entrada manual: valida fecha futura, suma stock y registra entrada).
- [x] Implementar `PUT /inventory/batches/:id` (ajuste: si cambia quantity → movimiento de inventario y sincronización de stock).
- [x] Implementar `GET /inventory/batches/expiring` y `/expired` (rutas dedicadas).

### 2. Movimientos
- [x] Implementar `GET /inventory` (búsqueda, filtros por tipo/rango/medicamento y paginación).
- [x] Implementar `GET /inventory/product/:medicineId` (historial por producto).
- [x] Implementar `GET /inventory/low-stock` (incluye agotados).
- [x] Implementar `POST /inventory` (ajuste ±, merma, salida, entrada y devolución; nunca stock negativo).

### 3. Pendientes / Mejoras
- [x] Validar que `salida|venta|merma` no exceda stock disponible, incluyendo lote cuando se especifica.
- [ ] RBAC: solo `bodeguero|admin` crean lotes y movimientos.
- [x] Refactor de batch-inventory a service+repository consistente con el resto del backend.
- [ ] Tests automatizados de FEFO, expiring/expired y consistencia de stock.
