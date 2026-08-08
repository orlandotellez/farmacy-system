# 09 · Batches — Lotes

Gestión de lotes con vencimientos, entrada manual y alertas de expiración. Prefijo de ruta: `/inventory/batches`.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/inventory/batches` | Sí | Listar con filtros |
| GET | `/inventory/batches/:id` | Sí | Detalle |
| POST | `/inventory/batches` | Sí | Crear (entrada manual, suma stock) |
| PUT | `/inventory/batches/:id` | Sí | Actualizar (ajuste de cantidad genera movimiento) |
| GET | `/inventory/batches/expiring` | Sí | Lotes próximos a vencer |
| GET | `/inventory/batches/expired` | Sí | Lotes vencidos |

---

## Detalle de endpoints

### GET `/api/v1/inventory/batches`

- **Auth**: Sí

**Query params**

```
?search=&medicine_id=&supplier_id=&expiring_soon=&expired=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "batch_number": "INICIAL-00011", "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "purchase_id": null, "supplier_id": "uuid", "supplier_name": "DIFAR", "manufacture_date": null, "expiry_date": "2027-08-06T00:00:00.000Z", "quantity": 42, "unit_cost": 38, "notes": null, "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/inventory/batches`

- **Auth**: Sí (bodeguero)

**Request body**

```json
{ "batch_number": "LOTE-MAN-01", "medicine_id": "uuid", "purchase_id": null, "supplier_id": "uuid", "manufacture_date": "2026-01-01", "expiry_date": "2027-01-01", "quantity": 10, "unit_cost": 38, "notes": null }
```

**Validaciones**

- `expiry_date` debe ser fecha futura válida (`400` si no).
- El medicamento debe existir en la tienda.

**Side effects**

- Crea el lote e **incrementa** `medicine.stock`.
- (El seed registra además un movimiento `entrada`.)

### PUT `/api/v1/inventory/batches/:id`

- **Auth**: Sí

**Request body** — `{ batch_number?, expiry_date?, quantity?, notes? }`.

**Side effects**

- Si cambia `quantity`, genera un movimiento de inventario por la diferencia.

### GET `/api/v1/inventory/batches/expiring`

- **Auth**: Sí

**Response 200 OK** — lotes con `expiry_date` en `(now, now + expiration_alert_days]`.

### GET `/api/v1/inventory/batches/expired`

- **Auth**: Sí

**Response 200 OK** — lotes con `expiry_date <= now`.
