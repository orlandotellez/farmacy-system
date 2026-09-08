# Tareas de Backend — Feature 10: Impresoras

## Estado Actual
- **Módulo printers** (service + repository + escpos encoder/transport):
  - CRUD completo (list, getById, create, update PATCH, delete).
  - `POST /:id/test`, `POST /:id/probe`.
  - `POST /:id/print-receipt` (genera payload ESC/POS de una venta).
  - `POST /:id/set-default` (por rol).
  - `POST /send-tcp` (envío directo, respaldo web).

---

## Checklist de Tareas Backend

### 1. CRUD
- [x] Implementar CRUD de impresoras con validación de unicidad `(store_id, name)`.
- [x] Soft-delete (con regla: no borrar la única activa del rol ni la predeterminada).

### 2. Conexión y Pruebas
- [x] Implementar `POST /:id/probe` (probe de codepage; `last_status`/`last_seen_at` se actualizan al imprimir/enviar).
- [x] Implementar `POST /:id/test` (imprime texto de prueba).
- [x] Implementar `POST /send-tcp` (payload directo).

### 3. Impresión de Recibos
- [x] Implementar `POST /:id/print-receipt`:
  - [x] Buscar venta + impresora.
  - [x] Generar payload ESC/POS (58/80 mm, codepage, corte, cajón).
  - [x] Crear `print_job` y enviar; actualizar estado del job y de la impresora.
  - [ ] Reintentos (max 3) sobre el job en cola — hoy el envío es directo con un intento.

### 4. Pendientes / Mejoras
- [ ] **Cola real de impresión**: hoy el envío es directo; implementar worker/procesador de `print_jobs` pendientes.
- [ ] Soporte `star_line` profile completo en el encoder (hoy orientado a escpos).
- [ ] `printer_assignment` por categoría aún sin usar en el enrutado de impresión.
- [ ] Manejo de `out_of_paper` y reencolado automático.
- [ ] Tests de generación de payload y de transporte TCP (mock).
