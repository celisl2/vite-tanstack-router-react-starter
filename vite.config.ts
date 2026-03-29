import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    },
  ),
  
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react','react-dom'], tanstack: ['@tanstack/react-router','@tanstack/react-query'] }
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly', 
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})

export default config
