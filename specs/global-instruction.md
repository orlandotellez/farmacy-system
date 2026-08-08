# FARMACY — Sistema de Punto de Venta y Gestión de Farmacia

Sistema de escritorio y web para la gestión integral de una farmacia: **punto de venta**, **catálogo de medicamentos**, **recetas**, **lotes y vencimientos**, **compras**, **facturación**, **reportes** e **impresión térmica ESC/POS**. Multi-tenant por farmacia (store). Piensa en un POS retail + sistema farmacéutico con control regulatorio de recetas.

---

## Project Overview

**FARMACY** es una aplicación de escritorio (Tauri 2) + web con:
- POS con búsqueda, escáner de código de barras y ticket térmico
- Catálogo de medicamentos con flags de receta/control
- Control de recetas médicas y autorización de cantidades
- Lotes con FEFO y alertas de vencimiento
- Órdenes de compra y recepción de mercadería
- Facturación secuencial y anulación
- Reportes financieros y dashboard
- Multi-tenant: cada store (farmacia) aísla sus datos
- RBAC: admin, farmaceutico, cajero, bodeguero
- Impresión ESC/POS por TCP desde Rust (Tauri)

---

## Module Structure

La especificación se organiza en tres módulos principales:

### [frontend/](modules/frontend/)
Frontend React + Vite + Tauri.

| File | Description |
|------|-------------|
| [01-stack](modules/frontend/01-stack.md) | Stack tecnológico |
| [02-design](modules/frontend/02-design.md) | Identidad visual, tema claro/oscuro, CSS Modules |
| [03-architecture](modules/frontend/03-architecture.md) | Arquitectura, carpetas, flujo de datos, Tauri |
| [04-screens](modules/frontend/04-screens.md) | Pantallas detalladas por módulo |
| [05-quality](modules/frontend/05-quality.md) | Criterios de calidad |
| [06-print](modules/frontend/06-print.md) | Impresión de tickets (HTML + TCP ESC/POS) |

### [backend/](modules/backend/)
Backend Fastify 5 + TypeScript + Prisma.

| File | Description |
|------|-------------|
| [01-stack](modules/backend/01-stack.md) | Stack tecnológico |
| [02-architecture](modules/backend/02-architecture.md) | Arquitectura modular, capas, errores |
| [03-api](modules/backend/03-api.md) | Endpoints REST, JWT, guards |
| [04-security](modules/backend/04-security.md) | Medidas de seguridad |
| [05-testing](modules/backend/05-testing.md) | Estrategia de testing |
| [06-printers](modules/backend/06-printers.md) | Impresión ESC/POS, jobs y cola |

### [db/](modules/db/)
Base de datos PostgreSQL + Prisma.

| File | Description |
|------|-------------|
| [setup](modules/db/setup.md) | Setup local (PostgreSQL, migraciones, seed) |
| [enums/](modules/db/enums/) | Catálogo de enums (ROLE, UNIT_TYPE, PRINTER_*) |
| [schemas/](modules/db/schemas/) | Esquema de cada tabla + full-schema + DDL |
| [use-cases/](modules/db/use-cases/) | Casos de uso con diagramas Mermaid |

### [tasks/](tasks/)
Matriz de tareas ordenadas para completar el proyecto (DB → Backend → Frontend).

---

## Quick Reference

### Stack
- **Frontend**: React 19, TypeScript, Vite 7, Tauri 2 (Rust), Zustand 5, React Router 7, Recharts, lucide-react, CSS Modules
- **Backend**: Fastify 5, TypeScript (tsx/tsup), Prisma 6, zod, JWT (jsonwebtoken), bcrypt, pino
- **Database**: PostgreSQL, Prisma Migrate, multi-tenant por `store_id`
- **Impresión**: ESC/POS 58/80 mm por TCP (Rust `tcp_printer.rs`) + fallback HTML print

### Roles (RBAC)
- `admin` — todo + usuarios, settings, bitácora
- `farmaceutico` — catálogo, recetas, inventario, reportes
- `cajero` — POS, ventas, facturación
- `bodeguero` — compras, lotes, inventario

### Auth
- JWT access token (15 min) + refresh token (7 días)
- Bearer header (`farmacy-token` en localStorage) o cookie httpOnly
- Guards: `[authGuard, storeGuard]` en rutas de negocio; `[authGuard, adminGuard, storeGuard]` en admin (users, audit-log)

### API
- Base URL: `/api/v1`
- Errores: `{ message: string }`
- Paginación: `{ data: [...], meta: { page, limit, total, totalPages } }`
- Swagger UI disponible en desarrollo
