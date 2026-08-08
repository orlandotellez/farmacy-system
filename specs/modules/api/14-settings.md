# 14 · Settings — Configuración de la farmacia

Configuración global de la tienda: datos de cabecera, umbrales y moneda. Un registro por store (`store_id` único).

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | Sí | Obtener configuración |
| PUT | `/settings` | Sí | Actualizar configuración |

---

## Detalle de endpoints

### GET `/api/v1/settings`

- **Auth**: Sí

**Response 200 OK**

```json
{ "id": 1, "name": "Farmacia Demo Salud", "address": "Av. Central, Managua", "phone": "2255-0101", "email": "demo@farmacia.test", "ruc": "J0310000040004", "opening_hours": "Lun-Sáb 7:00-20:00", "low_stock_threshold": 5, "expiration_alert_days": 60, "currency": "NIO", "ticket_footer": "Gracias por confiar en Farmacia Demo Salud", "store_id": "uuid" }
```

> El seed crea estos settings por defecto al registrar la tienda. El frontend los consume vía `useStoreSettings` (nombre, dirección, teléfono, pie de ticket, moneda) para tickets y formatos de moneda.

### PUT `/api/v1/settings`

- **Auth**: Sí (admin)

**Request body**

```json
{ "name": "Farmacia Demo Salud", "address": "Av. Central, Managua", "phone": "2255-0101", "email": "demo@farmacia.test", "ruc": "J0310000040004", "opening_hours": "Lun-Sáb 7:00-20:00", "low_stock_threshold": 5, "expiration_alert_days": 60, "currency": "NIO", "ticket_footer": "¡Gracias por su compra!" }
```

**Validaciones**

- `currency` ∈ `NIO | USD | EUR | MXN`.
- `low_stock_threshold`, `expiration_alert_days`: enteros ≥ 0.

**Response 200 OK** — settings actualizados.
