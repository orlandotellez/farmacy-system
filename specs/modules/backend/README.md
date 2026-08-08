# Backend Module

Backend de **FARMACY** — Fastify 5 + TypeScript + Prisma.

## Contents

1. [01-stack](./01-stack.md) — Stack tecnológico
2. [02-architecture](./02-architecture.md) — Arquitectura modular, capas, errores
3. [03-api](./03-api.md) — Endpoints, guards, autenticación
4. [04-security](./04-security.md) — Medidas de seguridad
5. [05-testing](./05-testing.md) — Estrategia de testing
6. [06-printers](./06-printers.md) — Impresión ESC/POS y cola de jobs

## Quick Start

```bash
# Desde backend-fastify/
pnpm install
cp .env.example .env   # o crea .env con DATABASE_URL y JWT secrets
pnpm prisma:migrate    # aplica migraciones
pnpm seed              # datos demo
pnpm dev               # tsx watch src/server.ts
```

Requiere PostgreSQL corriendo y Redis opcional (aún comentado en `app.ts`).

Swagger UI disponible en `/docs` en desarrollo. Base URL: `/api/v1`.

## Estructura de módulos

```
src/modules/
├── auth/          # login, register-store, refresh, verificación, reset, sesiones
├── users/         # CRUD usuarios (admin)
├── categories/    # CRUD categorías
├── suppliers/     # CRUD proveedores
├── medicines/     # catálogo de medicamentos
├── clients/       # clientes + historial
├── prescriptions/ # recetas + validación
├── purchases/     # órdenes de compra
├── batch-inventory/ # lotes (ruta /inventory/batches)
├── inventory/     # movimientos
├── sales/         # ventas POS + reportes
├── invoices/      # facturación
├── reports/       # dashboard + financiero
├── settings/      # configuración de tienda
├── printers/      # impresoras ESC/POS
└── audit/         # bitácora
```

Cada módulo sigue capas `domain / application / presentation / infrastructure` (detalle en 02-architecture.md).
