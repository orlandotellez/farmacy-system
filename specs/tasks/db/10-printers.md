# Tareas de Base de Datos (DB) — Feature 10: Impresoras

## Estado Actual
- **Tablas migradas**: `printer`, `printer_assignment`, `print_job`.
- Enums `PRINTER_CONN_TYPE`, `PRINTER_PROFILE`, `PRINTER_STATUS`.
- Unique `(store_id, name)` en printers.

---

## Checklist de Tareas DB

### 1. Impresoras
- [ ] Crear tabla `printer` (conexión, dirección, puerto, papel 58/80, perfil, codepage, corte, cajón, copias, rol, default, estado).
- [ ] Enums de conexión/perfil/estado.
- [ ] Unique `(store_id, name)`.
- [ ] Índices: `[store_id, is_active]`, `[store_id, is_default]`.

### 2. Asignaciones y Jobs
- [ ] Crear tabla `printer_assignment` (printer, categoría opcional, rol, prioridad; unique `(printer_id, category_id)`).
- [ ] Crear tabla `print_job` (payload bytea, status, attempts, max_attempts, error, timestamps).
- [ ] Índices: `[printer_id, status]`, `[status, enqueued_at]`, `sale_id`.

### 3. Pendientes / Mejoras
- [ ] CHECK `paper_width IN (58, 80)`.
- [ ] CHECK `role IN ('receipt','kitchen','both')`.
- [ ] Índice `[store_id, is_default, is_active]` para resolver "la impresora por defecto" en un query.
