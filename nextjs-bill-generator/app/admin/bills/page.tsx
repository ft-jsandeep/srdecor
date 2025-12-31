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
  DollarSign,
  Download,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import MergeBillsModal from '@/components/MergeBillsModal'
import PaymentModal from '@/components/PaymentModal'
import UpdatePaymentStatusModal from '@/components/UpdatePaymentStatusModal'

interface BillFilters {
  customer: string
  dateFrom: string
  dateTo: string
  amountMin: string
  amountMax: string
  paymentStatus: 'all' | 'pending' | 'partial' | 'paid'
  billType: 'all' | 'invoice' | 'estimate'
  invoiceMonth: string
}

export default function BillsPage() {
  const { bills, loadingBills, deleteBill, searchBills, customers } = useApp()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredBills, setFilteredBills] = useState(bills)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [editingBill, setEditingBill] = useState<any>(null)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<any>(null)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [selectedBillForStatusUpdate, setSelectedBillForStatusUpdate] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<BillFilters>({
    customer: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    paymentStatus: 'all',
    billType: 'all',
    invoiceMonth: ''
  })

  // Get unique months from bills for month filter
  const getAvailableMonths = () => {
    const months = new Set<string>()
    bills.forEach(bill => {
      if (bill.billDate) {
        const date = new Date(bill.billDate)
        if (!isNaN(date.getTime())) {
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          months.add(monthYear)
        }
      }
    })
    return Array.from(months).sort().reverse()
  }

  const formatMonthYear = (monthYear: string) => {
    if (!monthYear) return ''
    const [year, month] = monthYear.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
  }

  // Apply all filters
  useEffect(() => {
    let result = bills

    // Apply search term
    if (searchTerm) {
      result = searchBills(searchTerm)
    }

    // Apply customer filter
    if (filters.customer) {
      result = result.filter(bill => 
        bill.customerInfo.name.toLowerCase() === filters.customer.toLowerCase()
      )
    }

    // Apply date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      result = result.filter(bill => {
        const billDate = new Date(bill.billDate)
        return billDate >= fromDate
      })
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // Include entire day
      result = result.filter(bill => {
        const billDate = new Date(bill.billDate)
        return billDate <= toDate
      })
    }

    // Apply amount range filter
    if (filters.amountMin) {
      const minAmount = parseFloat(filters.amountMin)
      if (!isNaN(minAmount)) {
        result = result.filter(bill => bill.total >= minAmount)
      }
    }
    if (filters.amountMax) {
      const maxAmount = parseFloat(filters.amountMax)
      if (!isNaN(maxAmount)) {
        result = result.filter(bill => bill.total <= maxAmount)
      }
    }

    // Apply payment status filter (only for invoices)
    if (filters.paymentStatus !== 'all') {
      result = result.filter(bill => {
        if (bill.billType === 'estimate') return false
        const status = bill.paymentStatus || 'pending'
        return status === filters.paymentStatus
      })
    }

    // Apply bill type filter
    if (filters.billType !== 'all') {
      result = result.filter(bill => bill.billType === filters.billType)
    }

    // Apply invoice month filter
    if (filters.invoiceMonth) {
      result = result.filter(bill => {
        if (!bill.billDate) return false
        const billDate = new Date(bill.billDate)
        if (isNaN(billDate.getTime())) return false
        const billMonthYear = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`
        return billMonthYear === filters.invoiceMonth
      })
    }

    setFilteredBills(result)
  }, [searchTerm, bills, filters, searchBills])

  const clearFilters = () => {
    setFilters({
      customer: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      paymentStatus: 'all',
      billType: 'all',
      invoiceMonth: ''
    })
  }

  const hasActiveFilters = () => {
    return filters.customer !== '' ||
           filters.dateFrom !== '' ||
           filters.dateTo !== '' ||
           filters.amountMin !== '' ||
           filters.amountMax !== '' ||
           filters.paymentStatus !== 'all' ||
           filters.billType !== 'all' ||
           filters.invoiceMonth !== ''
  }

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

  const getPaymentStatusBadge = (bill: any) => {
    if (bill.billType === 'estimate') {
      return null
    }
    
    const status = bill.paymentStatus || 'pending'
    const balance = bill.balance ?? bill.total
    
    if (status === 'paid' || balance <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </span>
      )
    } else if (status === 'partial') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Pending
        </span>
      )
    }
  }

  const handlePayment = (bill: any) => {
    setSelectedBillForPayment(bill)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    // Reload bills to get updated payment status
    // The context will automatically update, but we can force a reload if needed
  }

  const handleUpdateStatus = (bill: any) => {
    setSelectedBillForStatusUpdate(bill)
    setShowUpdateStatusModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bills</h1>
          <p className="text-gray-600 mt-1">Manage your invoices and estimates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMergeModal(true)}
            className="btn btn-outline"
            disabled={bills.length === 0}
          >
            <Download className="h-4 w-4" />
            Merge by Month
          </button>
          <Link
            href="/admin/new-bill"
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            New Bill
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} flex items-center`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
                </span>
              )}
            </button>
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {filteredBills.length} of {bills.length} bills
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filter Bills
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Customer Filter */}
              <div>
                <label className="form-label flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer
                </label>
                <select
                  value={filters.customer}
                  onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Customers</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bill Type Filter */}
              <div>
                <label className="form-label">Bill Type</label>
                <select
                  value={filters.billType}
                  onChange={(e) => setFilters({ ...filters, billType: e.target.value as any })}
                  className="form-select"
                >
                  <option value="all">All Types</option>
                  <option value="invoice">Invoice</option>
                  <option value="estimate">Estimate</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="form-label">Payment Status</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value as any })}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="form-label flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="form-label flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="form-input"
                  min={filters.dateFrom || undefined}
                />
              </div>

              {/* Invoice Month Filter */}
              <div>
                <label className="form-label">Invoice Month</label>
                <select
                  value={filters.invoiceMonth}
                  onChange={(e) => setFilters({ ...filters, invoiceMonth: e.target.value })}
                  className="form-select"
                >
                  <option value="">All Months</option>
                  {getAvailableMonths().map(monthYear => (
                    <option key={monthYear} value={monthYear}>
                      {formatMonthYear(monthYear)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Min Filter */}
              <div>
                <label className="form-label flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.amountMin}
                  onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                  className="form-input"
                  placeholder="0.00"
                />
              </div>

              {/* Amount Max Filter */}
              <div>
                <label className="form-label flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.amountMax}
                  onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                  className="form-input"
                  placeholder="No limit"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                  {filters.customer && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Customer: {filters.customer}
                      <button
                        onClick={() => setFilters({ ...filters, customer: '' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.billType !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Type: {filters.billType}
                      <button
                        onClick={() => setFilters({ ...filters, billType: 'all' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.paymentStatus !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {filters.paymentStatus}
                      <button
                        onClick={() => setFilters({ ...filters, paymentStatus: 'all' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateFrom && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      From: {new Date(filters.dateFrom).toLocaleDateString()}
                      <button
                        onClick={() => setFilters({ ...filters, dateFrom: '' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.dateTo && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      To: {new Date(filters.dateTo).toLocaleDateString()}
                      <button
                        onClick={() => setFilters({ ...filters, dateTo: '' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.invoiceMonth && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Month: {formatMonthYear(filters.invoiceMonth)}
                      <button
                        onClick={() => setFilters({ ...filters, invoiceMonth: '' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.amountMin || filters.amountMax) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Amount: ₹{filters.amountMin || '0'} - {filters.amountMax ? `₹${filters.amountMax}` : '∞'}
                      <button
                        onClick={() => setFilters({ ...filters, amountMin: '', amountMax: '' })}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
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
                  <th>Payment Status</th>
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
                        <div>
                          <span className="font-medium">₹{bill.total?.toLocaleString() || '0'}</span>
                          {bill.billType === 'invoice' && bill.paymentStatus !== 'paid' && (bill.balance ?? bill.total) > 0 && (
                            <div className="text-xs text-gray-500">
                              Balance: ₹{(bill.balance ?? bill.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {getPaymentStatusBadge(bill)}
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
                        {bill.billType === 'invoice' && (
                          <>
                            {(bill.paymentStatus === 'pending' || bill.paymentStatus === 'partial') && (
                              <button
                                onClick={() => handlePayment(bill)}
                                className="p-2 text-green-400 hover:text-green-600"
                                title="Record Payment"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(bill)}
                              className="p-2 text-blue-400 hover:text-blue-600"
                              title="Update Payment Status"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                          </>
                        )}
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
            {searchTerm || hasActiveFilters() ? 'No bills found' : 'No bills created yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || hasActiveFilters()
              ? 'Try adjusting your search terms or filters' 
              : 'Get started by creating your first bill'
            }
          </p>
          {searchTerm || hasActiveFilters() ? (
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => {
                  setSearchTerm('')
                  clearFilters()
                }}
                className="btn btn-outline"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
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

      {/* Merge Bills Modal */}
      {showMergeModal && (
        <MergeBillsModal
          onClose={() => setShowMergeModal(false)}
          bills={bills}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedBillForPayment && (
        <PaymentModal
          bill={selectedBillForPayment}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedBillForPayment(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Update Payment Status Modal */}
      {showUpdateStatusModal && selectedBillForStatusUpdate && (
        <UpdatePaymentStatusModal
          bill={selectedBillForStatusUpdate}
          onClose={() => {
            setShowUpdateStatusModal(false)
            setSelectedBillForStatusUpdate(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
