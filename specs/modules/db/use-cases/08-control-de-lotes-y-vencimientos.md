# 8. Control de Lotes y Vencimientos

**Descripción**: El bodeguero consulta lotes próximos a vencer y vencidos para gestionar alertas.

**Actores**: Bodeguero, Admin, Sistema

**Tablas involucradas**: `batches`, `medicines`, `settings`

```mermaid
sequenceDiagram
    actor Bo as Bodeguero
    participant UI as Frontend (/inventory)
    participant B as Backend (API)
    participant DB as PostgreSQL

    Bo->>UI: Abre Inventario → pestaña "Lotes"
    UI->>B: GET /inventory/batches?expiring_soon=true
    B->>DB: SELECT batches WHERE expiry_date BETWEEN now AND now+alert_days
    B-->>UI: Lotes por vencer (alert_days de settings)
    UI->>B: GET /inventory/batches?expired=true
    B->>DB: SELECT batches WHERE expiry_date <= now
    B-->>UI: Lotes vencidos (marcados en rojo)
    Bo->>UI: Crea lote manual con fecha futura
    UI->>B: POST /inventory/batches
    alt expiry_date <= now
        B-->>UI: 400 Expiry date must be a valid future date
    else OK
        B->>DB: INSERT batch + incrementa medicines.stock
    end
```
