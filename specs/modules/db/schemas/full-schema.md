# Full Schema — FARMACY

Todas las tablas en un solo archivo (resumen). El detalle por tabla está en los archivos `NN-tabla.md`.

## Enums

| Enum | Valores |
|------|---------|
| `ROLE` | `admin, farmaceutico, cajero, bodeguero` |
| `UNIT_TYPE` | `unidad, paquete, caja, frasco, tubo, sobre, blister, ampolleta, gotero, aerosol, crema, jarabe, tableta, capsula, botella, bolsa` |
| `PRINTER_CONN_TYPE` | `net, usb, bluetooth` |
| `PRINTER_PROFILE` | `escpos, star_line` |
| `PRINTER_STATUS` | `unknown, online, offline, error, out_of_paper` |

## Tablas

### `store`
`id uuid PK · name text NN · address text · phone text · ruc text · email text · created_at timestamptz NN · updated_at timestamptz NN`

### `user`
`id uuid PK · name text NN · email text NN · email_verified bool NN df false · phone text · image text · role ROLE NN df cajero · store_id uuid NN FK→store · created_at · updated_at · deleted_at timestamptz` — `UNIQUE(store_id, email)`

### `session`
`id uuid PK · expires_at timestamptz NN · token text NN · ip_address text · user_agent text · user_id uuid NN FK→user · created_at · updated_at`

### `account`
`id uuid PK · account_id text NN · provider_id text NN · user_id uuid FK→user · access_token · refresh_token · id_token · access_token_expires_at · refresh_token_expires_at · scope · password · created_at · updated_at`

### `verification`
`id uuid PK · identifier text NN · value text NN · expires_at timestamptz NN · created_at · updated_at`

### `category`
`id uuid PK · name text NN · description text · store_id uuid NN FK→store · created_at · updated_at · deleted_at` — `UNIQUE(store_id, name)`

### `supplier`
`id uuid PK · name text NN · company · ruc · contact_name · email · phone · address · notes · is_active bool NN df true · store_id uuid NN FK→store · created_at · updated_at · deleted_at`

### `medicine`
`id uuid PK · barcode · internal_code · commercial_name text NN · generic_name · active_ingredient · concentration · presentation · pharmaceutical_form · laboratory · category_id uuid FK→category · supplier_id uuid FK→supplier · unit_type UNIT_TYPE · unit_quantity int · purchase_price dec(10,2) NN df 0 · sale_price dec(10,2) NN · stock int NN df 0 · low_stock_threshold int NN df 5 · requires_prescription bool NN df false · is_controlled bool NN df false · image · active bool NN df true · store_id uuid NN FK→store · created_at · updated_at · deleted_at`

### `client`
`id uuid PK · full_name text NN · document_type text NN df cedula · document_number · phone · email · address · birth_date timestamptz · sex · allergies · chronic_diseases · observations · is_frequent bool NN df false · store_id uuid NN FK→store · created_at · updated_at · deleted_at`

### `prescription`
`id uuid PK · number text NN · doctor_name · medical_center · issue_date timestamptz · expiry_date timestamptz · image · notes · status text NN df pendiente · validated_by text · validated_at timestamptz · client_id uuid FK→client (SET NULL) · store_id uuid NN FK→store · created_at · updated_at · deleted_at` — `UNIQUE(store_id, number)`

### `prescription_item`
`id uuid PK · prescription_id uuid NN FK→prescription (CASCADE) · medicine_id uuid NN FK→medicine · medicine_name text NN · quantity int NN · authorized_quantity int NN df 0 · authorized_by text · created_at`

### `purchase`
`id uuid PK · number text NN · status text NN df borrador · supplier_id uuid FK→supplier · expected_date timestamptz · notes · total dec(10,2) NN df 0 · approved_by text · approved_at · received_by text · received_at · user_id uuid NN FK→user · store_id uuid NN FK→store · created_at · updated_at` — `UNIQUE(store_id, number)`

### `purchase_item`
`id uuid PK · purchase_id uuid NN FK→purchase (CASCADE) · medicine_id uuid NN FK→medicine · medicine_name text NN · quantity int NN · unit_cost dec(10,2) NN · line_total dec(10,2) NN · received int NN df 0 · created_at`

### `batch`
`id uuid PK · batch_number text NN · medicine_id uuid NN FK→medicine · purchase_id uuid FK→purchase · supplier_id uuid FK→supplier · manufacture_date timestamptz · expiry_date timestamptz NN · initial_quantity int NN df 0 · quantity int NN df 0 · unit_cost dec(10,2) · notes · user_id uuid NN FK→user · store_id uuid NN FK→store · created_at · updated_at`

### `inventory_movement`
`id uuid PK · medicine_id uuid NN FK→medicine · movement_type text NN · quantity int NN · note · batch_id uuid FK→batch · user_id uuid NN FK→user · store_id uuid NN FK→store · created_at`

### `sale`
`id uuid PK · subtotal dec(10,2) NN · total dec(10,2) NN · payment_method text NN · amount_received dec(10,2) · change_given dec(10,2) · status text NN df completada · cancellation_reason · cancelled_at · cancelled_by · user_id uuid NN FK→user · user_name · client_id uuid FK→client · prescription_id uuid FK→prescription · store_id uuid NN FK→store · created_at · updated_at`

### `sale_item`
`id uuid PK · sale_id uuid NN FK→sale · medicine_id uuid NN FK→medicine · medicine_name text NN · quantity int NN · unit_price dec(10,2) NN · line_total dec(10,2) NN · batch_id uuid FK→batch · created_at · updated_at`

### `invoice`
`id uuid PK · number text NN · invoice_type text NN df ticket · sale_id uuid NN FK→sale · client_id uuid FK→client · client_name · client_document · client_address · client_phone · client_email · subtotal dec(10,2) NN · total dec(10,2) NN · status text NN df emitida · cancelled_at · cancelled_by · issued_by · store_id uuid NN FK→store · created_at · updated_at` — `UNIQUE(store_id, number)`

### `settings`
`id int PK AUTOINCREMENT · name text NN df 'Mi Farmacia' · address · phone · email · ruc · opening_hours · low_stock_threshold int NN df 5 · expiration_alert_days int NN df 60 · currency text NN df NIO · ticket_footer · store_id uuid NN UNIQUE FK→store · updated_at`

### `audit_log`
`id uuid PK · user_id uuid FK→user · user_name · action text NN · module text NN · entity_id text · details · ip_address · store_id uuid NN FK→store · created_at`

### `printer`
`id uuid PK · store_id uuid NN FK→store · name text NN · connection_type PRINTER_CONN_TYPE NN · address text NN · port int · paper_width int NN · profile PRINTER_PROFILE NN df escpos · codepage text NN df PC850 · auto_cut bool NN df true · cut_type text · open_cash_drawer bool NN df false · default_copies int NN df 1 · role text NN · is_default bool NN df false · is_active bool NN df true · last_status PRINTER_STATUS NN df unknown · last_seen_at · created_at · updated_at · deleted_at` — `UNIQUE(store_id, name)`

### `printer_assignment`
`id uuid PK · printer_id uuid NN FK→printer (CASCADE) · category_id uuid · role text NN · priority int NN df 0` — `UNIQUE(printer_id, category_id)`

### `print_job`
`id uuid PK · printer_id uuid NN FK→printer (CASCADE) · sale_id uuid FK→sale · payload bytea NN · status text NN · attempts int NN df 0 · max_attempts int NN df 3 · error_msg · enqueued_at timestamptz NN · sent_at · finished_at`
