import { ScreenSizeGuard } from '@/components/admin/ScreenSizeGuard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ScreenSizeGuard>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        {children}
      </div>
    </ScreenSizeGuard>
  )
}


