# 7. Orden de Compra y Recepción

**Descripción**: El bodeguero crea una OC, el admin la aprueba y el bodeguero recibe mercadería creando lotes.

**Actores**: Bodeguero, Admin, Sistema

**Tablas involucradas**: `purchases`, `purchase_items`, `batches`, `medicines`, `inventory_movements`

```mermaid
sequenceDiagram
    actor Bo as Bodeguero
    actor Ad as Admin
    participant UI as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    Bo->>UI: Crea OC (items con cantidades y costos)
    UI->>B: POST /purchases (status='borrador')
    B->>DB: INSERT purchases + purchase_items
    Ad->>UI: Aprueba la OC
    UI->>B: POST /purchases/:id/approve
    B->>DB: UPDATE purchases (status='aprobada', approved_by, approved_at)
    Bo->>UI: Recibe mercadería (lotes con vencimiento)
    UI->>B: POST /purchases/:id/receive { batches }
    B->>DB: Valida status='aprobada' y cantidades <= pedido
    B->>DB: INSERT batches (lote por item)
    B->>DB: UPDATE medicines (stock += cantidad)
    B->>DB: INSERT inventory_movements (tipo 'entrada')
    B->>DB: UPDATE purchase_items (received += cantidad)
    B->>DB: UPDATE purchases (status='recibida' si todo recibido)
    B-->>UI: 200 OC recibida
```
