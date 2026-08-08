# 9. Movimiento de Inventario

**Descripción**: Se registra un ajuste, merma o salida manual de inventario.

**Actores**: Bodeguero, Sistema

**Tablas involucradas**: `inventory_movements`, `medicines`

```mermaid
sequenceDiagram
    actor Bo as Bodeguero
    participant UI as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    Bo->>UI: Nuevo movimiento (tipo, cantidad, nota)
    UI->>B: POST /inventory { medicine_id, movement_type, quantity, note }
    alt tipo = ajuste con signo negativo o salida/merma > stock
        B-->>UI: 400 Stock insuficiente
    else OK
        B->>DB: UPDATE medicines (stock = stock ± quantity)
        B->>DB: INSERT inventory_movements (user_id, store_id)
        B-->>UI: 201 movimiento creado
    end
```
