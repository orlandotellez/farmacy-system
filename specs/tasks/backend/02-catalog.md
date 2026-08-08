# Tareas de Backend — Feature 02: Catálogo (Categorías, Proveedores, Medicamentos)

## Estado Actual
- **Módulo categories**: CRUD + listado simple + paginado.
- **Módulo suppliers**: CRUD con filtro `is_active`.
- **Módulo medicines**: CRUD completo con filtros (barcode, búsqueda, categoría, proveedor, receta/control, low_stock, out_of_stock, expiring, expired).
- DTOs zod validados y Swagger generado.

---

## Checklist de Tareas Backend

### 1. Categorías
- [] Implementar `GET /categories` (simple) y `GET /categories/paginated`.
- [] Implementar CRUD con validación de unicidad por tienda (409).
- [] Soft-delete.

### 2. Proveedores
- [] Implementar CRUD con búsqueda y filtro `is_active`.
- [] Validación de unicidad de RUC por tienda (si aplica).

### 3. Medicamentos
- [] Implementar `GET /medicines` con todos los filtros y paginación.
- [] Implementar `GET /medicines/barcode/:barcode` (usado por el escáner POS).
- [] Implementar CRUD con validación de barcode único (409) y soft-delete.
- [] Mapear response con `category` y `supplier` embebidos.

### 4. Pendientes / Mejoras
- [ ] Validar `purchase_price <= sale_price` (o al menos permitido, según política del negocio).
- [ ] Normalización de búsqueda por barcode exacto vs contains (el escáner debe matchear exacto).
- [ ] Subida/almacenamiento de imagen del medicamento (`image`) — hoy campo libre.
- [ ] Tests unitarios de medicines.service (unicidad, 404, soft-delete).
- [ ] Registrar auditoría en CRUD de medicamentos (ver 11-settings-audit).
