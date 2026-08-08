# 13. Impresión de Ticket

**Descripción**: Tras una venta, el cajero imprime el ticket en la impresora térmica.

**Actores**: Cajero, Sistema

**Tablas involucradas**: `print_jobs`, `printers`, `sales`, `settings`

```mermaid
sequenceDiagram
    actor C as Cajero
    participant UI as Frontend (POS/Tauri)
    participant B as Backend (API)
    participant DB as PostgreSQL

    C->>UI: "Imprimir ticket" tras la venta
    alt En Tauri (desktop)
        UI->>UI: buildTicketHtml (desde settings + sale)
        UI->>UI: invoke('tcp_print') → Rust envía ESC/POS por TCP
    else Via backend
        UI->>B: POST /printers/:id/print-receipt { sale_id }
        B->>DB: Busca sale + printer
        B->>B: Encoder genera payload ESC/POS (cabecera, items, total, corte)
        B->>DB: INSERT print_jobs (payload, status='pending')
        B->>B: Envía por TCP con reintentos (max 3)
        B->>DB: UPDATE print_jobs (status, attempts, error)
        B->>DB: UPDATE printers (last_status, last_seen_at)
        B-->>UI: Resultado de impresión
    end
```
