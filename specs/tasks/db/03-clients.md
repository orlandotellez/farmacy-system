# Tareas de Base de Datos (DB) — Feature 03: Clientes

## Estado Actual
- **Tabla migrada**: `client`.
- Soft-delete y `is_frequent`.
- Índices de búsqueda por nombre, documento y teléfono.

---

## Checklist de Tareas DB

### 1. Tabla de Clientes
- [ ] Crear tabla `client` (full_name, document_type, document_number, phone, email, address, birth_date, sex).
- [ ] Datos de salud: `allergies`, `chronic_diseases`, `observations`.
- [ ] `is_frequent`, `store_id`, `deleted_at`.
- [ ] Índices: `full_name`, `document_number`, `phone`, `[store_id, full_name]`.

### 2. Pendientes / Mejoras
- [ ] Evaluar `UNIQUE (store_id, document_number)` cuando `document_number` no es null (evitar duplicados de cliente).
- [ ] Índice sobre `[store_id, is_frequent]` si se filtra por frecuentes con frecuencia.
- [ ] Considerar tabla `client_visits` o derivar `visit_count` desde sales (hoy se calcula en memoria).
