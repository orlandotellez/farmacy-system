# Tareas de Base de Datos (DB) — Feature 01: Auth & Users

## Estado Actual
- **Tablas migradas**: `store`, `user`, `session`, `account`, `verification`.
- Enum `ROLE` creado (`admin | farmaceutico | cajero | bodeguero`).
- Unique `(store_id, email)` en `users`.
- Soft-delete (`deleted_at`) en `users`.

---

## Checklist de Tareas DB

### 1. Tenancy y Usuarios
- [x] Crear tabla `store` (raíz multi-tenant, con índice por `name`).
- [x] Crear tabla `user` (rol, email_verified, store_id, deleted_at).
- [x] Crear enum `ROLE`.
- [x] Unique `(store_id, email)` para email único por tienda.
- [x] Índices: `email`, `role`, `store_id`, `[store_id, deleted_at]`.

### 2. Sesiones y Credenciales
- [x] Crear tabla `session` (refresh tokens, ip, user_agent, expires_at).
- [x] Crear tabla `account` (provider `credentials` con hash bcrypt + campos OAuth).
- [x] Crear tabla `verification` (códigos OTP de email/reset).

### 3. Pendientes / Mejoras
- [x] Índice único sobre `session.token` (para revocación eficiente de refresh tokens).
- [x] Índice sobre `verification.identifier + expires_at` (limpieza de OTP vencidos).
- [x] Migración para rotación de refresh tokens en DB (persistir `session` al refrescar). *La capa DB (tabla `session` + `uq_session_token`) está lista; el flujo backend que persiste/rota la sesión en `refresh` sigue pendiente.*
- [x] Job/script de limpieza de sesiones y verifications expiradas (`pnpm db:cleanup`, opcional cron).
