# 02 · Users — Usuarios (admin-only)

Gestión de usuarios de la farmacia. Todos los endpoints requieren rol `admin`.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | Listar usuarios con búsqueda y filtro por rol |
| GET | `/users/:id` | Admin | Detalle de usuario |
| POST | `/users` | Admin | Crear usuario |
| PUT | `/users/:id` | Admin | Actualizar usuario |
| DELETE | `/users/:id` | Admin | Eliminar usuario (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/users`

- **Auth**: Sí (admin)

**Query params**

```
?search=&role=&page=&limit=
```

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "name": "...", "email": "...", "role": "cajero", "phone": null, "store_id": "uuid", "created_at": "iso", "updated_at": "iso" }], "meta": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 } }
```

**Validaciones**

- `role` ∈ `admin | farmaceutico | cajero | bodeguero`.

### POST `/api/v1/users`

- **Auth**: Sí (admin)

**Request body**

```json
{ "name": "Cajero Demo", "email": "cajero@farmacia.test", "password": "cajero123", "role": "cajero", "phone": null }
```

**Response 201 Created** — usuario creado (sin password) con `store_id` de la tienda del admin.

**Errores comunes**

- `409` — email ya existe en la tienda (unique `[store_id, email]`).
- `400` — validación de zod fallida.

### PUT `/api/v1/users/:id`

- **Auth**: Sí (admin)

**Request body** — campos parciales: `{ name?, email?, password?, role?, phone? }`.

**Response 200 OK** — usuario actualizado.

### DELETE `/api/v1/users/:id`

- **Auth**: Sí (admin)

**Response 200 OK** — `{ message }`. Soft delete: setea `deleted_at`; el login debe rechazar usuarios eliminados.
