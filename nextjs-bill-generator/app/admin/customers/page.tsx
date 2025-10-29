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
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function CustomersPage() {
  const { customers, loadingCustomers, deleteCustomer } = useApp()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCustomers, setFilteredCustomers] = useState(customers)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const handleDelete = async (customerId: string) => {
    try {
      await deleteCustomer(customerId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer)
    setShowAddModal(true)
  }

  const handleAddNew = () => {
    setEditingCustomer(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-600 mt-1">Manage your customer database</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add Customer
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Customers List */}
      {loadingCustomers ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                    <p className="text-sm text-gray-500">GSTIN: {customer.gstin || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(customer.id!)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {customer.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <div className="text-gray-600">
                      <div>{customer.address}</div>
                      {customer.city && customer.state && (
                        <div className="text-xs text-gray-500">
                          {customer.city}, {customer.state.replace(/\s*\(\d+\)/, '')} {customer.pincode}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No customers found' : 'No customers added yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first customer'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddNew}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              Add Your First Customer
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Customer Modal */}
      {showAddModal && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowAddModal(false)
            setEditingCustomer(null)
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
                Are you sure you want to delete this customer? This action cannot be undone.
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

// Customer Modal Component
function CustomerModal({ customer, onClose }: { customer: any, onClose: () => void }) {
  const { saveCustomer, updateCustomer } = useApp()
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    state: customer?.state || '',
    pincode: customer?.pincode || '',
    gstin: customer?.gstin || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const INDIAN_STATES = [
    'Andhra Pradesh (37)', 'Arunachal Pradesh (12)', 'Assam (18)', 'Bihar (10)',
    'Chhattisgarh (22)', 'Goa (30)', 'Gujarat (24)', 'Haryana (06)',
    'Himachal Pradesh (02)', 'Jharkhand (20)', 'Karnataka (29)', 'Kerala (32)',
    'Madhya Pradesh (23)', 'Maharashtra (27)', 'Manipur (14)', 'Meghalaya (17)',
    'Mizoram (15)', 'Nagaland (13)', 'Odisha (21)', 'Punjab (03)',
    'Rajasthan (08)', 'Sikkim (11)', 'Tamil Nadu (33)', 'Telangana (36)',
    'Tripura (16)', 'Uttar Pradesh (09)', 'Uttarakhand (05)', 'West Bengal (19)',
    'Andaman and Nicobar Islands (35)', 'Chandigarh (04)', 'Dadra and Nagar Haveli and Daman and Diu (26)',
    'Delhi (07)', 'Jammu and Kashmir (01)', 'Ladakh (38)', 'Lakshadweep (31)', 'Puducherry (34)'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (customer) {
        await updateCustomer(customer.id, formData)
      } else {
        await saveCustomer(formData)
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
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Customer Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">GSTIN *</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData(prev => ({ ...prev, gstin: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="form-label">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="form-label">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="form-select"
                  required
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="form-input"
                />
              </div>
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
              {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Save Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
