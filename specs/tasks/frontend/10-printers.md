# Tareas de Frontend — Feature 10: Impresoras

## Estado Actual
- **API layer**: `printersApi` completo (list/create/update/delete/test/probe/print-receipt/set-default/send-tcp).
- **Impresión**: `print-ticket.ts` (HTML) + `tcp-printer.ts` (invoke Rust) + `PrinterLoad` (estado de carga).
- Integración POS: impresión del ticket post-venta vía `printHtml`.

---

## Checklist de Tareas Frontend

### 1. Configuración de Impresoras
- [ ] **Panel de impresoras** en Ajustes: listar, crear, editar, eliminar (los componentes API ya existen; falta la UI consolidada).
- [ ] Campos: nombre, tipo de conexión, dirección/IP, puerto, ancho de papel (58/80), perfil, corte automático, cajón, copias.
- [ ] Botón "Probar impresión" (`test`) y "Probar conexión" (`probe`) con feedback de `last_status`.

### 2. Impresión de Tickets
- [ ] Impresión HTML post-venta en el POS.
- [ ] `tcp-printer.ts` para impresión directa por TCP en Tauri.
- [ ] Seleccionar impresora por defecto y usar esa para imprimir (`set-default`).
- [ ] Reimpresión de ticket desde el historial de ventas (`print-receipt`).

### 3. Pendientes / Mejoras
- [ ] Feedback visual de estado de impresora (online/offline/out_of_paper).
- [ ] Cola de impresión con reintentos visible en la UI.
- [ ] Tests del `buildTicketHtml` y del flujo de impresión.
