# 11. Emisión de Factura

**Descripción**: Se emite una factura sobre una venta completada con número secuencial.

**Actores**: Cajero, Sistema

**Tablas involucradas**: `invoices`, `sales`, `audit_logs`

```mermaid
sequenceDiagram
    actor C as Cajero
    participant UI as Frontend (/invoices)
    participant B as Backend (API)
    participant DB as PostgreSQL

    C->>UI: Venta completada → "Emitir factura" (tipo, datos cliente)
    UI->>B: POST /invoices { sale_id, invoice_type, client_* }
    B->>DB: SELECT store FOR UPDATE (lock de secuencia)
    B->>DB: Busca venta; valida status='completada'
    alt Venta ya tiene factura emitida
        B-->>UI: 409 La venta ya tiene una factura emitida
    else OK
        B->>DB: Calcula siguiente FAC-<año>-######
        B->>DB: INSERT invoices (number, montos de la venta)
        B->>DB: INSERT audit_logs (action='emitir', module='invoices')
        B-->>UI: 201 factura creada
    end
```
