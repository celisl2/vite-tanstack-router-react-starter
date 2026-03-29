/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

/**
 * this is a typescript declaration file which tells typescript about types that exist at runtime but arent in source files
 * If you use CSS Modules with camelCase conversion in your vite.config.ts,
 * you can optionally refine the types here. 
 * * By default, the triple-slash reference above handles standard 
 * .module.css imports and asset imports (svg, png, etc.).
 */