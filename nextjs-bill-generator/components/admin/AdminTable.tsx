'use client'

import { Product } from '@/data/products'
import { Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface AdminTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function AdminTable({ products, onEdit, onDelete }: AdminTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Image</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Name</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Category</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Price</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Status</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-600 line-clamp-1">
                  {product.description}
                </div>
              </td>
              <td className="py-4 px-4 text-gray-900">{product.category}</td>
              <td className="py-4 px-4 text-gray-900">
                ₹{product.price.toLocaleString('en-IN')}
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-col gap-1">
                  {product.isBestseller && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 w-fit">
                      Bestseller
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 w-fit">
                      New
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Link href={`/products/${product.id}`} target="_blank">
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Eye size={18} className="text-gray-400" />
                    </button>
                  </Link>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={18} className="text-gray-400" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


