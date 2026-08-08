# Local Setup

Guía de configuración local para la base de datos PostgreSQL de FARMACY.

> **Stack**: PostgreSQL + Prisma 6 + Fastify

---

## Prerrequisitos

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| PostgreSQL | 14+ | Base de datos |
| Node.js | 20+ | Prisma CLI / backend |
| pnpm | 9+ | Package manager |
| Prisma CLI | 6 (via devDeps) | Migraciones y cliente |

---

## 1. Configurar Variables de Entorno

```bash
cd backend-fastify
cp .env.example .env   # o crear manualmente
```

Mínimo necesario en `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmacia_dev?schema=public"
JWT_SECRET="<32+ chars aleatorios>"
JWT_REFRESH_SECRET="<32+ chars aleatorios>"
PORT=3000
NODE_ENV=development
```

> `config/env.ts` valida las variables con zod y **aborta** si faltan `DATABASE_URL` o los secrets.

---

## 2. Levantar PostgreSQL

Opción A — PostgreSQL local:

```bash
sudo systemctl start postgresql
createdb farmacia_dev
```

Opción B — Docker:

```bash
docker run -d --name farmacia-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=farmacia_dev \
  -p 5432:5432 postgres:16-alpine
```

---

## 3. Instalar dependencias y generar cliente

```bash
pnpm install
pnpm prisma:generate
```

---

## 4. Aplicar migraciones

```bash
pnpm prisma:migrate      # prisma migrate dev (aplica y crea migración si hay cambios)
# o en producción:
pnpm migrate:deploy      # prisma migrate deploy
```

Verificar el estado:

```bash
pnpm exec prisma migrate status
pnpm exec prisma studio  # explorador visual
```

---

## 5. Seed Data (opcional, destructivo)

```bash
pnpm seed
```

Crea:

- **Store** "Farmacia Demo Salud" + settings.
- **4 usuarios demo** (admin/cajero/farmaceutico/bodeguero) con `account` hasheado.
- **6 categorías** (Analgésicos, Antibióticos, Antigripales, Gastrointestinal, Vitaminas, Dermatología).
- **3 proveedores** (DIFAR, CEN, Salud y Vida).
- **15 medicamentos** con stock inicial, lotes `INICIAL-*` y movimiento `entrada`.
- **3 clientes**, **2 recetas** (una validada con autorización), **1 OC recibida** con lotes y **1 venta completada**.

Usuarios demo:

| Email | Password | Rol |
|-------|----------|-----|
| admin@farmacia.test | admin123 | admin |
| cajero@farmacia.test | cajero123 | cajero |
| farmaceutico@farmacia.test | farma123 | farmaceutico |
| bodega@farmacia.test | bodega123 | bodeguero |

> El seed borra todo el schema (por diseño, solo dev/test).

---

## 6. Comandos útiles

```bash
pnpm exec prisma migrate dev --name nombre      # nueva migración
pnpm exec prisma migrate deploy                 # aplicar en prod
pnpm exec prisma migrate reset                  # resetear + re-aplicar (borra datos)
pnpm exec prisma db push                        # sincronizar schema sin migración
```

---

## Troubleshooting

### `DATABASE_URL` inválida
Verificar que la DB existe y el usuario/contraseña son correctos; `env.ts` valida y sale con error claro.

### Prisma client desactualizado
```bash
pnpm prisma:generate
```

### Puerto 5432 ocupado
Cambiar el puerto en `.env` y crear la DB acorde.

### Migraciones divergentes
```bash
pnpm exec prisma migrate resolve --applied <nombre>
```
