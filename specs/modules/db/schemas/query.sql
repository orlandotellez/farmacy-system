-- FARMACY — DDL completo (PostgreSQL)
-- Equivalente a backend-fastify/prisma/schema.prisma
-- La fuente de verdad es el schema.prisma; este SQL es documental.

-- Extensión para uuid (si se usa uuid_generate_v4; Prisma genera uuid por defecto)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE ROLE AS ENUM ('admin', 'farmaceutico', 'cajero', 'bodeguero');

CREATE TYPE UNIT_TYPE AS ENUM ('unidad','paquete','caja','frasco','tubo','sobre','blister','ampolleta','gotero','aerosol','crema','jarabe','tableta','capsula','botella','bolsa');

CREATE TYPE PRINTER_CONN_TYPE AS ENUM ('net','usb','bluetooth');
CREATE TYPE PRINTER_PROFILE AS ENUM ('escpos','star_line');
CREATE TYPE PRINTER_STATUS AS ENUM ('unknown','online','offline','error','out_of_paper');

-- ─────────────────────────── Tenancy & Auth ───────────────────────────

CREATE TABLE stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  address    TEXT,
  phone      TEXT,
  ruc        TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX stores_name_idx ON stores (name);

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  phone          TEXT,
  image          TEXT,
  role           ROLE NOT NULL DEFAULT 'cajero',
  store_id       UUID NOT NULL REFERENCES stores(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ,
  UNIQUE (store_id, email)
);
CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_role_idx ON users (role);
CREATE INDEX users_store_id_idx ON users (store_id);
CREATE INDEX users_store_deleted_idx ON users (store_id, deleted_at);

CREATE TABLE session (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id    UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX session_user_id_idx ON session (user_id);

CREATE TABLE account (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id                TEXT NOT NULL,
  provider_id               TEXT NOT NULL,
  user_id                   UUID REFERENCES users(id),
  access_token              TEXT,
  refresh_token             TEXT,
  id_token                  TEXT,
  access_token_expires_at   TIMESTAMPTZ,
  refresh_token_expires_at  TIMESTAMPTZ,
  scope                     TEXT,
  password                  TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX account_user_id_idx ON account (user_id);

CREATE TABLE verification (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────── Catálogo ───────────────────────────

CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  store_id    UUID NOT NULL REFERENCES stores(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,
  UNIQUE (store_id, name)
);
CREATE INDEX categories_name_idx ON categories (name);
CREATE INDEX categories_deleted_idx ON categories (deleted_at);
CREATE INDEX categories_store_id_idx ON categories (store_id);

CREATE TABLE suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  company      TEXT,
  ruc          TEXT,
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  notes        TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  store_id     UUID NOT NULL REFERENCES stores(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);
CREATE INDEX suppliers_name_idx ON suppliers (name);
CREATE INDEX suppliers_is_active_idx ON suppliers (is_active);
CREATE INDEX suppliers_store_id_idx ON suppliers (store_id);
CREATE INDEX suppliers_store_deleted_idx ON suppliers (store_id, deleted_at);
CREATE INDEX suppliers_store_name_idx ON suppliers (store_id, name);

CREATE TABLE medicines (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode              TEXT,
  internal_code        TEXT,
  commercial_name      TEXT NOT NULL,
  generic_name         TEXT,
  active_ingredient    TEXT,
  concentration        TEXT,
  presentation         TEXT,
  pharmaceutical_form  TEXT,
  laboratory           TEXT,
  category_id          UUID REFERENCES categories(id),
  supplier_id          UUID REFERENCES suppliers(id),
  unit_type            UNIT_TYPE,
  unit_quantity        INT,
  purchase_price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price           DECIMAL(10,2) NOT NULL,
  stock                INT NOT NULL DEFAULT 0,
  low_stock_threshold  INT NOT NULL DEFAULT 5,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  is_controlled        BOOLEAN NOT NULL DEFAULT false,
  image                TEXT,
  active               BOOLEAN NOT NULL DEFAULT true,
  store_id             UUID NOT NULL REFERENCES stores(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);
CREATE INDEX medicines_barcode_idx ON medicines (barcode);
CREATE INDEX medicines_commercial_name_idx ON medicines (commercial_name);
CREATE INDEX medicines_generic_name_idx ON medicines (generic_name);
CREATE INDEX medicines_active_ingredient_idx ON medicines (active_ingredient);
CREATE INDEX medicines_category_id_idx ON medicines (category_id);
CREATE INDEX medicines_supplier_id_idx ON medicines (supplier_id);
CREATE INDEX medicines_requires_prescription_idx ON medicines (requires_prescription);
CREATE INDEX medicines_is_controlled_idx ON medicines (is_controlled);
CREATE INDEX medicines_active_idx ON medicines (active);
CREATE INDEX medicines_store_id_idx ON medicines (store_id);
CREATE INDEX medicines_store_deleted_idx ON medicines (store_id, deleted_at);
CREATE INDEX medicines_store_name_idx ON medicines (store_id, commercial_name);

-- ─────────────────────────── Clientes & Recetas ───────────────────────────

CREATE TABLE clients (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT NOT NULL,
  document_type    TEXT NOT NULL DEFAULT 'cedula',
  document_number  TEXT,
  phone            TEXT,
  email            TEXT,
  address          TEXT,
  birth_date       TIMESTAMPTZ,
  sex              TEXT,
  allergies        TEXT,
  chronic_diseases TEXT,
  observations     TEXT,
  is_frequent      BOOLEAN NOT NULL DEFAULT false,
  store_id         UUID NOT NULL REFERENCES stores(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX clients_full_name_idx ON clients (full_name);
CREATE INDEX clients_document_number_idx ON clients (document_number);
CREATE INDEX clients_phone_idx ON clients (phone);
CREATE INDEX clients_store_id_idx ON clients (store_id);
CREATE INDEX clients_store_deleted_idx ON clients (store_id, deleted_at);
CREATE INDEX clients_store_name_idx ON clients (store_id, full_name);

CREATE TABLE prescriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number         TEXT NOT NULL,
  doctor_name    TEXT,
  medical_center TEXT,
  issue_date     TIMESTAMPTZ,
  expiry_date    TIMESTAMPTZ,
  image          TEXT,
  notes          TEXT,
  status         TEXT NOT NULL DEFAULT 'pendiente',
  validated_by   TEXT,
  validated_at   TIMESTAMPTZ,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  store_id       UUID NOT NULL REFERENCES stores(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ,
  UNIQUE (store_id, number)
);
CREATE INDEX prescriptions_status_idx ON prescriptions (status);
CREATE INDEX prescriptions_client_id_idx ON prescriptions (client_id);
CREATE INDEX prescriptions_store_created_idx ON prescriptions (store_id, created_at);
CREATE INDEX prescriptions_store_status_idx ON prescriptions (store_id, status);

CREATE TABLE prescription_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id     UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id         UUID NOT NULL REFERENCES medicines(id),
  medicine_name       TEXT NOT NULL,
  quantity            INT NOT NULL,
  authorized_quantity INT NOT NULL DEFAULT 0,
  authorized_by       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX prescription_items_prescription_id_idx ON prescription_items (prescription_id);
CREATE INDEX prescription_items_medicine_id_idx ON prescription_items (medicine_id);

-- ─────────────────────────── Compras & Lotes ───────────────────────────

CREATE TABLE purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'borrador',
  supplier_id   UUID REFERENCES suppliers(id),
  expected_date TIMESTAMPTZ,
  notes         TEXT,
  total         DECIMAL(10,2) NOT NULL DEFAULT 0,
  approved_by   TEXT,
  approved_at   TIMESTAMPTZ,
  received_by   TEXT,
  received_at   TIMESTAMPTZ,
  user_id       UUID NOT NULL REFERENCES users(id),
  store_id      UUID NOT NULL REFERENCES stores(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, number)
);
CREATE INDEX purchases_status_idx ON purchases (status);
CREATE INDEX purchases_supplier_id_idx ON purchases (supplier_id);
CREATE INDEX purchases_store_created_idx ON purchases (store_id, created_at);
CREATE INDEX purchases_store_status_idx ON purchases (store_id, status);

CREATE TABLE purchase_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id   UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  medicine_id   UUID NOT NULL REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  quantity      INT NOT NULL,
  unit_cost     DECIMAL(10,2) NOT NULL,
  line_total    DECIMAL(10,2) NOT NULL,
  received      INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX purchase_items_purchase_id_idx ON purchase_items (purchase_id);
CREATE INDEX purchase_items_medicine_id_idx ON purchase_items (medicine_id);

CREATE TABLE batches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number     TEXT NOT NULL,
  medicine_id      UUID NOT NULL REFERENCES medicines(id),
  purchase_id      UUID REFERENCES purchases(id),
  supplier_id      UUID REFERENCES suppliers(id),
  manufacture_date TIMESTAMPTZ,
  expiry_date      TIMESTAMPTZ NOT NULL,
  initial_quantity INT NOT NULL DEFAULT 0,
  quantity         INT NOT NULL DEFAULT 0,
  unit_cost        DECIMAL(10,2),
  notes            TEXT,
  user_id          UUID NOT NULL REFERENCES users(id),
  store_id         UUID NOT NULL REFERENCES stores(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX batches_medicine_id_idx ON batches (medicine_id);
CREATE INDEX batches_expiry_date_idx ON batches (expiry_date);
CREATE INDEX batches_store_expiry_idx ON batches (store_id, expiry_date);
CREATE INDEX batches_store_created_idx ON batches (store_id, created_at);

-- ─────────────────────────── Inventario & Ventas ───────────────────────────

CREATE TABLE inventory_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id   UUID NOT NULL REFERENCES medicines(id),
  movement_type TEXT NOT NULL,
  quantity      INT NOT NULL,
  note          TEXT,
  batch_id      UUID REFERENCES batches(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  store_id      UUID NOT NULL REFERENCES stores(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX inventory_movements_medicine_id_idx ON inventory_movements (medicine_id);
CREATE INDEX inventory_movements_batch_id_idx ON inventory_movements (batch_id);
CREATE INDEX inventory_movements_store_created_idx ON inventory_movements (store_id, created_at);
CREATE INDEX inventory_movements_store_type_idx ON inventory_movements (store_id, movement_type);

CREATE TABLE sales (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtotal           DECIMAL(10,2) NOT NULL,
  total              DECIMAL(10,2) NOT NULL,
  payment_method     TEXT NOT NULL,
  amount_received    DECIMAL(10,2),
  change_given       DECIMAL(10,2),
  status             TEXT NOT NULL DEFAULT 'completada',
  cancellation_reason TEXT,
  cancelled_at       TIMESTAMPTZ,
  cancelled_by       TEXT,
  user_id            UUID NOT NULL REFERENCES users(id),
  user_name          TEXT,
  client_id          UUID REFERENCES clients(id),
  prescription_id    UUID REFERENCES prescriptions(id),
  store_id           UUID NOT NULL REFERENCES stores(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sales_user_id_idx ON sales (user_id);
CREATE INDEX sales_client_id_idx ON sales (client_id);
CREATE INDEX sales_status_idx ON sales (status);
CREATE INDEX sales_store_created_idx ON sales (store_id, created_at);

CREATE TABLE sale_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id       UUID NOT NULL REFERENCES sales(id),
  medicine_id   UUID NOT NULL REFERENCES medicines(id),
  medicine_name TEXT NOT NULL,
  quantity      INT NOT NULL,
  unit_price    DECIMAL(10,2) NOT NULL,
  line_total    DECIMAL(10,2) NOT NULL,
  batch_id      UUID REFERENCES batches(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sale_items_sale_id_idx ON sale_items (sale_id);
CREATE INDEX sale_items_medicine_id_idx ON sale_items (medicine_id);
CREATE INDEX sale_items_batch_id_idx ON sale_items (batch_id);

-- ─────────────────────────── Facturación & Configuración ───────────────────────────

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number          TEXT NOT NULL,
  invoice_type    TEXT NOT NULL DEFAULT 'ticket',
  sale_id         UUID NOT NULL REFERENCES sales(id),
  client_id       UUID REFERENCES clients(id),
  client_name     TEXT,
  client_document TEXT,
  client_address  TEXT,
  client_phone    TEXT,
  client_email    TEXT,
  subtotal        DECIMAL(10,2) NOT NULL,
  total           DECIMAL(10,2) NOT NULL,
  status          TEXT NOT NULL DEFAULT 'emitida',
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    TEXT,
  issued_by       TEXT,
  store_id        UUID NOT NULL REFERENCES stores(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, number)
);
CREATE INDEX invoices_sale_id_idx ON invoices (sale_id);
CREATE INDEX invoices_client_id_idx ON invoices (client_id);
CREATE INDEX invoices_invoice_type_idx ON invoices (invoice_type);
CREATE INDEX invoices_store_created_idx ON invoices (store_id, created_at);

CREATE TABLE settings (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL DEFAULT 'Mi Farmacia',
  address               TEXT,
  phone                 TEXT,
  email                 TEXT,
  ruc                   TEXT,
  opening_hours         TEXT,
  low_stock_threshold   INT NOT NULL DEFAULT 5,
  expiration_alert_days INT NOT NULL DEFAULT 60,
  currency              TEXT NOT NULL DEFAULT 'NIO',
  ticket_footer         TEXT,
  store_id              UUID NOT NULL UNIQUE REFERENCES stores(id),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX settings_store_id_idx ON settings (store_id);

CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  user_name  TEXT,
  action     TEXT NOT NULL,
  module     TEXT NOT NULL,
  entity_id  TEXT,
  details    TEXT,
  ip_address TEXT,
  store_id   UUID NOT NULL REFERENCES stores(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_user_id_idx ON audit_logs (user_id);
CREATE INDEX audit_logs_module_idx ON audit_logs (module);
CREATE INDEX audit_logs_store_created_idx ON audit_logs (store_id, created_at);

-- ─────────────────────────── Impresión ───────────────────────────

CREATE TABLE printers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id),
  name            TEXT NOT NULL,
  connection_type PRINTER_CONN_TYPE NOT NULL,
  address         TEXT NOT NULL,
  port            INT,
  paper_width     INT NOT NULL,
  profile         PRINTER_PROFILE NOT NULL DEFAULT 'escpos',
  codepage        TEXT NOT NULL DEFAULT 'PC850',
  auto_cut        BOOLEAN NOT NULL DEFAULT true,
  cut_type        TEXT,
  open_cash_drawer BOOLEAN NOT NULL DEFAULT false,
  default_copies  INT NOT NULL DEFAULT 1,
  role            TEXT NOT NULL,
  is_default      BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_status     PRINTER_STATUS NOT NULL DEFAULT 'unknown',
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (store_id, name)
);
CREATE INDEX printers_store_active_idx ON printers (store_id, is_active);
CREATE INDEX printers_store_default_idx ON printers (store_id, is_default);

CREATE TABLE printer_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printer_id  UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  category_id UUID,
  role        TEXT NOT NULL,
  priority    INT NOT NULL DEFAULT 0,
  UNIQUE (printer_id, category_id)
);
CREATE INDEX printer_assignments_printer_id_idx ON printer_assignments (printer_id);
CREATE INDEX printer_assignments_category_id_idx ON printer_assignments (category_id);

CREATE TABLE print_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printer_id   UUID NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
  sale_id      UUID REFERENCES sales(id),
  payload      BYTEA NOT NULL,
  status       TEXT NOT NULL,
  attempts     INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  error_msg    TEXT,
  enqueued_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at      TIMESTAMPTZ,
  finished_at  TIMESTAMPTZ
);
CREATE INDEX print_jobs_printer_status_idx ON print_jobs (printer_id, status);
CREATE INDEX print_jobs_status_enqueued_idx ON print_jobs (status, enqueued_at);
CREATE INDEX print_jobs_sale_id_idx ON print_jobs (sale_id);
