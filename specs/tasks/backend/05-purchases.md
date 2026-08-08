# Tareas de Backend — Feature 05: Órdenes de Compra

## Estado Actual
- **Módulo purchases** (controller directo sobre Prisma): CRUD + approve + receive + cancel.
- Recepción transaccional: crea lotes, incrementa stock, registra movimientos, soporta recepción parcial.

---

## Checklist de Tareas Backend

### 1. CRUD de Órdenes de Compra
- [] Implementar `GET /purchases` (búsqueda, status, supplier, paginación).
- [] Implementar `GET /purchases/:id` (con items + supplier + user).
- [ ] Implementar `POST /purchases` (status `borrador`, `number` auto `OC-<ts>`, total calculado).
- [ ] Implementar `PUT /purchases/:id` (solo `borrador|pendiente`; reemplaza items).

### 2. Ciclo de Vida
- [ ] Implementar `POST /purchases/:id/approve` (→ `aprobada`).
- [ ] Implementar `POST /purchases/:id/receive` (→ `recibida` si todo recibido):
  - [ ] Validar solo `aprobada`.
  - [ ] Validar `expiry_date` futura.
  - [ ] Validar `received + qty <= quantity` (parcial permitida).
  - [ ] Crear `batch` por item.
  - [ ] Incrementar `medicine.stock`.
  - [ ] Registrar movimiento `entrada`.
  - [ ] Actualizar `purchase_item.received`.
- [ ] Implementar `POST /purchases/:id/cancel` (no en `recibida`).

### 3. Pendientes / Mejoras
- [ ] **Refactor a capas**: purchases y prescriptions hoy usan Prisma directo en controller; migrar a pattern service+repository como el resto.
- [ ] RBAC: solo `bodeguero|admin` crean/reciben; solo admin (o farmacéutico) aprueban.
- [ ] Número de OC secuencial (`OC-YYYY-####`) en vez de timestamp.
- [ ] Registrar auditoría en approve/receive/cancel.
- [ ] Tests de recepción parcial y de validaciones de estado.
