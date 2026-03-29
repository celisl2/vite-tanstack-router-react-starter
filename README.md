# TanStack Dashboard

A modern React dashboard built with TanStack Router, TanStack Query, Vite, and TypeScript.

## Getting started

```bash
pnpm install
pnpm dev
```

## Building for production

```bash
pnpm build
pnpm preview
```

## Testing

```bash
pnpm test
```

## Linting and formatting

```bash
pnpm lint       # check for lint errors
pnpm format     # check formatting
pnpm check      # auto-fix lint + formatting
```

---

## Routing

Routes are file-based under `src/routes/`. TanStack Router auto-generates route types from the file structure.

### Adding a route

Create a new file in `src/routes/` and TanStack Router picks it up automatically. Use the `Link` component for SPA navigation:

```tsx
import { Link } from '@tanstack/react-router'
;<Link to="/dashboard">Dashboard</Link>
```

### Layouts

The root layout lives in `src/routes/__root.tsx`. Anything rendered there appears on every route. Nested folders create nested layouts — a `src/routes/settings/__layout.tsx` wraps all routes under `/settings`.

---

## Environment variables

Vite handles environment variables at build time with no extra packages needed. Variables are statically replaced in your bundle — there is no runtime injection.

### The VITE\_ prefix rule

Only variables prefixed with `VITE_` are exposed to the browser. Anything without the prefix is intentionally invisible to the client, even if you try to access it.

```bash
VITE_API_URL=https://api.example.com   # available in the browser
SECRET_KEY=abc123                       # never included in the bundle
```

### File loading order

Vite reads `.env` files from the project root. Files lower in this list take priority:

```
.env                    # always loaded — shared defaults
.env.local              # always loaded — your local overrides, never commit this
.env.development        # dev only (pnpm dev)
.env.production         # prod only (pnpm build)
.env.development.local
.env.production.local
```

A typical setup: put public defaults in `.env`, personal secrets in `.env.local`, and environment-specific API URLs in `.env.development` / `.env.production`.

### Built-in variables

Vite exposes these without any setup:

```ts
import.meta.env.MODE // 'development' | 'production' | 'test'
import.meta.env.DEV // true during pnpm dev
import.meta.env.PROD // true after pnpm build
import.meta.env.BASE_URL // base path from vite.config.ts
```

### Adding your own variables

Create a `.env.local` file in the project root (never commit this):

```bash
VITE_API_URL=https://api.your-backend.com
VITE_APP_NAME=My Dashboard
```

Access them in code via `import.meta.env`:

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

Extend `ImportMetaEnv` in `src/vite-env.d.ts` to get TypeScript autocomplete and type safety:

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### One gotcha — static replacement

Vite does a find-and-replace at build time, not runtime injection. Dynamic key access does not work:

```ts
// ✓ works
const url = import.meta.env.VITE_API_URL

// ✗ breaks — Vite cannot resolve a dynamic key
const key = 'VITE_API_URL'
const url = import.meta.env[key]
```

This also means env values are baked into the bundle at build time. Changing `VITE_API_URL` in production requires a rebuild.

### Validating required variables

Vite does not error if a variable is missing — it returns `undefined` silently. Add this check to `src/main.tsx` to catch missing variables at startup:

```ts
const requiredEnvVars = ['VITE_API_URL'] as const

for (const key of requiredEnvVars) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}
```

### What to commit

| File              | Commit?                              |
| ----------------- | ------------------------------------ |
| `.env`            | Yes — safe defaults only, no secrets |
| `.env.local`      | Never — add to `.gitignore`          |
| `.env.production` | Yes — if it contains no secrets      |
| `.env.*.local`    | Never — add to `.gitignore`          |

Your `.gitignore` should already contain `*.local` if you used a Vite scaffold.

All client-side variables must be prefixed with `VITE_`. Variables without this prefix are build-time only and never sent to the browser.

Create a `.env.local` file (never commit this):

```bash
VITE_API_URL=https://api.your-backend.com
VITE_APP_NAME=My Dashboard
```

Access them in your code:

```ts
const apiUrl = import.meta.env.VITE_API_URL
```

Add type declarations to `src/vite-env.d.ts` to get autocomplete:

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

For different environments, use `.env.development` and `.env.production` alongside `.env.local`.

---

## Calling a backend server

All API calls are managed through TanStack Query. Define a typed fetch helper and wrap it in query/mutation hooks.

### Setting up the API client

Create `src/lib/api.ts`:

```ts
const BASE_URL = import.meta.env.VITE_API_URL

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Add auth headers here — see Auth section below
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
}
```

### Querying data

```tsx
import { useQuery } from '@tanstack/react-query'
import { api } from '#/lib/api'

type User = { id: string; name: string; email: string }

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

function UserList() {
  const { data, isPending, isError } = useUsers()

  if (isPending) return <p>Loading...</p>
  if (isError) return <p>Failed to load users.</p>

  return (
    <ul>
      {data.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  )
}
```

### Mutating data

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'

function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { name: string; email: string }) => api.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

---

## Auth and route protection

Use [Better Auth](https://www.better-auth.com/) for session management. It is framework-agnostic and TypeScript-first.

### Installing

```bash
pnpm add better-auth
```

Follow the Better Auth setup guide to initialise a client in `src/lib/auth.ts`.

### Protecting routes with beforeLoad

Add a `beforeLoad` guard to your root route in `src/routes/__root.tsx` to protect the entire dashboard. Unauthenticated users are redirected to `/login` before any component renders:

```tsx
import { createRootRoute, redirect } from '@tanstack/react-router'
import { authClient } from '#/lib/auth'

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()

    if (!session && location.pathname !== '/login') {
      throw redirect({ to: '/login' })
    }
  },
})
```

For per-route protection (e.g. admin-only pages), add `beforeLoad` to that specific route file instead.

### Passing auth headers to the API

Update `src/lib/api.ts` to attach the session token to every request:

```ts
import { authClient } from '#/lib/auth'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const session = await authClient.getSession()

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token && { Authorization: `Bearer ${session.token}` }),
    },
    ...options,
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}
```

---

## Loading states

Use `pendingComponent` on any route to show a loading UI while data is being fetched. The `pendingMs` option prevents a flash for fast loads.

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/stats`)
    return res.json()
  },
  pendingMs: 300,
  pendingComponent: () => (
    <div className="flex items-center justify-center p-8">
      <span>Loading...</span>
    </div>
  ),
  component: DashboardPage,
})
```

For a global loading fallback, add `pendingComponent` to `__root.tsx` so it covers the initial app load too.

---

## Error boundaries

TanStack Router provides per-route error boundaries via `errorComponent`. Add one to `__root.tsx` for a global fallback, and override per-route for more specific messaging.

### Global fallback in `__root.tsx`

```tsx
import { createRootRoute, useRouter } from '@tanstack/react-router'

function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={() => router.invalidate()}>Try again</button>
    </div>
  )
}

export const Route = createRootRoute({
  errorComponent: RootErrorBoundary,
})
```

### Per-route error component

```tsx
export const Route = createFileRoute('/dashboard/users')({
  errorComponent: ({ error }) => (
    <div>
      <p>Failed to load users: {error.message}</p>
    </div>
  ),
  component: UsersPage,
})
```

For TanStack Query errors, the `isError` flag on `useQuery` lets you handle fetch failures inline in the component without needing the route-level boundary.

### Example

how to use a scoped child logger inside a component or hook. Import the relevant pre-bound logger from lib/logger, or create a child scoped to the specific feature when you need extra context fields.

```tsx
import { logger } from '#/lib/logger'

// Create once outside the component — child() is cheap but no need to call
// it on every render.
const log = logger.child({ module: 'user-settings' })

export function useUserSettings() {
  function saveSettings(values: Record<string, unknown>) {
    log.debug({ values }, 'saving settings')

    try {
      // ... save logic
      log.info('settings saved successfully')
    } catch (err) {
      log.error({ err }, 'failed to save settings')
      throw err
    }
  }

  return { saveSettings }
}
```

---

## Image optimization

`vite-imagetools` handles build-time resizing and modern format conversion (WebP, AVIF).

### Installing

```bash
pnpm add -D vite-imagetools
```

Add it to `vite.config.ts`:

```ts
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  plugins: [
    imagetools(),
    // ...your existing plugins
  ],
})
```

### Using it

Append query params to any image import to transform it at build time:

```tsx
// Resize to 800px wide and convert to WebP
import heroImage from './assets/hero.jpg?w=800&format=webp'
;<img src={heroImage} width={800} alt="Hero" />
```

### Responsive images with srcset

```tsx
import { Picture, Source } from 'vite-imagetools'
import heroAvif from './assets/hero.jpg?w=400;800;1200&format=avif'
import heroWebp from './assets/hero.jpg?w=400;800;1200&format=webp'
import heroFallback from './assets/hero.jpg?w=800'
;<picture>
  <source srcSet={heroAvif} type="image/avif" />
  <source srcSet={heroWebp} type="image/webp" />
  <img src={heroFallback} alt="Hero" loading="lazy" decoding="async" />
</picture>
```

For images served from external sources (S3, Cloudinary, etc.), use their built-in transformation URLs instead and skip `vite-imagetools` for those assets.

---

## CSS modules

CSS files ending in `.module.css` are scoped locally. Class names are available as camelCase properties (configured in `vite.config.ts`):

```tsx
import styles from './Button.module.css'
;<button className={styles.primaryButton}>Click me</button>
```

---

## Learn more

- [TanStack Router docs](https://tanstack.com/router/latest)
- [TanStack Query docs](https://tanstack.com/query/latest)
- [Better Auth docs](https://www.better-auth.com/)
- [vite-imagetools docs](https://github.com/JonasKruckenberg/imagetools)
- [Vite docs](https://vitejs.dev/)
