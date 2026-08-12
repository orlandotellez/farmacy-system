# Tareas de Base de Datos (DB) — Feature 09: Reportes

## Estado Actual
- Sin tablas dedicadas: los reportes se calculan en el backend con queries sobre `sales`, `sale_items`, `batches`, `medicines`, `purchases`, `settings`.

---

## Checklist de Tareas DB

### 1. Queries de Reportes (sin tablas nuevas)
- [x] Dashboard: agregación de ventas del día, 30 días y semana (índice `[store_id, created_at]` ayuda).
- [x] Revenue trend: `DATE_TRUNC` sobre `created_at` (índice `[store_id, created_at]`).
- [x] Stock bajo/agotados: scan sobre `medicines` con índice `active`/`store_id`.
- [x] Expiring/expired: scan sobre `batches` con índice `[store_id, expiry_date]`.

### 2. Pendientes / Mejoras
- [x] Índice `[store_id, status, created_at]` en sales (los reportes filtran por `status='completada'` + rango).
- [ ] Evaluar tabla/materialized view `sale_daily_rollup` si el volumen crece (agregación por día precalculada).
- [ ] Evaluar `total_profit` exacto: hoy se calcula con `unit_price` de items y `purchase_price` de medicine; considerar snapshot de costo en `sale_item` (`unit_cost`) para reportes históricos correctos.
