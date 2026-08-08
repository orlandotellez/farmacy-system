# Tareas de Base de Datos (DB) — Feature 04: Recetas Médicas

## Estado Actual
- **Tablas migradas**: `prescription`, `prescription_item`.
- Unique `(store_id, number)`.
- Estados como `String` (`pendiente | validada | expirada | anulada`).
- Campos de validación: `validated_by`, `validated_at`, `authorized_quantity`, `authorized_by`.

---

## Checklist de Tareas DB

### 1. Recetas
- [ ] Crear tabla `prescription` (number, doctor, centro, fechas, imagen, notas, status, cliente, store).
- [ ] Unique `(store_id, number)`.
- [ ] Índices: `status`, `client_id`, `[store_id, created_at]`, `[store_id, status]`.
- [ ] FK `client_id` con `ON DELETE SET NULL` (receta anónima permitida).

### 2. Items de Receta
- [ ] Crear tabla `prescription_item` (medicine_name snapshot, quantity).
- [ ] Autorización: `authorized_quantity` (default 0) y `authorized_by`.
- [ ] Cascade delete desde `prescription`.

### 3. Pendientes / Mejoras
- [ ] Índice `[store_id, expiry_date]` sobre prescriptions (para listar recetas vencidas automáticamente).
- [ ] Considerar CHECK `status IN ('pendiente','validada','expirada','anulada')` (hoy es String libre).
- [ ] Job de marcado automático `pendiente → expirada` cuando `expiry_date < now` (opcional, backend).
