# 06 · Clients — Clientes

Gestión de clientes con datos personales, de salud y su historial de compras/recetas.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/clients` | Sí | Listar con búsqueda y filtro de frecuentes |
| GET | `/clients/:id` | Sí | Detalle |
| GET | `/clients/:id/history` | Sí | Historial completo |
| POST | `/clients` | Sí | Crear |
| PUT | `/clients/:id` | Sí | Actualizar |
| DELETE | `/clients/:id` | Sí | Eliminar (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/clients`

- **Auth**: Sí

**Query params**

```
?search=&is_frequent=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "full_name": "María González", "document_type": "cedula", "document_number": "001-120390-1000A", "phone": "8888-1000", "email": "maria.demo@test.com", "address": null, "birth_date": null, "sex": null, "allergies": "Penicilina", "chronic_diseases": null, "observations": null, "is_frequent": true, "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### GET `/api/v1/clients/:id/history`

- **Auth**: Sí

**Response 200 OK**

```json
{
  "client": { "...": "" },
  "sales": [{ "id": "uuid", "total": 120, "created_at": "iso" }],
  "prescriptions": [{ "id": "uuid", "number": "RX-DEMO-001", "status": "validada" }],
  "total_spent": 120,
  "visit_count": 1,
  "frequent_products": [{ "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 2 }]
}
```

### POST `/api/v1/clients`

- **Auth**: Sí

**Request body**

```json
{ "full_name": "María González", "document_type": "cedula", "document_number": "001-120390-1000A", "phone": "8888-1000", "email": "maria.demo@test.com", "address": null, "birth_date": null, "sex": null, "allergies": "Penicilina", "chronic_diseases": null, "observations": null, "is_frequent": true }
```

**Validaciones**

- `full_name`: required.
- `document_type` ∈ `cedula | ruc | pasaporte | otro` (default `cedula`).

### PUT `/api/v1/clients/:id`

- **Auth**: Sí

**Request body** — campos parciales (mismos del POST).

### DELETE `/api/v1/clients/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Soft delete: `deleted_at = now()`.
