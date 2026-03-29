import pino from 'pino'

// Set VITE_LOG_LEVEL=debug in .env.local to see verbose logs in dev.
// In production builds, defaults to 'warn' so only real problems surface.
const level = import.meta.env.VITE_LOG_LEVEL ?? (import.meta.env.DEV ? 'debug' : 'warn')

export const logger = pino({
  browser: {
    // Serialise each log as a single console call with structured data.
    // Swap 'asObject' for 'object' if you prefer the browser's grouping UI.
    transmit: undefined,
    serialize: true,
    asObject: false,
  },
  level,
  base: {
    app: import.meta.env.VITE_APP_NAME ?? 'dashboard',
  },
})

// Pre-bound child loggers — import these directly instead of the root logger
// so every log line already carries a 'module' field for easy filtering.
export const apiLogger = logger.child({ module: 'api' })
export const routerLogger = logger.child({ module: 'router' })
export const authLogger = logger.child({ module: 'auth' })
