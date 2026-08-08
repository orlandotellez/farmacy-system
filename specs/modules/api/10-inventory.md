# 10 · Inventory — Movimientos de inventario

Registro de movimientos (`entrada | salida | ajuste | venta | merma | devolucion`) y consultas de stock.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/inventory` | Sí | Listar movimientos con filtros |
| GET | `/inventory/product/:medicineId` | Sí | Movimientos de un medicamento |
| GET | `/inventory/low-stock` | Sí | Medicamentos con stock bajo o agotados |
| POST | `/inventory` | Sí | Crear movimiento manual |

---

## Detalle de endpoints

### GET `/api/v1/inventory`

- **Auth**: Sí

**Query params**

```
?search=&medicine_id=&movement_type=&from=&to=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "movement_type": "entrada", "quantity": 42, "note": "Stock inicial demo", "batch_id": "uuid", "user_id": "uuid", "user_name": "Bodega Demo", "created_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

### GET `/api/v1/inventory/low-stock`

- **Auth**: Sí

**Response 200 OK**

```json
{ "data": [{ "medicine_id": "uuid", "medicine_name": "Salbutamol Inhalador", "stock": 9, "low_stock_threshold": 4 }], "count": 1 }
```

### POST `/api/v1/inventory`

- **Auth**: Sí (bodeguero/admin)

**Request body**

```json
{ "medicine_id": "uuid", "movement_type": "ajuste", "quantity": 5, "note": "Conteo físico", "batch_id": null }
```

**Validaciones**

- `movement_type` ∈ `entrada | salida | ajuste | venta | merma | devolucion`.
- `ajuste` = ±cantidad (incrementa o decrementa stock según signo).
- El stock nunca puede quedar negativo.

**Side effects**

- Actualiza `medicine.stock` y registra el movimiento con `user_id` y `store_id`.
