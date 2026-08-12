# Tareas de Backend — Feature 05: Órdenes de Compra

## Estado Actual
- **Módulo purchases** en capas (domain/application/presentation/infrastructure como el resto): CRUD + approve + receive + cancel.
- Recepción transaccional: crea lotes, incrementa stock, registra movimientos, soporta recepción parcial.

---

## Checklist de Tareas Backend

### 1. CRUD de Órdenes de Compra
- [x] Implementar `GET /purchases` (búsqueda, status, supplier, paginación).
- [x] Implementar `GET /purchases/:id` (con items + supplier + user).
- [x] Implementar `POST /purchases` (status `borrador`, `number` auto `OC-<ts>`, total calculado).
- [x] Implementar `PUT /purchases/:id` (solo `borrador|pendiente`; reemplaza items).

### 2. Ciclo de Vida
- [x] Implementar `POST /purchases/:id/approve` (→ `aprobada`).
- [x] Implementar `POST /purchases/:id/receive` (→ `recibida` si todo recibido):
  - [x] Validar solo `aprobada`.
  - [x] Validar `expiry_date` futura.
  - [x] Validar `received + qty <= quantity` (parcial permitida).
  - [x] Crear `batch` por item.
  - [x] Incrementar `medicine.stock`.
  - [x] Registrar movimiento `entrada`.
  - [x] Actualizar `purchase_item.received`.
- [x] Implementar `POST /purchases/:id/cancel` (no en `recibida`).

### 3. Pendientes / Mejoras
- [x] **Refactor a capas**: purchases implementado con pattern service+repository como el resto (ya no usa Prisma).
- [ ] RBAC: solo `bodeguero|admin` crean/reciben; solo admin (o farmacéutico) aprueban.
- [ ] Número de OC secuencial (`OC-YYYY-####`) en vez de timestamp.
- [ ] Registrar auditoría en approve/receive/cancel.
- [ ] Tests de recepción parcial y de validaciones de estado.
