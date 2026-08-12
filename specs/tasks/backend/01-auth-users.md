# Tareas de Backend — Feature 01: Auth & Users

## Estado Actual
- **Módulo auth completo**: `register-store`, `register` (admin), `login`, `refresh`, `logout`, `verify-email`, `resend-verification`, `forgot-password`, `reset-password`, `GET/DELETE /sessions`.
- **Módulo users completo**: CRUD (admin-only) con validación de rol y unicidad `(store_id, email)`.
- Guards: `authGuard`, `adminGuard`, `storeGuard`.
- Tokens: access 15 min + refresh 7 días (Bearer + cookies).

---

## Checklist de Tareas Backend

### 1. Autenticación y JWT
- [x] Implementar `POST /auth/register-store` (crea store + admin + settings + tokens).
- [x] Implementar `POST /auth/login` (verifica bcrypt, emite tokens, registra sesión).
- [x] Implementar `POST /auth/register`.
- [x] Implementar `POST /auth/refresh` (rotación de tokens).
- [x] Implementar `POST /auth/logout` (revoca refresh token).
- [x] Implementar `POST /auth/verify-email` y `POST /auth/resend-verification`.
- [x] Implementar `POST /auth/forgot-password` y `POST /auth/reset-password`.
- [x] Implementar `GET /auth/sessions` y `DELETE /auth/sessions/:id`.

### 2. Guards y RBAC
- [x] `authGuard` (resuelve userId/role/storeId desde cookie o Bearer).
- [x] `adminGuard` (exige rol admin).
- [x] `storeGuard` (exige storeId; 403 "Store context required").

### 3. Gestión de Usuarios
- [x] Implementar CRUD `/users` (admin-only).
- [x] Validar unicidad `(store_id, email)` y rol válido.
- [x] Soft-delete de usuarios.

### 4. Pendientes / Mejoras
- [ ] **RBAC fino por rol**: decidir y aplicar permisos por endpoint (ej. solo `farmaceutico|admin` validan recetas; solo `bodeguero|admin` reciben compras; solo `cajero|admin` crean ventas). Crear guard `roleGuard(...roles)`.
- [ ] Bloqueo temporal tras N intentos fallidos de login.
- [ ] Persistir sesión al refrescar (rotación en DB) y revocar el access token anterior.
- [ ] Enviar emails reales (verificación/reset) con servicio SMTP (hoy mock).
- [ ] Tests unitarios del servicio de auth (ver 05-testing.md).
