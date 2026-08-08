# Backend Printers — Impresión ESC/POS

Impresión térmica para tickets de 58/80 mm — FARMACY API.

## Modelo de datos

| Tabla | Rol |
|-------|-----|
| `printer` | Configuración de la impresora (tipo, dirección, perfil, corte, cajón) |
| `printer_assignment` | Asignación por rol/categoría (receipt/kitchen) |
| `print_job` | Cola de trabajos con payload, estado y reintentos |

### Enums

- `PRINTER_CONN_TYPE`: `net | usb | bluetooth`
- `PRINTER_PROFILE`: `escpos | star_line`
- `PRINTER_STATUS`: `unknown | online | offline | error | out_of_paper`

## Módulo printers (`src/modules/printers/`)

```
printers/
├── domain/       # entities, types, interface
├── application/  # printers.service (CRUD + envío)
├── presentation/ # router, controller, dto
└── infrastructure/
    ├── printers.prisma.repository.ts
    └── escpos/
        ├── transport.tcp.ts   # envío TCP a la impresora
        └── encoder.ts         # genera comandos ESC/POS (texto, corte, cajón)
```

## Flujo de impresión de ticket

```
POST /printers/:id/print-receipt { sale_id }
  → service busca la venta y la impresora
  → encoder genera el payload ESC/POS (cabecera de tienda, items, totales, corte)
  → transport.tcp envía a address:port
  → se crea print_job con status (pending/sent/success/failed) y reintentos (max 3)
  → se actualiza last_status / last_seen_at de la impresora
```

## Envío directo desde el frontend Tauri

- El frontend Tauri imprime vía Rust (`src-tauri/src/tcp_printer.rs`) usando `invoke("tcp_print")`.
- `POST /printers/send-tcp` existe como respaldo web (payload base64).
- Ver `modules/frontend/06-print.md` para el flujo completo del cliente.

## Codepages y compatibilidad

- `codepage` default `PC850` (latin-1 con caracteres especiales).
- `paper_width`: 58 o 80 mm → ancho de línea y comandos de corte adecuados.
- `cut_type`: `full | partial`; `auto_cut` activa el corte al final del ticket.
- `open_cash_drawer`: comando de apertura de cajón (`ESC p`).
