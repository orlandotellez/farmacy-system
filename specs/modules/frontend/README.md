# Frontend Module

Frontend de **FARMACY** — React 19 + Vite 7 + Tauri 2.

## Contents

| Archivo | Descripción |
|---------|-------------|
| [01-stack.md](./01-stack.md) | Stack tecnológico, dependencias y decisiones técnicas |
| [02-design.md](./02-design.md) | Identidad visual: tema claro/oscuro, CSS Modules, componentes |
| [03-architecture.md](./03-architecture.md) | Arquitectura: carpetas, API layer, estado, hooks, Tauri |
| [04-screens.md](./04-screens.md) | Detalle de todas las pantallas y sus componentes |
| [05-quality.md](./05-quality.md) | Criterios de calidad obligatorios |
| [06-print.md](./06-print.md) | Impresión de tickets: HTML + TCP ESC/POS (Rust) |

## Stack

| Componente | Tecnología |
|------------|------------|
| Framework | React 19 + TypeScript strict |
| Build | Vite 7 (`@vitejs/plugin-react-swc`) |
| Desktop | Tauri 2 (Rust: `http_client.rs`, `tcp_printer.rs`) |
| Routing | react-router-dom 7 |
| Estado global | Zustand 5 (`ventaStore`) |
| API calls | fetch propio + `crossFetch` (web / Tauri invoke) |
| Iconos | lucide-react |
| Charts | Recharts 3 (reportes) |
| Barcode | html5-qrcode (escáner de cámara) |
| Estilos | CSS Modules (`.module.css`) + CSS variables en `index.css` |
| Package manager | pnpm |
