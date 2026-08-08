# Tareas de Frontend — Feature 11: Configuración y Auditoría

## Estado Actual
- **Página Ajustes** (`/settings`): formulario de settings (nombre, dirección, teléfono, email, RUC, horario, moneda, umbrales, pie de ticket).
- **Página Bitácora** (`/audit`): tabla de eventos con filtros.
- Ambas admin-only.

---

## Checklist de Tareas Frontend

### 1. Ajustes
- [ ] Formulario completo de settings con guardado (`settingsApi.update`).
- [ ] Selector de moneda (NIO/USD/EUR/MXN).
- [ ] `useStoreSettings` consume la configuración para tickets y formatos.

### 2. Bitácora
- [ ] Tabla de eventos con filtros (módulo, usuario, rango de fechas).
- [ ] Paginación.

### 3. Pendientes / Mejoras
- [ ] Gestión de impresoras dentro de Ajustes (hoy `printersApi` + `PrinterLoad` existen; consolidar UI).
- [ ] Vista de sesiones activas / revocar sesiones.
- [ ] Tests de los formularios de settings.
