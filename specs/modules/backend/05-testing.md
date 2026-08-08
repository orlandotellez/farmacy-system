# Backend Testing

Estrategia de testing — FARMACY API.

## Estado actual

- **No hay framework de testing configurado** (sin vitest/jest/supertest).
- La verificación se hace manualmente: `pnpm dev` + colecciones HTTP en `backend-fastify/http/*.http` (auth, products, sales, settings, health, inventory, users) y seed demo.

## Estrategia propuesta

### 1. Unit tests de services (vitest)

Cada `createXService(repository)` recibe el repositorio por inyección → se puede mockear fácilmente.

- `medicines.service`: barcode único (create/update), soft-delete, 404 en getById.
- `sales.service`: mapeo de respuesta, errores de negocio mapeados a BadRequestError.
- `invoices.service`: secuencia de numeración, conflicto de factura duplicada.
- `prescriptions` / `purchases`: validaciones de estado.

### 2. Integration tests de repositorios (vitest + testcontainers o DB de test)

- `sales.prisma.repository`: transacción de venta con FEFO, validación de receta (autorizada, vencida, de otro cliente), devolución de stock en cancel.
- `batch-inventory.prisma.repository`: expiring/expired.
- `reports`: dashboard y financial con datos sembrados.

### 3. E2E de la API (supertest + fastify.inject)

`buildApp()` exporta la app lista para `app.inject()` sin levantar servidor:

- Flujo completo: register-store → login → crear categoría/proveedor/medicamento → vender con receta → anular.
- Verificar status codes y `{ message }` de errores.

### 4. Datos de test

- `DATABASE_URL` apuntando a una DB de test.
- Seed ligero con factories (evitar depender del seed demo destructivo).

## Comandos sugeridos

```bash
# backend-fastify/
pnpm add -D vitest supertest @types/supertest
# package.json
"test": "vitest run",
"test:watch": "vitest"
```

## Cobertura objetivo

| Área | Prioridad |
|------|-----------|
| Sales (crear, cancelar, FEFO, receta) | Alta |
| Auth (login, refresh, register-store) | Alta |
| Medicines (unicidad, soft-delete) | Media |
| Purchases (recepción con lotes) | Alta |
| Invoices (secuencia, cancel) | Media |
| Reports (dashboard/financial) | Media |
