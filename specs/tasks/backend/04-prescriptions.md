# Tareas de Backend — Feature 04: Recetas Médicas

## Estado Actual
- **Módulo prescriptions**: CRUD + `POST /:id/validate`.
- Validación autoriza `authorized_quantity` (por defecto la cantidad prescrita).
- Estados: `pendiente | validada | expirada | anulada`.
- Restricción de edición solo en `pendiente`.

---

## Checklist de Tareas Backend

### 1. CRUD de Recetas
- [x] Implementar `GET /prescriptions` (búsqueda, status, client_id, paginación).
- [x] Implementar `GET /prescriptions/:id` (con items).
- [x] Implementar `POST /prescriptions` (valida medicina por tienda; receta anónima permitida).
- [x] Implementar `PUT /prescriptions/:id` (solo `pendiente`).
- [x] Implementar `DELETE /prescriptions/:id` (soft delete + status `anulada`).

### 2. Validación
- [x] Implementar `POST /prescriptions/:id/validate`:
  - [x] Solo `pendiente` → `validada`.
  - [x] Autorización de cantidades (por defecto = cantidad prescrita).
  - [x] Registrar `validated_by` y `validated_at`.

### 3. Reglas de negocio en venta (integración con sales)
- [ ] En `POST /sales`: exigir receta `validada`, no vencida, misma tienda.
- [ ] Validar que la receta pertenezca al mismo `client_id`.
- [ ] Controlar `consumido + cantidad <= authorized_quantity` (acumulado sobre ventas previas).
- [ ] Bloquear venta de `requires_prescription`/`is_controlled` sin receta.

### 4. Pendientes / Mejoras
- [ ] Permiso por rol: solo `farmaceutico | admin` deben poder validar (RBAC fino).
- [ ] Marcar automáticamente recetas `pendiente → expirada` al vencer (job o validación lazy).
- [ ] Guardar imagen de receta (`image`) con almacenamiento real.
- [ ] Tests de la lógica de autorización acumulada.
