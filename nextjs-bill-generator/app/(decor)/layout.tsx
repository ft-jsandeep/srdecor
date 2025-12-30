'use client'

import { Navbar } from '@/components/decor/Navbar'
import { Footer } from '@/components/decor/Footer'
import { TopBanner } from '@/components/decor/TopBanner'

export default function DecorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}




