'use client'

import { useState, useEffect } from 'react'
import { Product } from '@/data/products'
import { X } from 'lucide-react'

interface AdminFormProps {
  product?: Product | null
  onSave: (product: Omit<Product, 'id'>) => void
  onCancel: () => void
}

export function AdminForm({ product, onSave, onCancel }: AdminFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Furniture',
    isBestseller: false,
    isNewArrival: false,
    images: [''],
    material: '',
    dimensions: '',
    color: '',
    weight: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        isBestseller: product.isBestseller,
        isNewArrival: product.isNewArrival,
        images: product.images,
        material: product.specifications?.material || '',
        dimensions: product.specifications?.dimensions || '',
        color: product.specifications?.color || '',
        weight: product.specifications?.weight || '',
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const productData: Omit<Product, 'id'> = {
      name: formData.name,
      description: formData.description,
      price: parseInt(formData.price),
      category: formData.category,
      isBestseller: formData.isBestseller,
      isNewArrival: formData.isNewArrival,
      images: formData.images.filter((img) => img.trim() !== ''),
      specifications: {
        material: formData.material || undefined,
        dimensions: formData.dimensions || undefined,
        color: formData.color || undefined,
        weight: formData.weight || undefined,
      },
    }
    onSave(productData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="form-select"
          >
            <option value="Furniture">Furniture</option>
            <option value="Accessories">Accessories</option>
            <option value="Textiles">Textiles</option>
            <option value="Lighting">Lighting</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="form-textarea"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price (₹) *
        </label>
        <input
          type="number"
          required
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="form-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URLs (one per line)
        </label>
        {formData.images.map((img, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={img}
              onChange={(e) => {
                const newImages = [...formData.images]
                newImages[index] = e.target.value
                setFormData({ ...formData, images: newImages })
              }}
              className="form-input flex-1"
              placeholder="https://example.com/image.jpg"
            />
            {formData.images.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  const newImages = formData.images.filter((_, i) => i !== index)
                  setFormData({ ...formData, images: newImages })
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          + Add Image URL
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Material
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimensions
          </label>
          <input
            type="text"
            value={formData.dimensions}
            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="form-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight
          </label>
          <input
            type="text"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="form-input"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isBestseller}
            onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Bestseller</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isNewArrival}
            onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">New Arrival</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="submit" className="btn btn-primary">
          {product ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}


