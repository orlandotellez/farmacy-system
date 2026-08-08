# 12 · Invoices — Facturación

Emisión de facturas sobre ventas completadas con número secuencial `FAC-YYYY-000001` y anulación con motivo.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/invoices` | Sí | Listar con filtros |
| GET | `/invoices/:id` | Sí | Detalle |
| POST | `/invoices` | Sí | Emitir factura sobre una venta |
| POST | `/invoices/:id/cancel` | Sí | Anular factura con motivo |

---

## Detalle de endpoints

### GET `/api/v1/invoices`

- **Auth**: Sí

**Query params**

```
?search=&invoice_type=&from=&to=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "number": "FAC-2026-000001", "invoice_type": "simplificada", "sale_id": "uuid", "client_id": "uuid", "client_name": "María González", "client_document": "001-120390-1000A", "client_address": null, "client_phone": "8888-1000", "client_email": "maria.demo@test.com", "subtotal": 205, "total": 205, "status": "emitida", "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/invoices`

- **Auth**: Sí

**Request body**

```json
{ "sale_id": "uuid", "invoice_type": "simplificada", "client_name": "María González", "client_document": "001-120390-1000A", "client_address": null, "client_phone": "8888-1000", "client_email": "maria.demo@test.com" }
```

**Validaciones**

- `invoice_type` ∈ `ticket | simplificada | fiscal` (el frontend ofrece simplificada/fiscal para emitir).
- Solo ventas `completada` pueden facturarse.
- Una venta no puede tener dos facturas `emitida` (`409`).
- La venta debe pertenecer a la misma tienda.

**Side effects (transaccional con `SELECT ... FOR UPDATE` sobre stores)**

- Genera `number = FAC-<año>-<secuencial 6 dígitos>` según la última factura del año.
- Hereda `subtotal` y `total` de la venta.
- Registra `audit_log` (`action: "emitir"`, `module: "invoices"`).

### POST `/api/v1/invoices/:id/cancel`

- **Auth**: Sí

**Request body**

```json
{ "reason": "Error de facturación" }
```

**Side effects**

- `status: "anulada"`, `cancelled_at`, `cancelled_by`.
- Registra `audit_log` (`action: "anular"`, `module: "invoices"`).

**Validaciones**

- No se puede anular una factura ya anulada.
