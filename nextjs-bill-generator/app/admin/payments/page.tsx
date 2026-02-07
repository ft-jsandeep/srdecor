'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'
import { 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Eye,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import BillPreview from '@/components/BillPreview'
import CustomerPaymentModal from '@/components/CustomerPaymentModal'
import CustomerPaymentStatusModal from '@/components/CustomerPaymentStatusModal'
import { useRouter } from 'next/navigation'

interface CustomerPaymentSummary {
  customerName: string
  customerInfo: any
  totalPendingAmount: number
  bills: any[]
}

export default function PaymentsPage() {
  const { bills, loadingBills, getPendingBills } = useApp()
  const router = useRouter()
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<CustomerPaymentSummary | null>(null)
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [selectedCustomerForStatusUpdate, setSelectedCustomerForStatusUpdate] = useState<CustomerPaymentSummary | null>(null)

  // Group pending bills by customer
  const customerPayments = useMemo(() => {
    const pendingBills = getPendingBills()
    const customerMap = new Map<string, CustomerPaymentSummary>()

    pendingBills.forEach(bill => {
      const customerName = bill.customerInfo.name
      const pendingAmount = bill.balance ?? bill.total

      if (!customerMap.has(customerName)) {
        customerMap.set(customerName, {
          customerName,
          customerInfo: bill.customerInfo,
          totalPendingAmount: 0,
          bills: []
        })
      }

      const customerSummary = customerMap.get(customerName)!
      customerSummary.totalPendingAmount += pendingAmount
      customerSummary.bills.push(bill)
    })

    // Convert to array and sort by total pending amount (descending)
    return Array.from(customerMap.values()).sort((a, b) => 
      b.totalPendingAmount - a.totalPendingAmount
    )
  }, [bills, getPendingBills])

  const toggleCustomer = (customerName: string) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(customerName)) {
        newSet.delete(customerName)
      } else {
        newSet.add(customerName)
      }
      return newSet
    })
  }

  const handleView = (bill: any) => {
    setPreviewData(bill)
    setShowPreview(true)
  }

  const handleEdit = (bill: any) => {
    router.push(`/admin/new-bill?edit=${bill.id}`)
  }

  const handleCustomerPayment = (customerPayment: CustomerPaymentSummary) => {
    setSelectedCustomerForPayment(customerPayment)
    setShowPaymentModal(true)
  }

  const handleCustomerUpdateStatus = (customerPayment: CustomerPaymentSummary) => {
    setSelectedCustomerForStatusUpdate(customerPayment)
    setShowUpdateStatusModal(true)
  }

  const handlePaymentSuccess = () => {
    // The context will automatically update
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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

  const getPaymentStatusBadge = (bill: any) => {
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

  const totalPendingAmount = customerPayments.reduce(
    (sum, customer) => sum + customer.totalPendingAmount, 
    0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">View pending payments grouped by customer</p>
      </div>

      {/* Summary Card */}
      <div className="card border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Total Pending Payments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {customerPayments.length} {customerPayments.length === 1 ? 'customer' : 'customers'} with pending payments
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalPendingAmount)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Across {customerPayments.reduce((sum, c) => sum + c.bills.length, 0)} bills
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingBills ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : customerPayments.length > 0 ? (
        /* Customer Payment List */
        <div className="space-y-4">
          {customerPayments.map((customerPayment) => {
            const isExpanded = expandedCustomers.has(customerPayment.customerName)
            
            return (
              <div key={customerPayment.customerName} className="card">
                {/* Customer Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => toggleCustomer(customerPayment.customerName)}
                >
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {customerPayment.customerName}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span className="mr-4">
                          {customerPayment.bills.length} {customerPayment.bills.length === 1 ? 'bill' : 'bills'}
                        </span>
                        {customerPayment.customerInfo.email && (
                          <span>{customerPayment.customerInfo.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600">
                        {formatCurrency(customerPayment.totalPendingAmount)}
                      </div>
                      <div className="text-xs text-gray-500">Pending</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCustomerPayment(customerPayment)
                        }}
                        className="btn btn-sm btn-primary"
                        title="Record Payment"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Record Payment
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCustomerUpdateStatus(customerPayment)
                        }}
                        className="btn btn-sm btn-outline"
                        title="Update Payment Status"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Update Status
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bills List */}
                {isExpanded && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Bill Number</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Paid Amount</th>
                            <th>Pending Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerPayment.bills.map((bill) => {
                            const pendingAmount = bill.balance ?? bill.total
                            const paidAmount = bill.paidAmount || 0
                            
                            return (
                              <tr key={bill.id}>
                                <td>
                                  <div className="font-medium text-gray-900">
                                    {bill.billNumber || 'N/A'}
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
                                    <span className="font-medium">
                                      {formatCurrency(bill.total)}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className="text-green-600">
                                    {formatCurrency(paidAmount)}
                                  </span>
                                </td>
                                <td>
                                  <span className="font-semibold text-orange-600">
                                    {formatCurrency(pendingAmount)}
                                  </span>
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
                                    <button
                                      onClick={() => handleEdit(bill)}
                                      className="p-2 text-gray-400 hover:text-gray-600"
                                      title="Edit"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="card text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Pending Payments
          </h3>
          <p className="text-gray-500 mb-6">
            All invoices have been paid. Great job!
          </p>
          <Link
            href="/admin/bills"
            className="btn btn-primary"
          >
            <FileText className="h-4 w-4" />
            View All Bills
          </Link>
        </div>
      )}

      {/* Bill Preview Modal */}
      {showPreview && (
        <BillPreview
          onClose={() => setShowPreview(false)}
          billData={previewData}
        />
      )}

      {/* Customer Payment Modal */}
      {showPaymentModal && selectedCustomerForPayment && (
        <CustomerPaymentModal
          customerName={selectedCustomerForPayment.customerName}
          customerBills={selectedCustomerForPayment.bills}
          totalPendingAmount={selectedCustomerForPayment.totalPendingAmount}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedCustomerForPayment(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Customer Payment Status Modal */}
      {showUpdateStatusModal && selectedCustomerForStatusUpdate && (
        <CustomerPaymentStatusModal
          customerName={selectedCustomerForStatusUpdate.customerName}
          customerBills={selectedCustomerForStatusUpdate.bills}
          onClose={() => {
            setShowUpdateStatusModal(false)
            setSelectedCustomerForStatusUpdate(null)
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

