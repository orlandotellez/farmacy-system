# Tareas de Frontend — Feature 04: Recetas Médicas

## Estado Actual
- **Página Recetas** (`/prescriptions`): tabla con estados y búsqueda, `PrescriptionModal` CRUD con items, acción Validar.

---

## Checklist de Tareas Frontend

### 1. CRUD de Recetas
- [ ] Tabla con estado (pendiente/validada/expirada/anulada) y búsqueda.
- [ ] `PrescriptionModal`: datos de la receta + items (medicamento + cantidad).
- [ ] Edición solo en estado `pendiente` (deshabilitar si validada).

### 2. Validación
- [ ] Acción "Validar" con modal de autorización de cantidades.
- [ ] Refresco de la lista tras validar.

### 3. Pendientes / Mejoras
- [ ] Carga de imagen de la receta (foto).
- [ ] Filtro rápido por estado en la tabla.
- [ ] Vista de recetas asociadas a un cliente desde su historial.
- [ ] Tests de validación y del modal.
