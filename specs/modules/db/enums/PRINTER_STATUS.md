# `PRINTER_STATUS`

Estado operativo de la impresora.

| Valor | Descripción |
|-------|-------------|
| `unknown` | Desconocido (default inicial) |
| `online` | En línea y respondiendo |
| `offline` | Sin conexión |
| `error` | Error |
| `out_of_paper` | Sin papel |

Se actualiza con `last_status` / `last_seen_at` tras `probe` o envíos.
