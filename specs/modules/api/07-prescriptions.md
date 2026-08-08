# 07 · Prescriptions — Recetas médicas

Registro, edición y **validación** de recetas médicas con autorización de cantidades por medicamento. Controla la venta de medicamentos que requieren receta.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/prescriptions` | Sí | Listar con filtros |
| GET | `/prescriptions/:id` | Sí | Detalle con items |
| POST | `/prescriptions` | Sí | Crear |
| PUT | `/prescriptions/:id` | Sí | Editar (solo pendiente) |
| POST | `/prescriptions/:id/validate` | Sí | Validar y autorizar cantidades |
| DELETE | `/prescriptions/:id` | Sí | Eliminar (anula y soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/prescriptions`

- **Auth**: Sí

**Query params**

```
?search=&status=&client_id=&page=&limit=
```

- `search`: matchea número, médico o nombre del cliente.
- `status` ∈ `pendiente | validada | expirada | anulada`.

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "number": "RX-DEMO-001", "doctor_name": "Dra. Laura Pérez", "medical_center": "Clínica Central", "issue_date": "iso", "expiry_date": "iso", "image": null, "notes": null, "status": "validada", "validated_by": "uuid", "validated_at": "iso", "client_id": "uuid", "client_name": "María González", "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/prescriptions`

- **Auth**: Sí

**Request body**

```json
{ "number": "RX-0001", "doctor_name": "Dra. Laura Pérez", "medical_center": "Clínica Central", "issue_date": "2026-08-03", "expiry_date": "2026-09-02", "image": null, "notes": null, "client_id": "uuid", "items": [{ "medicine_id": "uuid", "quantity": 1 }] }
```

**Validaciones**

- `number`: required, único por tienda.
- `items`: al menos 1; todos los `medicine_id` deben existir en la tienda.
- `client_id`: opcional (receta anónima permitida).

### POST `/api/v1/prescriptions/:id/validate`

- **Auth**: Sí (farmacéutico/admin)

**Request body**

```json
{ "authorized_items": [{ "medicine_id": "uuid", "quantity": 1 }] }
```

- Si se omite `authorized_items`, se autoriza la cantidad prescrita por defecto.

**Response 200 OK** — receta con `status: "validada"`, `validated_by`, `validated_at` e items con `authorized_quantity` y `authorized_by`.

**Validaciones**

- Solo recetas `pendiente` pueden validarse (`400` en otro caso).

### DELETE `/api/v1/prescriptions/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Setea `deleted_at` y `status: "anulada"`.

> **Relación con ventas**: `POST /sales` valida que un medicamento `requires_prescription` o `is_controlled` solo se venda contra una receta `validada`, no vencida, del mismo cliente y sin exceder `authorized_quantity` (ver 11-sales.md).
