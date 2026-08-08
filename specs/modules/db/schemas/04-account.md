# `account`

Credenciales de autenticación por usuario (password o proveedor OAuth).

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `account_id` | `text` | `NOT NULL` | ID de la cuenta |
| `provider_id` | `text` | `NOT NULL` | Proveedor (`credentials`, oauth…) |
| `user_id` | `uuid` | FK → user | Usuario asociado |
| `access_token` | `text` | | Token de acceso del proveedor |
| `refresh_token` | `text` | | Token de refresco del proveedor |
| `id_token` | `text` | | ID token |
| `access_token_expires_at` | `timestamptz` | | |
| `refresh_token_expires_at` | `timestamptz` | | |
| `scope` | `text` | | Scopes otorgados |
| `password` | `text` | | Hash bcrypt (provider `credentials`) |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Índices

- `user_id`

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `user` | N:1 | `account.user_id → user.id` |

## Notas

- El seed crea un `account` por usuario demo con `provider_id = "credentials"` y password hasheado con bcrypt.
- El schema está listo para OAuth (account_id/provider_id) aunque hoy solo se usa `credentials`.
