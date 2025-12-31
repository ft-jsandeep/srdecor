'use client'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Monitor } from 'lucide-react'

export function ScreenSizeGuard({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="p-6 rounded-full bg-light-surface dark:bg-dark-surface">
              <Monitor className="text-light-textMuted dark:text-dark-textMuted" size={64} />
            </div>
          </div>
          <h1 className="font-sans text-3xl font-bold text-light-text dark:text-dark-text mb-4">
            Screen Not Supported
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted mb-6">
            Admin panel is accessible only on tablets and desktops. Please access this page from a device with a screen width of 768px or larger.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}










