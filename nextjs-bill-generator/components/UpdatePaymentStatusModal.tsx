'use client'

import { useState } from 'react'
import { X, DollarSign, AlertCircle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Bill } from '@/contexts/AppContext'

interface UpdatePaymentStatusModalProps {
  bill: Bill
  onClose: () => void
  onSuccess?: () => void
}

export default function UpdatePaymentStatusModal({ bill, onClose, onSuccess }: UpdatePaymentStatusModalProps) {
  const { updatePaymentStatus, recalculatePaymentStatus } = useApp()
  const [paidAmount, setPaidAmount] = useState((bill.paidAmount || 0).toString())
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'partial' | 'paid' | 'auto'>(bill.paymentStatus || 'pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recalculating, setRecalculating] = useState(false)

  const handleRecalculate = async () => {
    if (!bill.id) return
    
    setRecalculating(true)
    setError('')
    try {
      await recalculatePaymentStatus(bill.id)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate payment status')
    } finally {
      setRecalculating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (bill.billType === 'estimate') {
      setError('Cannot update payment status for estimates')
      return
    }
    
    const amount = parseFloat(paidAmount)
    if (isNaN(amount) || amount < 0) {
      setError('Please enter a valid paid amount')
      return
    }
    
    if (amount > bill.total) {
      setError(`Paid amount cannot exceed the total bill amount of ₹${bill.total.toFixed(2)}`)
      return
    }
    
    setLoading(true)
    try {
      const status = paymentStatus === 'auto' ? undefined : paymentStatus
      await updatePaymentStatus(bill.id!, amount, status)
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

  const currentBalance = bill.total - parseFloat(paidAmount || '0')
  const autoStatus = currentBalance <= 0 ? 'paid' : (parseFloat(paidAmount || '0') > 0 ? 'partial' : 'pending')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Bill Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Bill Number:</span>
              <span className="font-medium text-gray-900">{bill.billNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{bill.customerInfo.name}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(bill.total)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Paid Amount *
              </label>
              <input
                type="number"
                min="0"
                max={bill.total}
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="form-input"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(bill.total)}
              </p>
            </div>

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
                <option value="auto">Auto (Based on amount)</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
              {paymentStatus === 'auto' && (
                <p className="text-xs text-gray-500 mt-1">
                  Will be set to: <strong>{autoStatus}</strong> (Balance: {formatCurrency(Math.max(0, currentBalance))})
                </p>
              )}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-700">
                <div className="flex justify-between mb-1">
                  <span>Total:</span>
                  <span className="font-medium">{formatCurrency(bill.total)}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Paid:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(paidAmount || '0'))}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200">
                  <span className="font-semibold">Balance:</span>
                  <span className={`font-bold ${currentBalance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.max(0, currentBalance))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                type="button"
                onClick={handleRecalculate}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={recalculating || loading}
              >
                {recalculating ? 'Recalculating...' : 'Recalculate from Payment Records'}
              </button>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={loading || recalculating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || recalculating}
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







