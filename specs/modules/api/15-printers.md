# 15 · Printers — Impresoras térmicas ESC/POS

Gestión de impresoras (red TCP, USB, Bluetooth), pruebas y envío de tickets. Perfiles `escpos | star_line`, ancho 58/80 mm.

## Tabla de endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/printers` | Sí | Listar impresoras de la tienda |
| GET | `/printers/:id` | Sí | Detalle |
| POST | `/printers` | Sí | Crear |
| POST | `/printers/:id/test` | Sí | Imprimir test |
| POST | `/printers/:id/probe` | Sí | Probar conexión/estado |
| POST | `/printers/:id/print-receipt` | Sí | Imprimir recibo de una venta |
| POST | `/printers/:id/set-default` | Sí | Marcar como predeterminada |
| POST | `/printers/send-tcp` | Sí | Enviar payload TCP directo |
| PATCH | `/printers/:id` | Sí | Actualizar |
| DELETE | `/printers/:id` | Sí | Eliminar (soft delete) |

---

## Detalle de endpoints

### GET `/api/v1/printers`

- **Auth**: Sí

**Response 200 OK**

```json
{ "data": [{ "id": "uuid", "store_id": "uuid", "name": "Impresora Caja 1", "connection_type": "net", "address": "192.168.1.50", "port": 9100, "paper_width": 80, "profile": "escpos", "codepage": "PC850", "auto_cut": true, "cut_type": "full", "open_cash_drawer": false, "default_copies": 1, "role": "receipt", "is_default": true, "is_active": true, "last_status": "online", "last_seen_at": "iso", "created_at": "iso", "updated_at": "iso" }] }
```

### POST `/api/v1/printers`

- **Auth**: Sí

**Request body**

```json
{ "name": "Impresora Caja 1", "connection_type": "net", "address": "192.168.1.50", "port": 9100, "paper_width": 80, "profile": "escpos", "codepage": "PC850", "auto_cut": true, "cut_type": "full", "open_cash_drawer": false, "default_copies": 1, "role": "receipt", "is_default": true }
```

**Validaciones**

- `name` único por tienda.
- `connection_type` ∈ `net | usb | bluetooth`; `profile` ∈ `escpos | star_line`; `paper_width` ∈ `58 | 80`.

### POST `/api/v1/printers/:id/test`

- **Auth**: Sí

**Request body** — `{ text?: string }` (texto opcional a imprimir).

**Response 200 OK** — resultado del envío ESC/POS.

### POST `/api/v1/printers/:id/probe`

- **Auth**: Sí

**Response 200 OK** — `{ status: "online" | "offline", last_seen_at }`. Actualiza `last_status`.

### POST `/api/v1/printers/:id/print-receipt`

- **Auth**: Sí

**Request body**

```json
{ "sale_id": "uuid" }
```

**Side effects**

- Genera el payload ESC/POS del ticket de la venta (58/80 mm, codepage) y lo envía.
- Crea un `print_job` con estado y reintentos.

### POST `/api/v1/printers/send-tcp`

- **Auth**: Sí

**Request body**

```json
{ "address": "192.168.1.50", "port": 9100, "payload": "base64-or-buffer" }
```

> Usado por el frontend Tauri que imprime vía Rust `tcp_printer.rs`; el endpoint sirve como respaldo web.

### POST `/api/v1/printers/:id/set-default`

- **Auth**: Sí

**Request body** — `{ role: "receipt" | "kitchen" | "both" }` (opcional).

**Side effects**

- Marca la impresora como `is_default` para ese rol (las demás quedan no-default).

### DELETE `/api/v1/printers/:id`

- **Auth**: Sí

**Response 200 OK** — `{ message }`. Soft delete: `deleted_at = now()`.
