# Tareas de Frontend — Feature 06: Inventario (Lotes y Movimientos)

## Estado Actual
- **Página Inventario** (`/inventory`): movimientos con filtros, stock bajo, lotes con vencimientos, `MovementModal`.

---

## Checklist de Tareas Frontend

### 1. Movimientos
- [ ] Tabla de movimientos con filtros (tipo, rango de fechas, medicamento).
- [ ] `MovementModal`: entrada/salida/ajuste/merma con nota.

### 2. Lotes y Vencimientos
- [ ] Vista de lotes con fecha de vencimiento.
- [ ] Alertas visuales: `expiring_soon` (amarillo) y `expired` (rojo).

### 3. Stock Bajo
- [ ] Vista/indicadores de stock bajo y agotados.

### 4. Pendientes / Mejoras
- [ ] Crear lote manual desde la UI (`POST /inventory/batches`) — el modal actual cubre movimientos; integrar alta de lote con vencimiento.
- [ ] Editar/ajustar cantidad de un lote (`PUT /inventory/batches/:id` — pendiente en backend).
- [ ] Vista consolidada por medicamento (stock total + desglose por lote).
- [ ] Tests de filtros y del modal.
