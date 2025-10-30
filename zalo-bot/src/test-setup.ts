// Minimal test setup loaded by Bun before running tests.
// Keep it minimal: can be expanded later to add globals or mocks.

// Example: set NODE_ENV to test
globalThis.process ||= { env: {} } as any
;(globalThis.process as any).env.NODE_ENV = "test"

export {}
