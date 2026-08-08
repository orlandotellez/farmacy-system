# Frontend Screens

Pantallas del frontend — FARMACY.

---

## 1. Auth (`/auth`)

- **Login**: email + password, enlace a registro de farmacia.
- **Registro de farmacia** (`RegisterForm`): nombre de tienda + admin (storeName, address, phone, adminName, adminEmail, adminPassword) → `authApi.registerStore`.
- Muestra errores del backend (`ApiError.message`).

## 2. POS (`/pos`) — página principal de venta

- **Búsqueda** con debounce 220 ms → `medicinesApi.list({ search, active: true, limit: 12 })`.
- **Resultado por medicamento**: nombre + tag "Receta" si `requires_prescription`, precio, stock; botón `+`.
- **Escáner**: `BarcodeScanner` (html5-qrcode) → `medicinesApi.getByBarcode`.
- **Carrito**: cantidad ± (con límite de stock), quitar, vaciar.
- **Opciones de venta**: selector de cliente (100 primeros), selector de receta **validada**; si el medicamento requiere receta se abre automáticamente.
- **Cobro**: método de pago (6), efectivo recibido, cambio calculado, "Cobrar" → `salesApi.create`.
- **Post-venta**: mensaje de éxito, botón "Imprimir ticket" (`printLastSale` → `buildTicketHtml` + `printHtml`).

## 3. Medicamentos (`/medicines`)

- Tabla paginada (PAGE_LIMIT=10) con columnas: medicamento, código, categoría, precio, stock (color por umbral), estado (Activo/Receta/Controlado).
- Filtros: búsqueda, categoría, estado, stock (bajo/agotado).
- Modal `MedicineModal` CRUD con todos los campos farmacéuticos y flags.
- ConfirmDialog para eliminar (soft delete).

## 4. Categorías (`/categories`)

- Listado simple + modal `CategoryModal` CRUD.

## 5. Clientes (`/clients`)

- Tabla con búsqueda y filtro de frecuentes; modal `ClientModal` CRUD.
- Historial por cliente (ventas, recetas, total gastado).

## 6. Recetas (`/prescriptions`)

- Tabla con estado (pendiente/validada/expirada/anulada) y búsqueda.
- Modal `PrescriptionModal` CRUD con items (medicamento + cantidad).
- Acción **Validar** → `prescriptionsApi.validate` (autoriza cantidades).

## 7. Proveedores (`/suppliers`)

- Tabla CRUD con modal `SupplierModal`.

## 8. Compras (`/purchases`)

- Tabla con estado de OC (borrador/pendiente/aprobada/recibida/anulada).
- `PurchaseModal` creación/edición con items.
- Acciones: Aprobar, Recibir (`ReceivePurchaseModal` con lotes: número, vencimiento, cantidad), Anular.

## 9. Inventario (`/inventory`)

- Movimientos (filtros por tipo/fecha), stock bajo, lotes con vencimientos.
- `MovementModal` para entradas/salidas/ajustes/mermas.
- Alertas visuales: expiring_soon (amarillo), expired (rojo).

## 10. Ventas (`/sales`)

- Historial paginado con filtros (fecha, método, estado).
- `SaleDetailModal`: items, cliente, factura.
- Acción **Anular** con motivo (ConfirmDialog) → `salesApi.cancel`.

## 11. Facturas (`/invoices`)

- Listado con tipo y estado.
- `InvoiceModal`: emitir sobre venta (`InvoiceType` simplificada/fiscal, datos del cliente).
- `InvoiceDetailModal`: detalle y anulación.

## 12. Reportes (`/reports`)

- **StatsSection**: KPIs del día (ingresos, ventas, ticket promedio, ítems).
- **RevenueChart** (revenue_30d), **CashFlowChart**, **PaymentsChart** (sales_by_payment), **TopProductsTable** (top_products_week).
- Reporte financiero: utilidad, margen, por producto/laboratorio.

## 13. Usuarios (`/users`, admin)

- Tabla CRUD con roles; `UserModal` (nombre, email, password, rol).

## 14. Ajustes (`/settings`, admin)

- Formulario de settings: nombre, dirección, teléfono, email, RUC, horario, moneda, umbrales, pie de ticket → `settingsApi.update`.

## 15. Bitácora (`/audit`, admin)

- Tabla de eventos con filtros (módulo, usuario, rango de fechas).

## 16. NotFound

- 404 con enlace de regreso.
