# Casos de Uso — FARMACY

Diagramas de flujo funcionales con Mermaid para cada caso de uso principal de la plataforma.

## Listado

| # | Caso de Uso | Tablas involucradas |
|---|-------------|---------------------|
| 1 | [Registro de Farmacia](./01-registro-de-farmacia.md) | stores, users, accounts, settings |
| 2 | [Inicio de Sesión](./02-inicio-de-sesion.md) | users, accounts, session |
| 3 | [Gestión de Medicamentos](./03-gestion-de-medicamentos.md) | medicines, categories, suppliers |
| 4 | [Venta en POS](./04-venta-en-pos.md) | sales, sale_items, batches, medicines, inventory_movements |
| 5 | [Venta con Receta](./05-venta-con-receta.md) | sales, prescriptions, prescription_items, sale_items |
| 6 | [Validación de Receta](./06-validacion-de-receta.md) | prescriptions, prescription_items |
| 7 | [Orden de Compra y Recepción](./07-orden-de-compra-y-recepcion.md) | purchases, purchase_items, batches, medicines, inventory_movements |
| 8 | [Control de Lotes y Vencimientos](./08-control-de-lotes-y-vencimientos.md) | batches, medicines, settings |
| 9 | [Movimiento de Inventario](./09-movimiento-de-inventario.md) | inventory_movements, medicines |
| 10 | [Anulación de Venta](./10-anulacion-de-venta.md) | sales, sale_items, batches, medicines, invoices, inventory_movements, audit_logs |
| 11 | [Emisión de Factura](./11-emision-de-factura.md) | invoices, sales |
| 12 | [Reportes Financieros](./12-reportes-financieros.md) | sales, sale_items, purchases, medicines |
| 13 | [Impresión de Ticket](./13-impresion-de-ticket.md) | print_jobs, printers, sales |
| 14 | [Gestión de Clientes](./14-gestion-de-clientes.md) | clients, sales, prescriptions |
| 15 | [Auditoría de Acciones](./15-auditoria-de-acciones.md) | audit_logs, users |
