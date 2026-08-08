# Tareas de Backend — Feature 03: Clientes

## Estado Actual
- **Módulo clients**: CRUD + `GET /clients/:id/history`.
- Historial: ventas, recetas, total gastado, visitas y productos frecuentes.

---

## Checklist de Tareas Backend

### 1. CRUD de Clientes
- [] Implementar `GET /clients` (búsqueda + `is_frequent` + paginación).
- [] Implementar `POST/PUT/DELETE /clients` con validaciones.
- [] Soft-delete.

### 2. Historial
- [] Implementar `GET /clients/:id/history`:
  - [] `sales` del cliente.
  - [] `prescriptions` del cliente.
  - [] `total_spent`, `visit_count`.
  - [] `frequent_products` (top por cantidad).

### 3. Pendientes / Mejoras
- [ ] Validar unicidad de `document_number` por tienda (409).
- [ ] Paginar `history.sales` y `history.prescriptions` si el volumen crece.
- [ ] Definir umbral de "cliente frecuente" (hoy flag manual).
- [ ] Tests de la agregación del historial.
