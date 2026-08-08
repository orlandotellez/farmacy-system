# 03 · Categories — Categorías

CRUD simple de categorías de medicamentos con soft-delete y unicidad por tienda.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Sí | Listado simple (sin paginar) |
| GET | `/categories/paginated` | Sí | Listado paginado con búsqueda |
| GET | `/categories/:id` | Sí | Detalle |
| POST | `/categories` | Sí | Crear |
| PUT | `/categories/:id` | Sí | Actualizar |
| DELETE | `/categories/:id` | Sí | Eliminar (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/categories`

- **Auth**: Sí

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "name": "Analgésicos", "description": null, "created_at": "iso", "updated_at": "iso" }] }
```

> Usado por el frontend para poblar selects (sin paginación).

### GET `/api/v1/categories/paginated`

- **Auth**: Sí

**Query params** — `?search=&page=&limit=`

**Response 200 OK** — forma paginada estándar.

### POST `/api/v1/categories`

- **Auth**: Sí

**Request body**

```json
{ "name": "Antibióticos", "description": "Medicamentos antimicrobianos" }
```

**Validaciones**

- `name`: required, único por tienda (`@@unique([store_id, name])`).

**Errores comunes**

- `409` — ya existe una categoría con ese nombre en la tienda.

### PUT `/api/v1/categories/:id`

- **Auth**: Sí

**Request body** — `{ name?, description? }`.

### DELETE `/api/v1/categories/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Soft delete: `deleted_at = now()`.
