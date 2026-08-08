# 08 · Purchases — Órdenes de compra

Ciclo de vida de compras: `borrador → pendiente → aprobada → recibida | anulada`. La recepción crea lotes, incrementa stock y registra movimientos.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/purchases` | Sí | Listar con filtros |
| GET | `/purchases/:id` | Sí | Detalle con items |
| POST | `/purchases` | Sí | Crear (status borrador) |
| PUT | `/purchases/:id` | Sí | Editar (solo borrador/pendiente) |
| POST | `/purchases/:id/approve` | Sí | Aprobar |
| POST | `/purchases/:id/receive` | Sí | Recibir mercadería (crea lotes) |
| POST | `/purchases/:id/cancel` | Sí | Anular |

---

## Detalle de endpoints

### GET `/api/v1/purchases`

- **Auth**: Sí

**Query params**

```
?search=&status=&supplier_id=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "number": "OC-1234567890", "status": "aprobada", "supplier_id": "uuid", "supplier_name": "DIFAR", "expected_date": null, "notes": null, "total": 1900, "approved_by": "uuid", "approved_at": "iso", "received_by": null, "received_at": null, "user_id": "uuid", "user_name": "Bodega Demo", "created_at": "iso", "updated_at": "iso", "items": [{ "id": "uuid", "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 20, "unit_cost": 38, "line_total": 760, "received": 20 }] }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/purchases`

- **Auth**: Sí

**Request body**

```json
{ "supplier_id": "uuid", "expected_date": "2026-08-20", "notes": null, "items": [{ "medicine_id": "uuid", "quantity": 20, "unit_cost": 38 }] }
```

**Validaciones**

- `items`: al menos 1; todos los `medicine_id` deben existir en la tienda.
- `number` se genera automáticamente (`OC-${Date.now()}`).
- `total` se calcula como `Σ quantity × unit_cost`.

### POST `/api/v1/purchases/:id/approve`

- **Auth**: Sí

**Validaciones**

- Solo `borrador | pendiente` pueden aprobarse.

**Response 200 OK** — compra con `status: "aprobada"`, `approved_by`, `approved_at`.

### POST `/api/v1/purchases/:id/receive`

- **Auth**: Sí (bodeguero)

**Request body**

```json
{ "batches": [{ "batch_number": "LOTE-01", "medicine_id": "uuid", "manufacture_date": "2026-01-01", "expiry_date": "2027-01-01", "quantity": 20, "unit_cost": 38 }] }
```

**Validaciones**

- Solo compras `aprobada` pueden recibirse.
- Cada `medicine_id` debe ser parte de la orden y `item.received + quantity <= item.quantity` (soporta recepción parcial).
- `expiry_date` debe ser una fecha futura válida.

**Side effects (transaccional)**

- Crea un `batch` por item recibido.
- Incrementa `medicine.stock`.
- Registra movimiento de inventario `entrada` (`note: "Recepción <number>"`).
- Incrementa `purchase_item.received`.
- Si todos los items quedaron recibidos → `status: "recibida"`, `received_by`, `received_at`; si no, permanece `aprobada`.

### POST `/api/v1/purchases/:id/cancel`

- **Auth**: Sí

**Validaciones**

- No se puede anular una compra `recibida`.

**Response 200 OK** — `{ message: "Purchase cancelled successfully" }`.
