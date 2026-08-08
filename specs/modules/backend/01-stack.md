# Backend Stack

Stack tecnológico del backend — FARMACY API.

## Core Technologies

- **Node.js** (>= 20)
- **Fastify 5** — framework HTTP con plugins oficiales
- **TypeScript** (tsx para dev, tsup para build, ESM `"type": "module"`)
- **PostgreSQL** (via Prisma 6)
- **Prisma ORM** — schema, migraciones y cliente tipado

## Architecture

- **Modular monolith**: cada feature es un módulo con capas `domain / application / presentation / infrastructure`
- **Service Layer** con factories (`createXService(repository)`)
- **Repository Pattern** sobre Prisma
- **Global error handler** (`errorHandler`) con `AppError` tipado
- **DTOs con zod** validados y convertidos a JSON Schema para Swagger

## Dependencies

### runtime
```json
{
  "@fastify/compress": "^8", "@fastify/cookie": "^11", "@fastify/cors": "^10",
  "@fastify/helmet": "^12", "@fastify/jwt": "^9", "@fastify/rate-limit": "^10",
  "@fastify/swagger": "^9", "@fastify/swagger-ui": "^6",
  "@prisma/client": "^6", "bcrypt": "^5", "dotenv": "^16", "fastify": "^5",
  "ioredis": "^5", "jsonwebtoken": "^9", "pino": "^9", "zod": "^3",
  "zod-to-json-schema": "^3"
}
```

### dev
```json
{ "@types/bcrypt": "^5", "@types/jsonwebtoken": "^9", "@types/node": "^22",
  "pino-pretty": "^11", "prisma": "^6", "tsup": "^8", "tsx": "^4", "typescript": "^5" }
```

## Key Patterns

| Pattern | Implementación |
|---------|---------------|
| **Service Layer** | `createMedicineService(repository)`, `createSaleService(repository)`, etc. |
| **Repository** | `MedicineRepository`, `SaleRepository`, etc. (objetos con métodos) |
| **Mapping** | Mappers manuales: `mapPrismaSaleToEntity`, `mapMedicineToResponse` |
| **Validation** | zod DTO schemas → `toJsonSchema()` para Fastify + Swagger |
| **Error handling** | `AppError` (BadRequest/NotFound/Conflict/Unauthorized/Forbidden) → handler global |
| **Auth** | JWT (Bearer + cookie httpOnly), guards `authGuard` / `adminGuard` / `storeGuard` |

## Infrastructure Services

- **PostgreSQL** — base de datos principal via Prisma
- **bcrypt** — hashing de contraseñas
- **JWT (jsonwebtoken)** — access (15 min) + refresh (7 días)
- **pino** — logging estructurado (pretty en dev)
- **Redis (ioredis)** — configurado en `config/redis.ts` pero **aún no activo** (comentado en `app.ts`)
- **OpenAPI** — Swagger UI en desarrollo
- **ESC/POS** — impresión térmica vía TCP (módulo printers)

## Notable Absences

| Feature | Estado |
|---------|--------|
| **Framework de testing** | No configurado (sin vitest/jest aún) |
| **Redis en runtime** | Configurado, no activado |
| **Rate limiting avanzado** | Básico: 300 req/min global |
| **CQRS / Event bus** | No usado — service layer directo |
| **AutoMapper** | No usado — mappers manuales |
