# `verification`

Códigos/tokens de verificación de email y reseteo de contraseña.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `identifier` | `text` | `NOT NULL` | Email asociado |
| `value` | `text` | `NOT NULL` | Código/token (hash recomendado) |
| `expires_at` | `timestamptz` | `NOT NULL` | Expiración |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Notas

- Usado por `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password` y `/auth/reset-password`.
- Modelo multi-propósito (identifier + value + expires_at).
