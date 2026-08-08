# 5. Venta con Receta

**Descripción**: El cajero vende un medicamento que requiere receta usando una receta validada.

**Actores**: Cajero, Cliente, Sistema

**Tablas involucradas**: `sales`, `prescriptions`, `prescription_items`, `sale_items`, `medicines`

```mermaid
sequenceDiagram
    actor C as Cajero
    participant UI as Frontend (POS)
    participant B as Backend (API)
    participant DB as PostgreSQL

    C->>UI: Busca "Amoxicilina" (tag "Receta")
    C->>UI: Agrega al carrito → se abre "Opciones de venta"
    C->>UI: Selecciona cliente y receta validada
    UI->>B: POST /sales { items, prescription_id, client_id }
    B->>DB: SELECT prescription FOR UPDATE (lock)
    B->>DB: Verifica status='validada' y expiry_date > now
    B->>DB: Verifica prescription.client_id = client_id
    B->>DB: Suma cantidades ya vendidas con esa receta
    alt authorized_quantity excedida
        B-->>UI: 400 La cantidad autorizada fue excedida
    else OK
        B->>DB: Crea venta, decrementa stock/lotes
        B-->>UI: 201 venta creada
    end
```
