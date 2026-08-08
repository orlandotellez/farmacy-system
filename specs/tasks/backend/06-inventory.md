# Tareas de Backend — Feature 06: Inventario (Lotes y Movimientos)

## Estado Actual
- **Módulo batch-inventory** (ruta `/inventory/batches`): list con filtros, getById, create (entrada manual).
- **Módulo inventory**: movimientos con filtros, por producto, low-stock, create manual.

---

## Checklist de Tareas Backend

### 1. Lotes
- [ ] Implementar `GET /inventory/batches` (search, medicine, supplier, expiring, expired).
- [ ] Implementar `GET /inventory/batches/:id`.
- [ ] Implementar `POST /inventory/batches` (entrada manual: valida fecha futura, suma stock).
- [ ] Implementar `PUT /inventory/batches/:id` (ajuste: si cambia quantity → movimiento de inventario).
- [ ] Implementar `GET /inventory/batches/expiring` y `/expired` (dedicados, hoy vía query param).

### 2. Movimientos
- [ ] Implementar `GET /inventory` (filtros por tipo/rango/medicamento).
- [ ] Implementar `GET /inventory/product/:medicineId` (historial por producto).
- [ ] Implementar `GET /inventory/low-stock`.
- [ ] Implementar `POST /inventory` (ajuste ±, merma, salida; nunca stock negativo).

### 3. Pendientes / Mejoras
- [ ] Validar que `salida|venta|merma` no exceda stock disponible (hoy se valida en ventas; reforzar en movimientos manuales).
- [ ] RBAC: solo `bodeguero|admin` crean movimientos.
- [ ] Refactor de batch-inventory a service+repository consistente (ya lo es parcialmente).
- [ ] Tests de FEFO, expiring/expired y de la consistencia de stock.
