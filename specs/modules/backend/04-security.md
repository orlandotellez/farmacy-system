# Backend Security

Medidas de seguridad — FARMACY API.

## Implementado

### 1. Autenticación
- **JWT access (15 min)** con payload de rol/store; **refresh (7 días)** rotativo.
- Doble canal: `Authorization: Bearer` (usado por el frontend) + cookies httpOnly `accessToken`/`refreshToken` (soportadas por `authGuard`).
- Contraseñas hasheadas con **bcrypt** (nunca en claro).

### 2. Autorización
- `authGuard` en todas las rutas de negocio → `401` si no hay token válido.
- `adminGuard` para `/users` y `/audit-log` → `403` si no es admin.
- `storeGuard` exige `storeId` en el token → **403 "Store context required"** si falta (el frontend fuerza re-login).

### 3. Multi-tenant
- Todas las queries de negocio filtran por `store_id` derivado del token (no de inputs del cliente).
- IDs de entidad siempre verificados con `store_id` (`findFirst({ where: { id, store_id } })`), evitando IDOR entre tiendas.

### 4. Protección de capa HTTP (Fastify plugins)
- **helmet** — headers de seguridad.
- **cors** — configuración explícita (`config/cors.ts`).
- **compress** — compresión gzip (threshold 1024).
- **rate-limit** — 300 req/min global.
- **cookie** — parsing de cookies (para auth por cookie).

### 5. Validación estricta
- Todos los body/query validados con **zod** antes de llegar a la lógica.
- `errorHandler` normaliza errores: nunca filtra stack traces ni detalles internos (500 genérico).

### 6. Concurrencia en transacciones
- `SELECT ... FOR UPDATE` en recetas/stores para operaciones críticas (venta, anulación, factura).
- `updateMany` condicional para evitar condiciones de carrera en stock.

## Pendiente / Mejoras sugeridas

- [ ] Rate limit por ruta sensible (`/auth/login`) más estricto.
- [ ] `helmet` CSP ajustada a Tauri (fetch desde Rust bypasea CORS; validar en web).
- [ ] Rotación de refresh tokens en DB (`session` table) — hoy es stateless.
- [ ] Bloqueo de cuenta tras N intentos fallidos de login.
- [ ] `email_verified` enforcement: decidir si ciertos flujos exigen verificación.
- [ ] Auditoría para CRUD (hoy solo anulación de venta/facturas).
- [ ] Redis para rate limit distribuido y caché (ya configurado, sin activar).
