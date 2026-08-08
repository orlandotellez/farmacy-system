# 04 · Suppliers — Proveedores

Gestión de proveedores con datos fiscales, contacto y soft-delete.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/suppliers` | Sí | Listar con búsqueda y filtro por activo |
| GET | `/suppliers/:id` | Sí | Detalle |
| POST | `/suppliers` | Sí | Crear |
| PUT | `/suppliers/:id` | Sí | Actualizar |
| DELETE | `/suppliers/:id` | Sí | Eliminar (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/suppliers`

- **Auth**: Sí

**Query params**

```
?search=&is_active=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "name": "Distribuidora Farmacéutica Nacional", "company": "DIFAR", "ruc": "J0310000010001", "contact_name": "María López", "email": "ventas@difar.demo", "phone": "2255-1000", "address": "Managua", "notes": null, "is_active": true, "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/suppliers`

- **Auth**: Sí

**Request body**

```json
{ "name": "Laboratorios CEN", "company": "CEN Nicaragua", "ruc": "J0310000020002", "contact_name": "Carlos Ruiz", "email": "comercial@cen.demo", "phone": "2255-2000", "address": "Managua", "notes": null, "is_active": true }
```

**Validaciones**

- `name`: required.
- `ruc`: opcional, único por tienda si se envía.

**Response 201 Created** — proveedor creado.

### PUT `/api/v1/suppliers/:id`

- **Auth**: Sí

**Request body** — campos parciales (mismos del POST).

### DELETE `/api/v1/suppliers/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Soft delete: `deleted_at = now()`. Los medicamentos asociados conservan la referencia.
