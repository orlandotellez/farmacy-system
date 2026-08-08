# 05 · Medicines — Medicamentos

Catálogo de medicamentos con datos farmacéuticos, precios, stock y flags regulatorios (`requires_prescription`, `is_controlled`).

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/medicines` | Sí | Listar con filtros y búsqueda |
| GET | `/medicines/barcode/:barcode` | Sí | Buscar por código de barras |
| GET | `/medicines/:id` | Sí | Detalle con categoría y proveedor |
| POST | `/medicines` | Sí | Crear |
| PUT | `/medicines/:id` | Sí | Actualizar |
| DELETE | `/medicines/:id` | Sí | Eliminar (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/medicines`

- **Auth**: Sí

**Query params**

```
?search=&category_id=&supplier_id=&requires_prescription=&is_controlled=&low_stock=&out_of_stock=&expiring_soon=&expired=&page=&limit=
```

- `search`: matchea nombre comercial, genérico, principio activo, código interno o código de barras.
- `low_stock`: `true` → stock `> 0` y `<= low_stock_threshold`.
- `out_of_stock`: `true` → stock `=== 0`.
- `expiring_soon` / `expired`: se resuelven contra los lotes del medicamento.

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "barcode": "7501008490011", "internal_code": "MED-00011", "commercial_name": "Panadol 500 mg", "generic_name": "Paracetamol", "active_ingredient": "Paracetamol", "concentration": "500 mg", "presentation": "Caja x 20 tabletas", "pharmaceutical_form": "Tableta", "laboratory": "GSK", "category_id": "uuid", "supplier_id": "uuid", "unit_type": "caja", "unit_quantity": 20, "purchase_price": 38, "sale_price": 55, "stock": 42, "low_stock_threshold": 10, "requires_prescription": false, "is_controlled": false, "image": null, "active": true, "category": { "id": "uuid", "name": "Analgésicos" }, "supplier": { "id": "uuid", "name": "DIFAR" }, "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### GET `/api/v1/medicines/barcode/:barcode`

- **Auth**: Sí

**Response 200 OK** — medicamento completo o `204`/`null` si no existe.

> El POS usa este endpoint con el escáner de código de barras.

### POST `/api/v1/medicines`

- **Auth**: Sí

**Request body**

```json
{ "barcode": "7501008490011", "internal_code": "MED-00011", "commercial_name": "Panadol 500 mg", "generic_name": "Paracetamol", "active_ingredient": "Paracetamol", "concentration": "500 mg", "presentation": "Caja x 20 tabletas", "pharmaceutical_form": "Tableta", "laboratory": "GSK", "category_id": "uuid", "supplier_id": "uuid", "unit_type": "caja", "unit_quantity": 20, "purchase_price": 38, "sale_price": 55, "low_stock_threshold": 10, "requires_prescription": false, "is_controlled": false, "active": true }
```

**Validaciones**

- `commercial_name`: required.
- `sale_price`: required, ≥ 0.
- `barcode`: opcional; si se envía, **único por tienda** (409 si ya existe).
- `unit_type` ∈ `UNIT_TYPE` (16 valores: unidad, caja, frasco, tableta, etc.).

### PUT `/api/v1/medicines/:id`

- **Auth**: Sí

**Request body** — campos parciales. Si cambia `barcode`, se valida unicidad.

### DELETE `/api/v1/medicines/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Soft delete: `deleted_at = now()`.
