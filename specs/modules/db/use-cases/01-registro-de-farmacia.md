# 1. Registro de Farmacia

**Descripción**: Una nueva farmacia se registra con su administrador inicial.

**Actores**: Administrador (no autenticado), Sistema

**Tablas involucradas**: `stores`, `users`, `accounts`, `settings`

```mermaid
sequenceDiagram
    actor A as Admin
    participant F as Frontend
    participant B as Backend (API)
    participant DB as PostgreSQL

    A->>F: Completa registro de farmacia (nombre, email admin, password)
    F->>B: POST /auth/register-store
    B->>DB: INSERT stores (name, address, phone, ...)
    B->>DB: INSERT users (role='admin', store_id, email_verified=true)
    B->>DB: INSERT accounts (provider_id='credentials', password=hash)
    B->>DB: INSERT settings (store_id, defaults)
    B-->>F: 201 + user + store + tokens
    F-->>A: Redirige a /pos (sesión iniciada)
```
