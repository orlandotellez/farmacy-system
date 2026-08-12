# Tareas de Backend — Feature 09: Reportes

## Estado Actual
- **Módulo reports** (service sobre Drizzle): `GET /reports/dashboard` y `GET /reports/financial`.
- Dashboard: KPIs del día, stock bajo/agotados, expiring/expired, revenue 30d, por método de pago, top productos semana, ventas recientes.
- Financial: revenue/cost/profit/margin, por producto y laboratorio, cash flow.

---

## Checklist de Tareas Backend

### 1. Dashboard
- [x] Implementar `GET /reports/dashboard`:
  - [x] `today`: revenue, sales_count, average_ticket, items_sold.
  - [x] `low_stock_count`, `out_of_stock_count`, `expiring_soon_count`, `expired_count`.
  - [x] `revenue_30d` (serie de 30 días con ceros).
  - [x] `sales_by_payment`, `top_products_week`, `recent_sales`.

### 2. Financiero
- [x] Implementar `GET /reports/financial`:
  - [x] `total_revenue`, `total_cost`, `total_profit`, `profit_margin`.
  - [x] `by_product` (con utilidad por producto).
  - [x] `by_laboratory`.
  - [x] `cash_flow` (ingresos vs compras por día).

### 3. Pendientes / Mejoras
- [ ] Exactitud del profit: usar `purchase_price` vigente puede distorsionar histórico; evaluar snapshot `unit_cost` en sale_item.
- [ ] `expiration_alert_days` desde settings (hoy default 60; tabla de settings es Feature 11).
- [ ] Reporte por rangos personalizados con comparativa (vs período anterior).
- [ ] Exportación PDF/CSV de reportes.
- [ ] Cache corto (TTL) de dashboard para evitar recalcular en cada carga.
- [ ] Tests de las agregaciones con datos sembrados.
