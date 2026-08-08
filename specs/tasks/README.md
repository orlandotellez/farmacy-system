# FARMACY — Matriz de Tareas del Proyecto

---

## Estructura del Directorio `specs/tasks/`

```text
specs/tasks/
├── README.md
├── db/                      # 1º — Base de datos (PostgreSQL + Prisma)
│   ├── 01-auth-users.md
│   ├── 02-catalog.md
│   ├── 03-clients.md
│   ├── 04-prescriptions.md
│   ├── 05-purchases.md
│   ├── 06-inventory.md
│   ├── 07-sales.md
│   ├── 08-invoices.md
│   ├── 09-reports.md
│   ├── 10-printers.md
│   └── 11-settings-audit.md
├── backend/                 # 2º — Backend (Fastify + Prisma)
│   ├── 01-auth-users.md
│   ├── 02-catalog.md
│   ├── 03-clients.md
│   ├── 04-prescriptions.md
│   ├── 05-purchases.md
│   ├── 06-inventory.md
│   ├── 07-sales.md
│   ├── 08-invoices.md
│   ├── 09-reports.md
│   ├── 10-printers.md
│   └── 11-settings-audit.md
└── frontend/                # 3º — Frontend (React + Tauri)
    ├── 01-auth-users.md
    ├── 02-catalog.md
    ├── 03-clients.md
    ├── 04-prescriptions.md
    ├── 05-purchases.md
    ├── 06-inventory.md
    ├── 07-sales.md
    ├── 08-invoices.md
    ├── 09-reports.md
    ├── 10-printers.md
    └── 11-settings-audit.md
```

---

## Mapa de Módulos / Features

| # | Feature / Módulo | Descripción General |
|---|------------------|---------------------|
| **01** | `auth-users` | Autenticación JWT, registro de farmacia, verificación/reset, sesiones y CRUD de usuarios |
| **02** | `catalog` | Categorías, proveedores y catálogo de medicamentos (flags de receta/control) |
| **03** | `clients` | CRUD de clientes e historial de compras/recetas |
| **04** | `prescriptions` | Recetas médicas, estados y validación con autorización de cantidades |
| **05** | `purchases` | Órdenes de compra: borrador → aprobada → recibida (con lotes) |
| **06** | `inventory` | Lotes (FEFO/vencimientos) y movimientos de inventario |
| **07** | `sales` | Punto de venta: carrito, cobro, receta requerida, anulación |
| **08** | `invoices` | Facturación secuencial y anulación |
| **09** | `reports` | Dashboard KPIs y reporte financiero |
| **10** | `printers` | Impresoras ESC/POS, test/probe y envío de tickets |
| **11** | `settings-audit` | Configuración de la farmacia y bitácora de auditoría |

---

## Orden de Ejecución

El proyecto se completa **de abajo hacia arriba** en este orden:

```
1. Base de Datos (db/)      → esquema, migraciones, índices, seed
2. Backend (backend/)       → API, validaciones, reglas de negocio, guards
3. Frontend (frontend/)     → pantallas, API layer, POS, impresión
```

Dentro de cada capa, completar las features en orden numérico (01 → 11). Una feature está completa cuando **sus 3 capas** (db, backend, frontend) están terminadas.

---

## Estado Actual Resumido

- **Base de Datos (PostgreSQL / Prisma)**: ~95% completado (schema con 23 tablas y migraciones aplicadas; pendientes: ajustes finos y algunos índices).
- **Backend (Fastify 5)**: ~85% completado (todos los módulos con CRUD y reglas de negocio; pendientes: RBAC fino por rol, auditoría de CRUD, ajuste de lotes PUT, tests, Redis).
- **Frontend (React 19 + Tauri 2)**: ~80% completado (todas las pantallas y API layer; pendientes: tests, refinamientos de UX, panel de impresoras dedicado).

> Los checklists usan `[x]` para lo ya implementado y `[ ]` para lo pendiente. Servir como guía de construcción **y** de verificación de completitud.
