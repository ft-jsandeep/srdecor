'use client'

import { ScreenSizeGuard } from '@/components/admin/ScreenSizeGuard'
import { useState } from 'react'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminForm } from '@/components/admin/AdminForm'
import { Modal } from '@/components/decor/Modal'
import { products as initialProducts, Product } from '@/data/products'
import { Plus } from 'lucide-react'

function AdminProductsPageContent() {
  const [products, setProducts] = useState(initialProducts)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter((p) => p.id !== id))
    }
  }

  const handleSave = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...editingProduct, ...productData } : p))
      )
    } else {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
      }
      setProducts([...products, newProduct])
    }
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">SR Décor Products</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>

        <div className="card">
          <AdminTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        <Modal
          isOpen={isFormOpen}
          onClose={handleCancel}
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
        >
          <AdminForm product={editingProduct} onSave={handleSave} onCancel={handleCancel} />
        </Modal>
      </div>
  )
}

export default function AdminProductsPage() {
  return (
    <ScreenSizeGuard>
      <AdminProductsPageContent />
    </ScreenSizeGuard>
  )
}

