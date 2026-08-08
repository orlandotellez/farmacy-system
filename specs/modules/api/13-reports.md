# 13 · Reports — Reportes

Dashboard con KPIs del día y reporte financiero del período. Alimentan la página `/reports` con gráficos (Recharts).

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/dashboard` | Sí | KPIs del día + tendencias |
| GET | `/reports/financial` | Sí | Reporte financiero del período |

---

## Detalle de endpoints

### GET `/api/v1/reports/dashboard`

- **Auth**: Sí

**Response 200 OK**

```json
{
  "today": { "revenue": 1200, "sales_count": 8, "average_ticket": 150, "items_sold": 24 },
  "low_stock_count": 2,
  "out_of_stock_count": 1,
  "expiring_soon_count": 3,
  "expired_count": 0,
  "revenue_30d": [{ "period": "2026-08-06", "revenue": 1200 }],
  "sales_by_payment": [{ "method": "efectivo", "count": 6, "total": 900 }],
  "top_products_week": [{ "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 12, "revenue": 660 }],
  "recent_sales": [{ "id": "uuid", "subtotal": 205, "total": 205, "payment_method": "efectivo", "status": "completada", "user_id": "uuid", "user_name": "Cajero Demo", "client_id": "uuid", "client_name": "María González", "prescription_id": null, "created_at": "iso", "updated_at": "iso" }]
}
```

**Cálculos**

- `today.*`: sobre ventas `completada` del día.
- `low_stock_count`: `0 < stock <= low_stock_threshold`; `out_of_stock_count`: `stock === 0`.
- `expiring_soon_count`: lotes con `now < expiry_date <= now + expiration_alert_days` (settings, default 60).
- `expired_count`: lotes con `expiry_date <= now`.
- `revenue_30d`: serie de 30 días (ceros incluidos).
- `recent_sales`: últimas 8 ventas.

### GET `/api/v1/reports/financial`

- **Auth**: Sí

**Query params** — `?from=&to=`

**Response 200 OK**

```json
{
  "total_revenue": 9000,
  "total_cost": 5400,
  "total_profit": 3600,
  "profit_margin": 40,
  "by_product": [{ "medicine_id": "uuid", "medicine_name": "Panadol 500 mg", "quantity": 50, "revenue": 2750, "profit": 1650 }],
  "by_laboratory": [{ "laboratory": "GSK", "revenue": 2750, "profit": 1650 }],
  "cash_flow": [{ "period": "2026-08-06", "revenue": 1200, "purchases": 760 }]
}
```

**Cálculos**

- `total_cost`: suma `purchase_price × quantity` de los items vendidos.
- `profit_margin`: `(revenue - cost) / revenue × 100`.
- `by_product` / `by_laboratory`: ordenados por utilidad descendente.
- `cash_flow`: agrega ventas (completadas) y compras (recibidas) por día.
