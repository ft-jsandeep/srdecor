'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package,
  ArrowLeft
} from 'lucide-react'

export default function WarehousePage() {
  const { items, loadingItems, deleteItem, searchItems } = useApp()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState(items)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hsn.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(items)
    }
  }, [searchTerm, items])

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowAddModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Warehouse</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredItems.length} of {items.length} items
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {loadingItems ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Package className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">HSN: {item.hsn}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id!)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Default Rate:</span>
                  <span className="font-medium">₹{item.defaultRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit:</span>
                  <span className="font-medium">{item.defaultUnit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax %:</span>
                  <span className="font-medium">{item.defaultTax}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No items found' : 'No items added yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first product'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddNew}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Your First Item
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <ItemModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p className="text-gray-600">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Item Modal Component
function ItemModal({ item, onClose }: { item: any, onClose: () => void }) {
  const { saveItem, updateItem } = useApp()
  const [formData, setFormData] = useState({
    name: item?.name || '',
    hsn: item?.hsn || '',
    defaultRate: item?.defaultRate || 0,
    defaultUnit: item?.defaultUnit || 'pcs',
    defaultTax: item?.defaultTax || 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (item) {
        await updateItem(item.id, formData)
      } else {
        await saveItem(formData)
      }
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="form-label">HSN Code *</label>
              <input
                type="text"
                value={formData.hsn}
                onChange={(e) => setFormData(prev => ({ ...prev, hsn: e.target.value }))}
                className="form-input"
                placeholder="e.g., 44219990"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Default Unit *</label>
              <select
                value={formData.defaultUnit}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultUnit: e.target.value }))}
                className="form-select"
                required
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
                <option value="m">Meters</option>
                <option value="cm">Centimeters</option>
                <option value="ft">Feet</option>
                <option value="hrs">Hours</option>
                <option value="days">Days</option>
                <option value="sqm">Square Meters</option>
                <option value="sqft">Sq. Ft.</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Default Price *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.defaultRate}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultRate: parseFloat(e.target.value) || 0 }))}
                className="form-input"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Default Tax %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.defaultTax}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultTax: parseFloat(e.target.value) || 0 }))}
                className="form-input"
                placeholder="e.g., 18"
              />
              <p className="text-xs text-gray-500 mt-1">
                This tax will be automatically applied when adding this item to bills
              </p>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Save Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
