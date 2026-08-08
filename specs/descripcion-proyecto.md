# Sistema de Punto de Venta y Gestión de Farmacia

## Descripción del Proyecto

Sistema de escritorio (Tauri) y web para la gestión integral de una farmacia: **punto de venta (POS)**, **catálogo de medicamentos**, **control de recetas médicas**, **lotes y vencimientos**, **órdenes de compra**, **facturación**, **reportes financieros** e **impresión de tickets térmicos**. Es una aplicación multi-tenant: cada farmacia (store) tiene sus propios datos, usuarios y configuración.

---

## Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Administrador** | Gestiona usuarios, configuración de la farmacia, catálogo y revisa la bitácora de auditoría |
| **Farmacéutico** | Valida recetas médicas, supervisa inventario y lotes, autoriza cantidades |
| **Cajero** | Opera el punto de venta: cobra, registra ventas, imprime tickets y facturas |
| **Bodeguero** | Registra órdenes de compra, recepción de mercadería, lotes y movimientos de inventario |

---

## Módulos y Funcionalidades

### Módulo 1: Autenticación, Usuarios y Multitenant
- **Registro de farmacia**: alta de una nueva tienda con su administrador (`POST /auth/register-store`)
- **Login con JWT**: access token (15 min) + refresh token (7 días), soporte Bearer y cookie httpOnly
- **Verificación de email** y **recuperación de contraseña**
- **Sesiones activas**: listar y revocar sesiones
- **Usuarios por rol**: `admin | farmaceutico | cajero | bodeguero`, scoped por farmacia
- **Aislamiento multi-tenant**: todas las consultas filtran por `store_id` del token (storeGuard)

### Módulo 2: Catálogo (Categorías, Proveedores, Medicamentos)
- **Categorías**: CRUD simple con soft-delete y unicidad por tienda
- **Proveedores**: datos fiscales (RUC), contacto, activos/inactivos, soft-delete
- **Medicamentos**: nombre comercial/génico, principio activo, concentración, presentación, forma farmacéutica, laboratorio, código de barras, unidad, precios de compra/venta, stock, umbral de stock bajo
- **Flags regulatorios**: `requires_prescription` (se vende con receta) y `is_controlled` (controlado, exige receta válida)
- **Filtros de listado**: por categoría, proveedor, stock bajo, agotado, próximos a vencer, vencidos

### Módulo 3: Clientes
- **CRUD de clientes**: cédula/RUC, teléfono, email, nacimiento, sexo, alergias, enfermedades crónicas, cliente frecuente
- **Historial del cliente**: ventas, recetas, total gastado, visitas y productos frecuentes

### Módulo 4: Recetas Médicas
- **Registro de receta**: número, médico, centro, fechas de emisión/expiración, imagen, notas, cliente y detalle de medicamentos
- **Estados**: `pendiente | validada | expirada | anulada`
- **Validación**: el farmacéutico autoriza cantidades por medicamento (`authorized_quantity`)
- **Control en venta**: los medicamentos controlados/que requieren receta solo se venden contra una receta validada y no vencida, sin exceder la cantidad autorizada

### Módulo 5: Compras (Órdenes de Compra)
- **Ciclo de vida**: `borrador → pendiente → aprobada → recibida | anulada`
- **Creación y edición**: items con cantidad y costo unitario
- **Aprobación**: transición a aprobada con usuario y fecha
- **Recepción**: crea lotes por medicamento, incrementa stock, registra movimiento `entrada`, soporta recepción parcial

### Módulo 6: Lotes e Inventario
- **Lotes (batches)**: número de lote, fecha de fabricación, vencimiento, cantidad, costo; entrada manual con incremento de stock
- **Alertas**: `expiring_soon` (≤ `expiration_alert_days`) y `expired`
- **Movimientos**: `entrada | salida | ajuste | venta | merma | devolucion` con usuario, nota y lote opcional
- **Stock bajo y agotados**: endpoints dedicados

### Módulo 7: Ventas y Punto de Venta (POS)
- **Búsqueda de medicamentos** con debounce (220 ms), escáner de código de barras (HTML5 + cámara)
- **Carrito** (Zustand) con control de stock, métodos de pago (`efectivo | tarjeta_debito | tarjeta_credito | transferencia | pago_movil | mixto`), efectivo recibido y cambio
- **Asignación FEFO** (first expiry, first out) de lotes automática o por lote explícito
- **Validaciones**: stock suficiente, no vender vencidos, receta válida para medicamentos controlados/que requieren receta
- **Anulación de venta** con devolución de stock y movimiento `devolucion`
- **Ticket térmico**: impresión por HTML (navegador) o TCP ESC/POS (Tauri)

### Módulo 8: Facturación
- **Tipos**: `ticket | simplificada | fiscal`
- **Emisión sobre venta completada** con número secuencial `FAC-YYYY-0001`
- **Anulación** con motivo; una venta con factura emitida no puede anularse sin anular antes la factura

### Módulo 9: Reportes
- **Dashboard**: KPIs del día (ingresos, número de ventas, ticket promedio, ítems vendidos), stock bajo/agotados/por vencer/vencidos, ingresos últimos 30 días, ventas por método de pago, top productos de la semana, ventas recientes
- **Reporte financiero**: ingresos, costo, utilidad, margen, por producto, por laboratorio, flujo de caja (ingresos vs compras)
- **Tendencias de ventas**: por día/semana/mes

### Módulo 10: Impresión Térmica (ESC/POS)
- **Impresoras**: red (TCP), USB, Bluetooth; perfiles `escpos | star_line`; ancho 58/80 mm
- **Funciones**: test de impresión, probe de estado, impresión de recibo por venta, impresora por defecto
- **Envío directo TCP** desde el frontend Tauri (Rust `tcp_printer.rs`)
- **Jobs de impresión**: cola con reintentos (payload, estado, intentos)

### Módulo 11: Configuración y Auditoría
- **Settings de la farmacia**: nombre, dirección, teléfono, email, RUC, horario, umbral stock bajo, días de alerta de vencimiento, moneda (NIO/USD/EUR/MXN), pie de ticket
- **Bitácora de auditoría** (admin): acciones con usuario, módulo, entidad y detalle

---

## Pantallas del Sistema

1. **Auth** — Login, registro de farmacia, recuperación/verificación de email
2. **Punto de Venta** (`/pos`) — búsqueda, carrito, cobro, ticket
3. **Medicamentos** (`/medicines`) — tabla paginada con filtros, CRUD modal
4. **Categorías** (`/categories`) — CRUD simple
5. **Clientes** (`/clients`) — CRUD con historial
6. **Recetas** (`/prescriptions`) — CRUD y validación
7. **Proveedores** (`/suppliers`) — CRUD
8. **Compras** (`/purchases`) — órdenes, aprobación y recepción
9. **Inventario** (`/inventory`) — lotes, vencimientos y movimientos
10. **Ventas** (`/sales`) — historial, detalle y anulación
11. **Facturas** (`/invoices`) — emisión y anulación
12. **Reportes** (`/reports`) — dashboard y reporte financiero con gráficos (Recharts)
13. **Usuarios** (`/users`, admin) — CRUD de usuarios de la farmacia
14. **Ajustes** (`/settings`, admin) — configuración de la farmacia
15. **Bitácora** (`/audit`, admin) — log de auditoría

---

## Casos de Uso Principales

| # | Caso de Uso | Actor | Descripción |
|---|-------------|-------|-------------|
| 1 | Registrar una farmacia | Administrador | Alta de tienda + usuario admin inicial |
| 2 | Iniciar sesión | Todos | Login con email/contraseña, JWT + refresh |
| 3 | Gestionar medicamentos | Admin/Farmacéutico | CRUD con flags de receta/control |
| 4 | Vender en el POS | Cajero | Buscar, agregar al carrito, cobrar, imprimir ticket |
| 5 | Vender medicamento con receta | Cajero | Exigir receta validada y autorización |
| 6 | Validar una receta | Farmacéutico | Autorizar cantidades por medicamento |
| 7 | Crear orden de compra | Bodeguero | Alta de OC con items |
| 8 | Recibir mercadería | Bodeguero | Crear lotes, incrementar stock, movimientos |
| 9 | Consultar vencimientos | Bodeguero/Admin | Listar lotes por vencer y vencidos |
| 10 | Anular una venta | Admin/Cajero | Devolver stock con movimiento `devolucion` |
| 11 | Emitir factura | Cajero | Generar `FAC-YYYY-0001` sobre venta completada |
| 12 | Ver dashboard | Admin | KPIs del día y tendencias |
| 13 | Imprimir ticket térmico | Cajero | Enviar a impresora TCP ESC/POS |
| 14 | Configurar la farmacia | Admin | Moneda, umbrales, pie de ticket |
| 15 | Revisar bitácora | Admin | Auditar acciones por módulo |

---

## Flujos de Navegación Clave

### Flujo de Venta con Receta
```
Cajero abre /pos → Busca "Amoxicilina" → Resultado muestra tag "Receta"
→ Agrega al carrito → Se abre "Opciones de venta" (receta requerida)
→ Selecciona cliente → Selecciona receta validada (autorizada para ese cliente)
→ Cobra (efectivo, calcula cambio) → Venta registrada → Imprime ticket
```

### Flujo de Recepción de Compra
```
Bodeguero crea OC (borrador) → Admin aprueba → Bodeguero recibe
→ Ingresa lotes por medicamento (número, vencimiento, cantidad)
→ Sistema crea lotes, incrementa stock y registra movimiento "entrada"
→ OC pasa a "recibida" (o sigue aprobada si recepción parcial)
```

### Flujo de Anulación de Venta
```
Cajero abre /sales → Busca venta → Detalle → Anular con motivo
→ Sistema devuelve stock, registra movimiento "devolucion" y log de auditoría
→ Si tiene factura emitida → debe anular primero la factura
```

### Flujo de Validación de Receta
```
Farmacéutico abre /prescriptions → Receta "pendiente" → Validar
→ Autoriza cantidades por medicamento (por defecto la cantidad prescrita)
→ Receta pasa a "validada" → Ya puede usarse en el POS
→ Se registra authorized_by y validated_at
```
