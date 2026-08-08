# 14. Gestión de Clientes

**Descripción**: Se registra un cliente y se consulta su historial de compras y recetas.

**Actores**: Cajero/Admin, Sistema

**Tablas involucradas**: `clients`, `sales`, `prescriptions`

```mermaid
sequenceDiagram
    actor U as Usuario
    participant UI as Frontend (/clients)
    participant B as Backend (API)
    participant DB as PostgreSQL

    U->>UI: "Nuevo cliente" (nombre, documento, teléfono, alergias)
    UI->>B: POST /clients
    B->>DB: INSERT clients (store_id, ...)
    B-->>UI: 201 cliente creado
    U->>UI: Abre detalle → "Historial"
    UI->>B: GET /clients/:id/history
    B->>DB: Ventas del cliente + recetas + total gastado
    B-->>UI: Historial (productos frecuentes, visitas)
```
