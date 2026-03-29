import { Outlet, createRootRoute, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import '../styles.css'
import { routerLogger } from '#/lib/logger'

/**
 *
 * @param param0 adds a debug log on every navigation and an error log when something bubbles up to the global error boundary.
 * @returns
 */
function RootErrorBoundary({ error }: { error: Error }) {
  const router = useRouter()

  // Errors that bubble up to the root boundary are unexpected — log them
  // at 'error' level so they show up even in production (level: 'warn').
  routerLogger.error({ err: error, route: 'root' }, 'unhandled route error')

  return (
    <div>
      <h1>Something went wrong</h1>
      <pre>{error.message}</pre>
      <button onClick={() => router.invalidate()}>Try again</button>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
  beforeLoad: ({ location }) => {
    routerLogger.debug({ pathname: location.pathname }, 'navigating')
  },
  errorComponent: RootErrorBoundary,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
