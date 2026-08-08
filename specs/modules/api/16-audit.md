# 16 · Audit — Bitácora de auditoría (admin-only)

Registro de acciones relevantes del sistema con usuario, módulo, entidad y detalle. Solo lectura para el admin.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-log` | Admin | Listar eventos con filtros |

---

## Detalle de endpoints

### GET `/api/v1/audit-log`

- **Auth**: Sí (admin)

**Query params**

```
?search=&user_id=&module=&from=&to=&page=&limit=
```

- `module` ∈ `sales | invoices | purchases | inventory | prescriptions | users | settings | ...`.

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "user_id": "uuid", "user_name": "Cajero Demo", "action": "anular", "module": "sales", "entity_id": "uuid", "details": "Cliente devolvió el producto", "ip_address": null, "created_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

## Eventos registrados actualmente

| Acción | Módulo | Dónde se registra |
|--------|--------|-------------------|
| `anular` | sales | `POST /sales/:id/cancel` (motivo en details) |
| `emitir` | invoices | `POST /invoices` (número y venta en details) |
| `anular` | invoices | `POST /invoices/:id/cancel` (motivo en details) |

> Los CRUD de otras entidades aún no registran auditoría; es una tarea pendiente de mejora (ver `tasks/backend/11-settings-audit.md`).
