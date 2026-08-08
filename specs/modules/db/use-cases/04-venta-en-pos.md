# 4. Venta en POS

**Descripción**: El cajero vende medicamentos sin receta: busca, agrega al carrito y cobra.

**Actores**: Cajero, Cliente, Sistema

**Tablas involucradas**: `sales`, `sale_items`, `batches`, `medicines`, `inventory_movements`

```mermaid
sequenceDiagram
    actor C as Cajero
    participant UI as Frontend (POS)
    participant B as Backend (API)
    participant DB as PostgreSQL

    C->>UI: Busca "Panadol"
    UI->>B: GET /medicines?search=Panadol
    B-->>UI: Resultados
    C->>UI: Agrega al carrito (stock controlado)
    C->>UI: Cobra (efectivo, monto recibido)
    UI->>B: POST /sales { items, payment_method, amount_received }
    B->>DB: BEGIN TRANSACTION
    B->>DB: Valida stock (updateMany condicional)
    B->>DB: Asigna lotes FEFO (orderBy expiry_date)
    B->>DB: INSERT sales + sale_items
    B->>DB: Decrementa medicines.stock y batches.quantity
    B->>DB: INSERT inventory_movements (tipo 'venta')
    B->>DB: COMMIT
    B-->>UI: 201 venta creada (con cambio)
    UI->>UI: Imprime ticket (opcional)
    UI-->>C: "Venta registrada"
```
