# FARMACY SYSTEM


![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Tauri](https://img.shields.io/badge/tauri-%23000000.svg?style=for-the-badge&logo=tauri&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![Astro](https://img.shields.io/badge/astro-%23000000.svg?style=for-the-badge&logo=astro&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Axum](https://img.shields.io/badge/axum-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)

Sistema de gestión integral para farmacia: ventas, inventario, compras, clientes, recetas, reportes y más.

## Estructura del proyecto

```
backend-fastify/   API REST backend (Fastify + PostgreSQL + Redis + Drizzle ORM)
frontend/          Frontend desktop (Tauri + React + Vite) — aún no iniciado
```

## Módulos

### @backend-fastify/

API REST construida con Fastify, TypeScript y arquitectura modular por dominio.

**Stack:**

- [Fastify](https://fastify.dev/) — framework HTTP
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL — capa de datos
- [Redis](https://redis.io/) (ioredis) — caché / sesiones
- [JWT](https://jwt.io/) — autenticación (access + refresh tokens)
- [Zod](https://zod.dev/) — validación de esquemas
- [Swagger](https://swagger.io/) — documentación de API
- [pino](https://getpino.io/) — logging

**Módulos implementados:**

| Módulo          | Descripción                                   |
| --------------- | --------------------------------------------- |
| `auth`          | Autenticación y autorización (JWT)            |
| `users`         | Gestión de usuarios del sistema               |
| `medicines`     | Catálogo de medicamentos                      |
| `categories`    | Categorías de productos                       |
| `suppliers`     | Proveedores                                   |
| `clients`       | Clientes                                      |
| `inventory`     | Stock e inventario                            |
| `batch-inventory` | Inventario por lote / vencimiento           |
| `sales`         | Punto de venta y ventas                       |
| `purchases`     | Compras a proveedores                         |
| `invoices`      | Facturación                                   |
| `prescriptions` | Recetas                                        |
| `reports`       | Reportes                                       |
| `printers`      | Impresión (tickets / etiquetas)               |

#### Configuración

Copiar `.env.example` a `.env` y definir las variables:

```bash
cp .env.example .env
```

| Variable            | Descripción                          |
| ------------------- | ------------------------------------ |
| `NODE_ENV`          | Entorno de ejecución                 |
| `PORT`              | Puerto del servidor                  |
| `HOST`              | Host de escucha                      |
| `DATABASE_URL`      | Cadena de conexión a PostgreSQL      |
| `JWT_SECRET`        | Secreto para access token            |
| `JWT_REFRESH_SECRET`| Secreto para refresh token           |
| `REDIS_URL`         | Conexión a Redis                     |
| `CORS_ORIGIN`       | Orígenes permitidos (separados por coma) |

Nota: requeridos PostgreSQL y Redis corriendo antes de levantar la API.

#### Instalación y ejecución

```bash
pnpm install
pnpm dev
```

#### Base de datos (Drizzle)

```bash
pnpm db:generate   # generar migraciones a partir de los esquemas
pnpm db:migrate    # aplicar migraciones
pnpm db:push       # sincronizar esquema sin migraciones
pnpm db:cleanup    # limpiar registros expirados
```

### @frontend/

Frontend **no iniciado todavía**. Solo existe el boilerplate inicial de:

- **Tauri** — wrapper de escritorio
- **React 19** + **Vite** — UI
- **Zustand** — estado global
- **React Router** — enrutado
- **recharts** — gráficos
- **html5-qrcode** — lector de códigos QR
- **lucide-react** — íconos

El desarrollo funcional del frontend comenzará próximamente.
