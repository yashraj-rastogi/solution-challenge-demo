import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SessionProvider } from '../auth/SessionProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <BrowserRouter>
      <SessionProvider>{children}</SessionProvider>
    </BrowserRouter>
  )
}
