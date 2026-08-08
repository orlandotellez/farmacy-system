# Database Module

Esquema y configuración de la base de datos PostgreSQL de FARMACY.

## Estructura

```
db/
├── README.md                          # Este índice
├── setup.md                           # Guía de setup local (PostgreSQL, Prisma, seed)
├── enums/
│   ├── README.md                      # Índice de enums
│   ├── ROLE.md                        # admin | farmaceutico | cajero | bodeguero
│   ├── UNIT_TYPE.md                   # 16 unidades de medida
│   ├── PRINTER_CONN_TYPE.md           # net | usb | bluetooth
│   ├── PRINTER_PROFILE.md             # escpos | star_line
│   └── PRINTER_STATUS.md              # unknown | online | offline | error | out_of_paper
├── schemas/
│   ├── README.md                      # Índice de tablas
│   ├── full-schema.md                 # Todas las tablas en un solo archivo
│   ├── query.sql                      # DDL completo para PostgreSQL
│   ├── 01-store.md                    # Tiendas (multi-tenant root)
│   ├── 02-user.md                     # Usuarios por rol
│   ├── 03-session.md                  # Sesiones / refresh tokens
│   ├── 04-account.md                  # Credenciales / OAuth
│   ├── 05-verification.md             # Códigos de verificación
│   ├── 06-category.md                 # Categorías
│   ├── 07-supplier.md                 # Proveedores
│   ├── 08-medicine.md                 # Medicamentos
│   ├── 09-client.md                   # Clientes
│   ├── 10-prescription.md             # Recetas médicas
│   ├── 11-prescription_item.md        # Items de receta
│   ├── 12-purchase.md                 # Órdenes de compra
│   ├── 13-purchase_item.md            # Items de compra
│   ├── 14-batch.md                    # Lotes
│   ├── 15-inventory_movement.md       # Movimientos de inventario
│   ├── 16-sale.md                     # Ventas
│   ├── 17-sale_item.md                # Items de venta
│   ├── 18-invoice.md                  # Facturas
│   ├── 19-settings.md                 # Configuración de tienda
│   ├── 20-audit_log.md                # Bitácora
│   ├── 21-printer.md                  # Impresoras
│   ├── 22-printer_assignment.md       # Asignaciones de impresora
│   └── 23-print_job.md                # Cola de impresión
└── use-cases/
    ├── README.md                      # Índice de casos de uso
    ├── 01-registro-de-farmacia.md
    ├── 02-inicio-de-sesion.md
    ├── 03-gestion-de-medicamentos.md
    ├── 04-venta-en-pos.md
    ├── 05-venta-con-receta.md
    ├── 06-validacion-de-receta.md
    ├── 07-orden-de-compra-y-recepcion.md
    ├── 08-control-de-lotes-y-vencimientos.md
    ├── 09-movimiento-de-inventario.md
    ├── 10-anulacion-de-venta.md
    ├── 11-emision-de-factura.md
    ├── 12-reportes-financieros.md
    ├── 13-impresion-de-ticket.md
    ├── 14-gestion-de-clientes.md
    └── 15-auditoria-de-acciones.md
```

## Stack

| Componente | Tecnología |
|------------|------------|
| Motor | PostgreSQL |
| ORM | Prisma 6 (`prisma-client-js`) |
| Migraciones | Prisma Migrate (`prisma migrate dev/deploy`) |
| Multi-tenant | `store_id` FK en todas las tablas de negocio |
| IDs | `uuid()` generado por Prisma (default) |
| Decimales | `@db.Decimal(10, 2)` para precios/importes |

## Cómo se genera

- `backend-fastify/prisma/schema.prisma` es la **fuente de verdad**.
- `pnpm prisma:migrate` genera/aplica migraciones en `prisma/migrations/`.
- `pnpm seed` puebla datos demo (destructivo, solo dev).
- `pnpm prisma:studio` abre el explorador visual.
