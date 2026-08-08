# 10. Anulación de Venta

**Descripción**: Se anula una venta, devolviendo stock a medicamentos y lotes.

**Actores**: Admin/Cajero, Sistema

**Tablas involucradas**: `sales`, `sale_items`, `batches`, `medicines`, `invoices`, `inventory_movements`, `audit_logs`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant UI as Frontend (/sales)
    participant B as Backend (API)
    participant DB as PostgreSQL

    U->>UI: Detalle de venta → "Anular" + motivo
    UI->>B: POST /sales/:id/cancel { reason }
    B->>DB: SELECT store FOR UPDATE (lock)
    B->>DB: Busca venta + items + invoices
    alt Tiene factura emitida
        B-->>UI: 409 Anula primero la factura
    else OK
        B->>DB: UPDATE sales (status='anulada', reason, cancelled_at/by)
        loop Por cada item
            B->>DB: UPDATE medicines (stock += qty)
            B->>DB: UPDATE batches (quantity += qty)
            B->>DB: INSERT inventory_movements (tipo 'devolucion')
        end
        B->>DB: INSERT audit_logs (action='anular', module='sales')
        B-->>UI: 200 venta anulada
    end
```
