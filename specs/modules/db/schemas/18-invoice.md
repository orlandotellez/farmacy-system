# `invoice`

Facturas emitidas sobre ventas. Número secuencial por año.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---------|------|-------------|-------------|
| `id` | `uuid` | `PK` `DEFAULT uuid()` | Identificador único |
| `number` | `text` | `NOT NULL` | Número (FAC-YYYY-######) |
| `invoice_type` | `text` | `NOT NULL` `DEFAULT 'ticket'` | ticket/simplificada/fiscal |
| `sale_id` | `uuid` | `NOT NULL` FK → sale | Venta origen |
| `client_id` | `uuid` | FK → client | Cliente |
| `client_name` | `text` | | Nombre del cliente (snapshot) |
| `client_document` | `text` | | Documento (snapshot) |
| `client_address` | `text` | | Dirección (snapshot) |
| `client_phone` | `text` | | Teléfono (snapshot) |
| `client_email` | `text` | | Email (snapshot) |
| `subtotal` | `decimal(10,2)` | `NOT NULL` | Subtotal (de la venta) |
| `total` | `decimal(10,2)` | `NOT NULL` | Total (de la venta) |
| `status` | `text` | `NOT NULL` `DEFAULT 'emitida'` | emitida/anulada |
| `cancelled_at` | `timestamptz` | | Fecha de anulación |
| `cancelled_by` | `text` | | Quién anuló |
| `issued_by` | `text` | | Quién emitió |
| `store_id` | `uuid` | `NOT NULL` FK → store | Tienda propietaria |
| `created_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |
| `updated_at` | `timestamptz` | `NOT NULL` `DEFAULT now()` | |

## Constraints & Índices

- `UNIQUE (store_id, number)`.
- `@index(sale_id)`, `@index(client_id)`, `@index(invoice_type)`, `@index([store_id, created_at])`.

## Relaciones

| Tabla | Tipo | |
|-------|------|---|
| `store` | N:1 | `invoice.store_id → store.id` |
| `sale` | N:1 | `invoice.sale_id → sale.id` |
| `client` | N:1 | `invoice.client_id → client.id` |

## Notas

- Secuencia: `FAC-<año>-<6 dígitos>` calculada con lock de store.
- Una venta solo puede tener una factura `emitida`.
