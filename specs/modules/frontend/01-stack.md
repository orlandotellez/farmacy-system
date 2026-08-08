# Frontend Stack

Stack tecnológico del frontend de FARMACY.

---

## Core Technologies

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19 | UI Library |
| **TypeScript** | ~5.9 | Tipado estricto |
| **Vite** | 7 | Build/dev server |
| **Tauri 2** | ^2 | Desktop app (Rust backend) |
| **pnpm** | latest | Package manager |

## Navegación

| Librería | Propósito |
|----------|-----------|
| **react-router-dom** | ^7.13 | Routing (BrowserRouter en `main.tsx`) |

## State Management

| Capa | Herramienta | Para qué |
|------|-------------|----------|
| Estado local | `useState` / `useReducer` | Componentes (modales, filtros) |
| Estado global | **Zustand** 5 | Carrito y flujo de venta (`ventaStore`) |
| Contexto | `AuthContext`, `ThemeContext` | Sesión, tema claro/oscuro |

## Data Fetching

| Aspecto | Decisión |
|---------|----------|
| HTTP client | `crossFetch` (Tauri `invoke("http_request")` en desktop; `fetch` en web) |
| API layer | `src/api/` — 1 archivo por recurso (`medicines.ts`, `sales.ts`, ...) |
| Cliente base | `src/api/client.ts` — `api.get/post/put/patch/delete` + `Paginated<T>` + `ApiError` |
| Cache | `lib/simple-cache.ts` (namespace por recurso, `cacheClear`) |
| Debounce | `useDebouncedSearch` / `useDebouncedValue` (220 ms en POS) |

## UI & Components

| Librería | Propósito |
|----------|-----------|
| **lucide-react** | Iconos SVG |
| **recharts** | Gráficos de reportes (Revenue, CashFlow, Payments, TopProducts) |
| **html5-qrcode** | Escáner de código de barras con cámara |
| **CSS Modules** | Estilos por componente + `index.css` con variables de tema |

## Tauri (desktop)

```
src-tauri/
├── src/
│   ├── main.rs / lib.rs     # Commands: http_request, tcp_print
│   ├── http_client.rs       # reqwest::Client estático (bypasea CORS)
│   └── tcp_printer.rs       # Envío ESC/POS por TCP
├── capabilities/default.json
└── tauri.conf.json
```

## Dependencies (package.json)

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2", "@tauri-apps/plugin-opener": "^2",
    "html5-qrcode": "^2.3.8", "lucide-react": "^0.575.0",
    "react": "^19.2.0", "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0", "recharts": "^3.9.0", "zustand": "^5.0.11"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2", "@vitejs/plugin-react-swc": "^4.2.2",
    "eslint": "^9", "typescript": "~5.9.3", "vite": "^7.3.1"
  }
}
```

## Stack Decisiones Técnicas

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Framework | React 19 + Vite | Rápido, ecosistema, TS nativo |
| Desktop | Tauri 2 | Binario ligero, Rust para TCP/impresión |
| Estado global | Zustand | ~1KB, sin boilerplate |
| API calls | fetch propio + crossFetch | Cero dependencias, funciona en web y Tauri |
| Estilos | CSS Modules | Scoped, theme con variables |
| Charts | Recharts | Declarativo, bueno para reportes |
| Barcode | html5-qrcode | Escáner con cámara sin librerías nativas |
