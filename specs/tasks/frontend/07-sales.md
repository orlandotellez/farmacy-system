# Tareas de Frontend — Feature 07: Ventas (POS)

## Estado Actual
- **Página POS** (`/pos`): búsqueda con debounce, resultados con tag "Receta", carrito (Zustand), opciones de venta (cliente + receta), cobro con cambio, ticket post-venta, escáner de código de barras.
- **Página Ventas** (`/sales`): historial con filtros, `SaleDetailModal`, anulación con motivo.

---

## Checklist de Tareas Frontend

### 1. Punto de Venta
- [ ] Búsqueda con debounce 220 ms y teclado (Enter agrega el primero).
- [ ] Tag "Receta" en resultados con `requires_prescription` (tooltip "Solo se vende con receta").
- [ ] Escáner de código de barras (`BarcodeScanner` + `html5-qrcode`).
- [ ] Carrito: agregar (límite stock), ± cantidad, quitar, vaciar.
- [ ] Opciones de venta: cliente (100 primeros) + receta **validada** filtrada por cliente; apertura automática si hay medicamento con receta.
- [ ] Cobro: 6 métodos de pago, efectivo recibido, cambio calculado.
- [ ] Validación "efectivo recibido >= total".
- [ ] Post-venta: éxito + impresión de ticket.

### 2. Historial de Ventas
- [ ] Tabla con filtros (rango, método, estado, búsqueda).
- [ ] `SaleDetailModal` con items y cliente.
- [ ] Anulación con motivo (ConfirmDialog) y manejo del error de factura emitida.

### 3. Pendientes / Mejoras
- [ ] Selección manual de lote (FEFO por defecto; el backend lo soporta vía `batch_id`).
- [ ] Nota rápida de la venta (`notes` en el payload).
- [ ] Descuento por porcentaje (`discount_pct`) cuando el backend lo soporte.
- [ ] Atajos de teclado avanzados (F2 cobrar, F4 cliente…).
- [ ] Reimpresión del último ticket.
- [ ] Tests del flujo de venta (store Zustand + componentes).
