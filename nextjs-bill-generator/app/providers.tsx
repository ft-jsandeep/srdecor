'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: '40px', minHeight: '100vh', backgroundColor: '#faf9f7' }}>
      <h1 style={{ fontSize: '24px', color: '#d32f2f', marginBottom: '16px' }}>Error</h1>
      <p style={{ color: '#666', marginBottom: '16px' }}>{error.message}</p>
      <pre style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '8px', overflow: 'auto', fontSize: '12px' }}>
        {error.stack}
      </pre>
    </div>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
