# Tareas de Backend — Feature 11: Configuración y Auditoría

## Estado Actual
- **Módulo settings**: `GET /settings` y `PUT /settings` (admin).
- **Módulo audit**: `GET /audit-log` (admin) con filtros.
- Auditoría registrada hoy solo en: anulación de venta, emisión/anulación de facturas.

---

## Checklist de Tareas Backend

### 1. Settings
- [ ] Implementar `GET /settings` (con defaults si no existe).
- [ ] Implementar `PUT /settings` (admin):
  - [ ] Validar moneda (`NIO|USD|EUR|MXN`).
  - [ ] Validar umbrales (enteros ≥ 0).

### 2. Audit Log
- [ ] Implementar `GET /audit-log` (search, user_id, module, rango, paginación).

### 3. Pendientes / Mejoras
- [ ] **Auditar todos los CRUD**: crear/actualizar/eliminar de medicines, categories, suppliers, clients, prescriptions, purchases, batches, users (helper `audit(action, module, entityId, details)`).
- [ ] Capturar `ip_address` del request en todos los eventos.
- [ ] Registrar `login`/`logout`/`login_failed` en la bitácora.
- [ ] Guard de settings: verificar que solo admin actualice (ya en rutas).
- [ ] Retención/limpieza de audit_log (job opcional).
