# 3. Gestión de Medicamentos

**Descripción**: El farmacéutico crea o actualiza un medicamento del catálogo.

**Actores**: Farmacéutico, Sistema

**Tablas involucradas**: `medicines`, `categories`, `suppliers`

```mermaid
sequenceDiagram
    actor F as Farmacéutico
    participant UI as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    F->>UI: Abre /medicines → "Nuevo medicamento"
    F->>UI: Completa formulario (nombre, precio, receta?, controlado?)
    UI->>B: POST /medicines
    B->>DB: Verifica barcode único en tienda
    alt Barcode duplicado
        B-->>UI: 409 A medicine with this barcode already exists
    else OK
        B->>DB: INSERT medicines (store_id, flags, precios)
        B-->>UI: 201 medicamento creado
        UI-->>F: Refresca la tabla
    end
```
