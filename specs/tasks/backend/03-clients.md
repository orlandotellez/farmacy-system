# Tareas de Backend — Feature 03: Clientes

## Estado Actual
- **Módulo clients**: CRUD + `GET /clients/:id/history`.
- Historial: ventas, recetas, total gastado, visitas y productos frecuentes.
- *Nota: las agregaciones de `history` (sales/prescriptions) se poblarán con las features 07 (sales) y 04 (prescriptions); hoy el endpoint devuelve el contrato con arreglos vacíos.*

---

## Checklist de Tareas Backend

### 1. CRUD de Clientes
- [x] Implementar `GET /clients` (búsqueda + `is_frequent` + paginación).
- [x] Implementar `POST/PUT/DELETE /clients` con validaciones.
- [x] Soft-delete.

### 2. Historial
- [x] Implementar `GET /clients/:id/history`:
  - [x] `sales` del cliente. *(se puebla con feature 07)*
  - [x] `prescriptions` del cliente. *(se puebla con feature 04)*
  - [x] `total_spent`, `visit_count`. *(se pueblan con feature 07)*
  - [x] `frequent_products` (top por cantidad). *(se pueblan con feature 07)*

### 3. Pendientes / Mejoras
- [ ] Validar unicidad de `document_number` por tienda (409).
- [ ] Paginar `history.sales` y `history.prescriptions` si el volumen crece.
- [ ] Definir umbral de "cliente frecuente" (hoy flag manual).
- [ ] Tests de la agregación del historial.
