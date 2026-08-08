# Tareas de Backend — Feature 09: Reportes

## Estado Actual
- **Módulo reports**: `GET /reports/dashboard` y `GET /reports/financial` (service sobre Prisma).
- Dashboard: KPIs del día, stock bajo/agotados, expiring/expired, revenue 30d, por método de pago, top productos semana, ventas recientes.
- Financial: revenue/cost/profit/margin, por producto y laboratorio, cash flow.

---

## Checklist de Tareas Backend

### 1. Dashboard
- [ ] Implementar `GET /reports/dashboard`:
  - [ ] `today`: revenue, sales_count, average_ticket, items_sold.
  - [ ] `low_stock_count`, `out_of_stock_count`, `expiring_soon_count`, `expired_count`.
  - [ ] `revenue_30d` (serie de 30 días con ceros).
  - [ ] `sales_by_payment`, `top_products_week`, `recent_sales`.

### 2. Financiero
- [ ] Implementar `GET /reports/financial`:
  - [ ] `total_revenue`, `total_cost`, `total_profit`, `profit_margin`.
  - [ ] `by_product` (con utilidad por producto).
  - [ ] `by_laboratory`.
  - [ ] `cash_flow` (ingresos vs compras por día).

### 3. Pendientes / Mejoras
- [ ] Exactitud del profit: usar `purchase_price` vigente puede distorsionar histórico; evaluar snapshot `unit_cost` en sale_item.
- [ ] Reporte por rangos personalizados con comparativa (vs período anterior).
- [ ] Exportación PDF/CSV de reportes.
- [ ] Cache corto (TTL) de dashboard para evitar recalcular en cada carga.
- [ ] Tests de las agregaciones con datos sembrados.
