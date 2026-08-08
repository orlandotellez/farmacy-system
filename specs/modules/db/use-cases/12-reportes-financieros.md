# 12. Reportes Financieros

**Descripción**: El admin consulta el dashboard y el reporte financiero del período.

**Actores**: Admin, Sistema

**Tablas involucradas**: `sales`, `sale_items`, `purchases`, `medicines`, `batches`, `settings`

```mermaid
sequenceDiagram
    actor Ad as Admin
    participant UI as Frontend (/reports)
    participant B as Backend (API)
    participant DB as PostgreSQL

    Ad->>UI: Abre /reports (dashboard)
    UI->>B: GET /reports/dashboard
    B->>DB: Ventas del día (items, método de pago)
    B->>DB: Ventas últimos 30 días (tendencia)
    B->>DB: Ventas de la semana (top productos)
    B->>DB: medicines (low/out of stock) + batches (expiring/expired)
    B-->>UI: KPIs, gráficos y top productos
    Ad->>UI: Selecciona período → Reporte financiero
    UI->>B: GET /reports/financial?from=&to=
    B->>DB: Ventas completadas + compras recibidas del período
    B-->>UI: Utilidad, margen, por producto/laboratorio, cash flow
    UI-->>Ad: Visualiza con Recharts
```
