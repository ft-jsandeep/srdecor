'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BillPreview from '@/components/BillPreview'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  FileText,
  Calendar,
  User,
  DollarSign
} from 'lucide-react'

export default function BillsPage() {
  const { bills, loadingBills, deleteBill, searchBills } = useApp()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBills, setFilteredBills] = useState(bills)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [editingBill, setEditingBill] = useState<any>(null)

  useEffect(() => {
    if (searchTerm) {
      setFilteredBills(searchBills(searchTerm))
    } else {
      setFilteredBills(bills)
    }
  }, [searchTerm, bills, searchBills])

  const handleDelete = async (billId: string) => {
    try {
      await deleteBill(billId)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting bill:', error)
    }
  }

  const handleView = (bill: any) => {
    setPreviewData(bill)
    setShowPreview(true)
  }

  const handleEdit = (bill: any) => {
    // For now, redirect to new-bill page with the bill data
    // In a real app, you might want to create a separate edit page
    router.push(`/admin/new-bill?edit=${bill.id}`)
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    
    let jsDate
    if (date && typeof date.toDate === 'function') {
      jsDate = date.toDate()
    } else if (date instanceof Date) {
      jsDate = date
    } else {
      jsDate = new Date(date)
    }
    
    if (isNaN(jsDate.getTime())) return 'Invalid Date'
    
    return jsDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getBillTypeColor = (billType: string) => {
    return billType === 'invoice' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bills</h1>
          <p className="text-gray-600 mt-1">Manage your invoices and estimates</p>
        </div>
        <Link
          href="/admin/new-bill"
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Bill
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredBills.length} of {bills.length} bills
          </div>
        </div>
      </div>

      {/* Bills List */}
      {loadingBills ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredBills.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <div className="font-medium text-gray-900">
                        {bill.billNumber || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBillTypeColor(bill.billType)}`}>
                        {bill.billType === 'invoice' ? 'Invoice' : 'Estimate'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{bill.customerInfo.name}</div>
                          <div className="text-sm text-gray-500">{bill.customerInfo.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(bill.billDate)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="font-medium">₹{bill.total?.toLocaleString() || '0'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(bill)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(bill.id!)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No bills found' : 'No bills created yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Get started by creating your first bill'
            }
          </p>
          {!searchTerm && (
            <Link
              href="/admin/new-bill"
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4" />
              Create Your First Bill
            </Link>
          )}
        </div>
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
                Are you sure you want to delete this bill? This action cannot be undone.
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

      {/* Bill Preview Modal */}
      {showPreview && (
        <BillPreview
          onClose={() => setShowPreview(false)}
          billData={previewData}
        />
      )}
    </div>
  )
}
