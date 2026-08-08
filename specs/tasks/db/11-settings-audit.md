# Tareas de Base de Datos (DB) — Feature 11: Configuración y Auditoría

## Estado Actual
- **Tablas migradas**: `settings`, `audit_log`.
- `settings.store_id` UNIQUE (1:1 con store).
- `audit_log` con user_name snapshot, action, module, entity_id, details, ip, store.

---

## Checklist de Tareas DB

### 1. Settings
- [ ] Crear tabla `settings` (nombre, dirección, teléfono, email, RUC, horario, low_stock_threshold, expiration_alert_days, currency, ticket_footer).
- [ ] `store_id` UNIQUE (un registro por tienda).
- [ ] Creada automáticamente en `register-store` y en el seed.

### 2. Audit Log
- [ ] Crear tabla `audit_log` (user_id/user_name, action, module, entity_id, details, ip_address, store_id).
- [ ] Índices: `user_id`, `module`, `[store_id, created_at]`.

### 3. Pendientes / Mejoras
- [ ] CHECK `currency IN ('NIO','USD','EUR','MXN')`.
- [ ] Índice `[store_id, module, created_at]` para el filtro combinado de la bitácora.
- [ ] Índice `[store_id, action]` si se filtra por acción (ej. "todas las anulaciones").
- [ ] Evaluar particionado o TTL de `audit_log` si crece mucho (retención configurable).
