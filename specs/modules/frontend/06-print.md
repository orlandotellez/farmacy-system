# Frontend Print — Impresión de tickets

Impresión de tickets térmicos — FARMACY.

---

## Dos vías de impresión

### 1. HTML print (respaldo / navegador)

`src/lib/print-ticket.ts`

- `buildTicketHtml({ storeName, storeAddress, storePhone, storeFooter, saleId, userName, date, rows, subtotal, total, paymentMethod, amountReceived, changeGiven })` genera un HTML de ticket de 80 mm (CSS monospace).
- `printHtml(html)` abre un iframe oculto, escribe el HTML y llama `iframe.contentWindow.print()`.
- `buildTicketProductRow({ name, quantity, lineTotal })` genera la fila de producto.
- `buildTicketServiceRows(svc)` genera filas de servicios (con productos incluidos/adicionales) — preparado para el futuro módulo de servicios.

**Uso en el POS** (`Pos.tsx`):
```ts
printHtml(buildTicketHtml({ ...settings + lastSale ... }))
```

### 2. TCP ESC/POS (Tauri desktop)

- `src/lib/tcp-printer.ts`: API al comando Rust `invoke("tcp_print", { address, port, payload })`.
- `src-tauri/src/tcp_printer.rs`: abre socket TCP, envía bytes ESC/POS, maneja timeout/errores.
- El backend también expone `POST /printers/send-tcp` y `POST /printers/:id/print-receipt` como vías alternativas (ver módulo backend 06-printers.md).

## Fuente de datos del ticket

| Dato | Origen |
|------|--------|
| Cabecera (nombre, dirección, teléfono) | `GET /settings` via `useStoreSettings` |
| Pie de ticket | `settings.ticket_footer` |
| Items, totales, método de pago | `sale` retornado por `POST /sales` |
| Moneda | `settings.currency` → `money()` |

## Configuración de impresoras

- Página Settings/impresoras usa `printersApi` (GET/POST/PATCH/DELETE `/printers`).
- Campos: connection_type (net/usb/bluetooth), address, port (9100), paper_width (58/80), profile (escpos/star_line), auto_cut, cut_type, open_cash_drawer, default_copies, role, is_default.
- `PrinterLoad` muestra el estado de carga al probar/conectar.

## Flujo recomendado (desktop)

```
Venta completada → "Imprimir ticket"
→ buildTicketHtml (datos de settings + sale)
→ invoke('tcp_print') → Rust envía ESC/POS a la impresora por defecto
→ Feedback al usuario (éxito/error) via toast
```
