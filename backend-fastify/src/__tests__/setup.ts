/**
 * Global test setup — runs once before all test files.
 *
 * Currently a no-op placeholder. Add global mocks, polyfills,
 * or test-database setup here as the suite grows.
 */
import { vi } from "vitest"

// Silence noisy console output during tests.
// Comment these out when debugging specific test runs.
vi.spyOn(console, "log").mockImplementation(() => {})
vi.spyOn(console, "error").mockImplementation(() => {})
vi.spyOn(console, "warn").mockImplementation(() => {})
