# 01 · Auth — Autenticación y sesión

Endpoints para registro de farmacia, login, refresh de tokens, verificación de email, recuperación de contraseña y gestión de sesiones.

> **Importante**: el flujo devuelve `accessToken` y `refreshToken` en el body (el frontend los guarda en localStorage) y además setea cookies httpOnly.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register-store` | No | Registrar una farmacia nueva con su admin inicial |
| POST | `/auth/register` | Sí (admin) | Crear usuario de la farmacia con rol |
| POST | `/auth/login` | No | Iniciar sesión y obtener tokens |
| POST | `/auth/refresh` | No | Renovar tokens con refresh token |
| POST | `/auth/logout` | No | Cerrar sesión (revoca refresh token) |
| POST | `/auth/verify-email` | No | Verificar email con código |
| POST | `/auth/resend-verification` | No | Reenviar código de verificación |
| POST | `/auth/forgot-password` | No | Solicitar reset de contraseña |
| POST | `/auth/reset-password` | No | Resetear contraseña con código |
| GET | `/auth/sessions` | Sí | Listar sesiones activas del usuario |
| DELETE | `/auth/sessions/:sessionId` | Sí | Revocar una sesión |

---

## Detalle de endpoints

### POST `/api/v1/auth/register-store`

- **Auth**: No

**Request body**

```json
{
  "storeName": "Farmacia Demo Salud",
  "storeAddress": "Av. Central, Managua",
  "storePhone": "2255-0101",
  "adminName": "Administrador Demo",
  "adminEmail": "admin@farmacia.test",
  "adminPassword": "admin123"
}
```

**Response 201 Created**

```json
{
  "message": "Farmacia registrada exitosamente",
  "user": { "id": "uuid", "name": "Administrador Demo", "email": "admin@farmacia.test", "role": "admin", "store_id": "uuid" },
  "store": { "id": "uuid", "name": "Farmacia Demo Salud", "address": "Av. Central, Managua" },
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

**Side effects**

- Crea `store`, usuario `admin` con email verificado y `account` con password hasheado (bcrypt).
- Crea `settings` por defecto para la tienda.
- Emite tokens y cookies.

### POST `/api/v1/auth/login`

- **Auth**: No

**Request body**

```json
{ "email": "admin@farmacia.test", "password": "admin123" }
```

**Response 200 OK**

```json
{ "message": "...", "user": { "...": "" }, "store": { "...": "" }, "accessToken": "jwt", "refreshToken": "jwt" }
```

**Errores comunes**

- `400` — credenciales vacías.
- `401` — credenciales inválidas.

### POST `/api/v1/auth/refresh`

- **Auth**: No (requiere `refreshToken` en body o cookie)

**Request body**

```json
{ "refreshToken": "jwt" }
```

**Response 200 OK** — rota tokens: `{ message, user, store, accessToken, refreshToken }`.

### POST `/api/v1/auth/logout`

- **Auth**: No (requiere `refreshToken` en body o cookie)

**Request body**

```json
{ "refreshToken": "jwt" }
```

**Response 200 OK** — `{ message: "Sesión cerrada exitosamente" }`.

### POST `/api/v1/auth/verify-email`

- **Auth**: No

**Request body**

```json
{ "code": "string-otp" }
```

**Response 200 OK** — `{ message }`.

### POST `/api/v1/auth/resend-verification`

- **Auth**: No

**Request body**

```json
{ "email": "usuario@farmacia.test" }
```

**Response 202 Accepted** — respuesta genérica para evitar enumeración.

### POST `/api/v1/auth/forgot-password`

- **Auth**: No

**Request body**

```json
{ "email": "usuario@farmacia.test" }
```

**Response 202 Accepted** — `{ message, expires_at }`.

### POST `/api/v1/auth/reset-password`

- **Auth**: No

**Request body**

```json
{ "email": "usuario@farmacia.test", "code": "string-otp", "newPassword": "NuevaClave123" }
```

**Response 200 OK** — `{ message }`.

### GET `/api/v1/auth/sessions`

- **Auth**: Sí

**Response 200 OK**

```json
{ "sessions": [{ "id": "uuid", "expires_at": "iso", "ip_address": "...", "user_agent": "...", "created_at": "iso" }] }
```

### DELETE `/api/v1/auth/sessions/:sessionId`

- **Auth**: Sí

**Response 200 OK** — `{ message }`.

**Errores comunes**

- `404` — sesión no encontrada o no pertenece al usuario.
