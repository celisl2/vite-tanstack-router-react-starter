import { apiLogger } from '#/lib/logger'

const BASE_URL = import.meta.env.VITE_API_URL

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET'
  const url = `${BASE_URL}${path}`
  const start = performance.now()

  apiLogger.debug({ method, url }, 'request started')

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  const duration = Math.round(performance.now() - start)

  if (!res.ok) {
    const body = await res.text()
    apiLogger.error({ method, url, status: res.status, duration, body }, 'request failed')
    throw new Error(`API error ${res.status}: ${body}`)
  }

  apiLogger.info({ method, url, status: res.status, duration }, 'request completed')
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
