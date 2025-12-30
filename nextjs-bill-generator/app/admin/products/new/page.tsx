'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScreenSizeGuard } from '@/components/admin/ScreenSizeGuard'
import { AdminForm } from '@/components/admin/AdminForm'
import { Product } from '@/data/products'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function AdminNewProductPageContent() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (productData: Omit<Product, 'id'>) => {
    setIsSaving(true)
    // In a real app, this would save to a database
    // For now, just redirect
    setTimeout(() => {
      router.push('/admin/products')
    }, 500)
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  return (
    <div className="space-y-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Products
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>
          <AdminForm product={null} onSave={handleSave} onCancel={handleCancel} />
        </div>
      </div>
  )
}

export default function AdminNewProductPage() {
  return (
    <ScreenSizeGuard>
      <AdminNewProductPageContent />
    </ScreenSizeGuard>
  )
}

