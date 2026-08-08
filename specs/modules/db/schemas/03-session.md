# `session`

Sesiones activas del usuario (refresh tokens y metadatos del dispositivo).

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `expires_at` | `timestamptz` | `NOT NULL` | Expiración de la sesión |
| `token` | `text` | `NOT NULL` | Refresh token (hash recomendado) |
| `ip_address` | `text` | | IP de la conexión |
| `user_agent` | `text` | | User agent del dispositivo |
| `user_id` | `uuid` | `NOT NULL` FK → user | Usuario dueño |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `user_id`

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `user` | N:1 | `session.user_id → user.id` |

## Notas

- `GET /auth/sessions` lista sesiones; `DELETE /auth/sessions/:id` revoca.
- El refresh token actual es stateless (JWT); esta tabla existe para el listado/revocación (rotación en DB pendiente — ver tasks).
