# 11 · Sales — Ventas y POS

Registro de ventas con control de stock, FEFO, recetas y anulación. Es el corazón del punto de venta.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sales` | Sí | Listar con filtros |
| GET | `/sales/:id` | Sí | Detalle con items, cliente y factura |
| POST | `/sales` | Sí | Crear venta |
| POST | `/sales/:id/cancel` | Sí | Anular venta con motivo |
| GET | `/sales/report` | Sí | Reporte del período |
| GET | `/sales/revenue-trend` | Sí | Tendencias por día/semana/mes |

---

## Detalle de endpoints

### GET `/api/v1/sales`

- **Auth**: Sí

**Query params**

```
?search=&from=&to=&payment_method=&user_id=&status=&min_amount=&min_items=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "subtotal": 205, "total": 205, "payment_method": "efectivo", "amount_received": 225, "change_given": 20, "status": "completada", "user_id": "uuid", "user_name": "Cajero Demo", "client_id": "uuid", "client_name": "María González", "prescription_id": null, "created_at": "iso", "updated_at": "iso", "items": [{ "id": "uuid", "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 2, "unit_price": 55, "line_total": 110, "batch_id": "uuid" }] }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### POST `/api/v1/sales`

- **Auth**: Sí

**Request body**

```json
{ "items": [{ "medicine_id": "uuid", "quantity": 2, "unit_price": 55, "batch_id": "uuid" }], "payment_method": "efectivo", "amount_received": 225, "client_id": "uuid", "prescription_id": null, "notes": null }
```

**Validaciones backend (transaccional, con `SELECT ... FOR UPDATE`)**

- Stock suficiente por medicamento (con control de concurrencia: si el stock cambió, error "intenta nuevamente").
- No vender lotes vencidos; asignación **FEFO** (first expiry, first out) para cantidades sin `batch_id`.
- `payment_method` ∈ `efectivo | tarjeta_debito | tarjeta_credito | transferencia | pago_movil | mixto`.
- Si `payment_method === "efectivo"` y `amount_received < total` → error `400`.
- Si `requires_prescription` o `is_controlled`:
  - Se exige `prescription_id` con status `validada`, no vencida y de la misma tienda.
  - La receta debe pertenecer al mismo `client_id`.
  - `consumido + cantidad <= authorized_quantity` por medicamento (acumulado sobre ventas completadas previas de esa receta).

**Side effects**

- Decrementa `medicine.stock` y `batch.quantity` (según asignación FEFO).
- Crea `sale_item` por línea y movimiento de inventario `venta` por lote.
- Calcula `change_given = amount_received - total`.

**Errores comunes**

- `400` — "Stock insuficiente", "La receta debe estar validada", "La cantidad autorizada fue excedida", "El efectivo recibido es insuficiente", "El lote no pertenece a esta farmacia".

### POST `/api/v1/sales/:id/cancel`

- **Auth**: Sí

**Request body**

```json
{ "reason": "Cliente devolvió el producto" }
```

**Side effects**

- `status: "anulada"`, `cancellation_reason`, `cancelled_at`, `cancelled_by`.
- Devuelve stock a `medicine` y a cada `batch` de los items.
- Registra movimiento `devolucion` por item.
- Registra `audit_log` (`action: "anular"`, `module: "sales"`).

**Validaciones**

- Si la venta tiene una **factura emitida**, no se puede anular: primero anular la factura (`409`).
- No se puede anular una venta ya anulada.

### GET `/api/v1/sales/report`

- **Auth**: Sí

**Query params** — `?from=&to=`

**Response 200 OK**

```json
{ "total_sales": 5, "total_revenue": 900, "total_profit": 300, "average_ticket": 180, "by_payment_method": { "efectivo": 600, "tarjeta_debito": 300 }, "top_products": [{ "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 10, "revenue": 550 }] }
```

### GET `/api/v1/sales/revenue-trend`

- **Auth**: Sí

**Query params** — `?start_date=&end_date=&group_by=day|week|month`

**Response 200 OK**

```json
[{ "period": "2026-08-01", "revenue": 550, "count": 3 }]
```
