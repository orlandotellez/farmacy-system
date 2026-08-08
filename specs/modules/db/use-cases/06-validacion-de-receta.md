# 6. Validación de Receta

**Descripción**: El farmacéutico valida una receta y autoriza cantidades por medicamento.

**Actores**: Farmacéutico, Sistema

**Tablas involucradas**: `prescriptions`, `prescription_items`

```mermaid
sequenceDiagram
    actor F as Farmacéutico
    participant UI as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    F->>UI: Abre /prescriptions → receta "pendiente"
    F->>UI: Pulsa "Validar" (autoriza cantidades)
    UI->>B: POST /prescriptions/:id/validate { authorized_items }
    B->>DB: Verifica status='pendiente'
    B->>DB: UPDATE prescriptions (status='validada', validated_by, validated_at)
    B->>DB: UPDATE prescription_items (authorized_quantity, authorized_by)
    B-->>UI: 200 receta validada
    UI-->>F: Receta ya disponible en el POS
```
