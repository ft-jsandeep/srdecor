'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, AlertCircle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Bill } from '@/contexts/AppContext'

interface CustomerPaymentStatusModalProps {
  customerName: string
  customerBills: Bill[]
  onClose: () => void
  onSuccess?: () => void
}

export default function CustomerPaymentStatusModal({ 
  customerName, 
  customerBills, 
  onClose, 
  onSuccess 
}: CustomerPaymentStatusModalProps) {
  const { updateCustomerPaymentStatus } = useApp()
  const [paidAmounts, setPaidAmounts] = useState<{ [billId: string]: string }>({})
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid' | 'auto'>('auto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize paid amounts with current paid amounts
  useEffect(() => {
    const initial: { [billId: string]: string } = {}
    customerBills.forEach(bill => {
      initial[bill.id!] = (bill.paidAmount || 0).toString()
    })
    setPaidAmounts(initial)
  }, [customerBills])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const paidAmountsArray: { billId: string, paidAmount: number }[] = []
    
    for (const bill of customerBills) {
      const billId = bill.id!
      const paidAmount = parseFloat(paidAmounts[billId] || '0')
      
      if (isNaN(paidAmount) || paidAmount < 0) {
        setError(`Please enter a valid paid amount for bill ${bill.billNumber}`)
        return
      }
      
      if (paidAmount > bill.total) {
        setError(`Paid amount for bill ${bill.billNumber} cannot exceed the total bill amount of ₹${bill.total.toFixed(2)}`)
        return
      }
      
      paidAmountsArray.push({ billId, paidAmount })
    }
    
    setLoading(true)
    try {
      const status = paymentStatus === 'auto' ? undefined : paymentStatus
      await updateCustomerPaymentStatus(customerName, paidAmountsArray, status)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const jsDate = new Date(date)
    if (isNaN(jsDate.getTime())) return 'Invalid Date'
    return jsDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Sort bills by date
  const sortedBills = [...customerBills].sort((a, b) => {
    const dateA = new Date(a.billDate).getTime()
    const dateB = new Date(b.billDate).getTime()
    return dateA - dateB
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">Update Payment Status - {customerName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Customer Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Number of Bills:</span>
              <span className="font-medium text-gray-900">{customerBills.length}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Status */}
            <div>
              <label className="form-label flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="form-select"
              >
                <option value="auto">Auto (Based on amounts)</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {paymentStatus === 'auto' 
                  ? 'Status will be automatically determined based on paid amounts'
                  : `All bills will be set to: ${paymentStatus}`
                }
              </p>
            </div>

            {/* Bills List */}
            <div>
              <label className="form-label">Paid Amounts per Bill</label>
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                {sortedBills.map((bill) => {
                  const paidAmount = parseFloat(paidAmounts[bill.id!] || '0')
                  const balance = bill.total - paidAmount
                  const autoStatus = balance <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending')
                  
                  return (
                    <div key={bill.id} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{bill.billNumber}</div>
                          <div className="text-xs text-gray-500">{formatDate(bill.billDate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">Total: {formatCurrency(bill.total)}</div>
                          <div className={`text-xs ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            Balance: {formatCurrency(Math.max(0, balance))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700 flex-1">Paid Amount:</label>
                        <input
                          type="number"
                          min="0"
                          max={bill.total}
                          step="0.01"
                          value={paidAmounts[bill.id!] || '0'}
                          onChange={(e) => {
                            setPaidAmounts(prev => ({
                              ...prev,
                              [bill.id!]: e.target.value
                            }))
                          }}
                          className="form-input w-32 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      {paymentStatus === 'auto' && (
                        <div className="mt-2 text-xs text-gray-500">
                          Auto status: <strong>{autoStatus}</strong>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}






