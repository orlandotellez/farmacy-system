# Tareas de Frontend — Feature 02: Catálogo (Categorías, Proveedores, Medicamentos)

## Estado Actual
- **Página Medicamentos** (`/medicines`): tabla paginada, filtros (búsqueda, categoría, estado, stock), `MedicineModal` CRUD completo, badges Activo/Receta/Controlado, ConfirmDialog.
- **Página Categorías** (`/categories`): listado + `CategoryModal`.
- **Página Proveedores** (`/suppliers`): tabla CRUD + `SupplierModal`.

---

## Checklist de Tareas Frontend

### 1. Medicamentos
- [ ] Tabla con columnas: medicamento, código, categoría, precio, stock (color por umbral), estado.
- [ ] Filtros: búsqueda, categoría, estado activo, stock bajo/agotado.
- [ ] `MedicineModal` con todos los campos farmacéuticos y flags (`requires_prescription`, `is_controlled`).
- [ ] `cacheClear("medicines")` + refresh tras mutaciones.
- [ ] Soft-delete con ConfirmDialog.

### 2. Categorías y Proveedores
- [ ] CRUD de categorías (modal simple).
- [ ] CRUD de proveedores (modal con datos fiscales y contacto).

### 3. Pendientes / Mejoras
- [ ] Previsualización/carga de imagen del medicamento.
- [ ] Filtro "Requiere receta" / "Controlado" en la tabla de medicamentos.
- [ ] Vista de stock por lote desde el medicamento (integrar batches).
- [ ] Tests de los modales y filtros.
