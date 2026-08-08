# Tareas de Frontend — Feature 01: Auth & Users

## Estado Actual
- **Pantallas construidas**: `Auth.tsx` (login + registro de farmacia), `LoginForm`, `RegisterForm`.
- **AuthContext**: login, logout, registerStore, refresh automático (arranque + cada 14 min), persistencia en localStorage.
- **Página Users** (`/users`): CRUD admin con `UserModal`.

---

## Checklist de Tareas Frontend

### 1. Autenticación
- [ ] Crear pantalla de login con manejo de errores del backend.
- [ ] Crear formulario de registro de farmacia (`registerStore`).
- [ ] Persistir tokens (`farmacy-token`, `farmacy-refresh-token`) y user/store.
- [ ] Refresco automático de tokens al arrancar y en intervalos.
- [ ] Redirigir a `/auth` si el backend responde `403 Store context required`.

### 2. Usuarios (admin)
- [ ] Crear tabla CRUD de usuarios con roles.
- [ ] Crear `UserModal` (nombre, email, password, rol).
- [ ] Ocultar página para no-admin (`useRoleGuard` o guard de ruta).

### 3. Pendientes / Mejoras
- [ ] Pantalla de verificación de email OTP (el backend ya la soporta).
- [ ] Pantalla de recuperación de contraseña ("Olvidé mi contraseña").
- [ ] Gestión de sesiones activas desde el perfil (revocar sesión).
- [ ] Tests de AuthContext (login/logout/refresh) y de las pantallas de auth.
