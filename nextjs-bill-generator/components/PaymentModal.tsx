'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, FileText } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Bill } from '@/contexts/AppContext'

interface PaymentModalProps {
  bill: Bill
  onClose: () => void
  onSuccess?: () => void
}

export default function PaymentModal({ bill, onClose, onSuccess }: PaymentModalProps) {
  const { recordPayment, getPaymentsByBillId } = useApp()
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Use bill's balance field if available, otherwise calculate from total and paidAmount
  const currentBalance = bill.balance ?? (bill.total - (bill.paidAmount || 0))
  const maxAmount = Math.max(0, currentBalance)

  useEffect(() => {
    // Set max amount as default
    if (maxAmount > 0 && !amount) {
      setAmount(maxAmount.toFixed(2))
    }
  }, [maxAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (bill.billType === 'estimate') {
      setError('Cannot record payments for estimates')
      return
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }
    
    const paymentAmount = parseFloat(amount)
    if (paymentAmount > maxAmount) {
      setError(`Payment amount cannot exceed the remaining balance of ₹${maxAmount.toFixed(2)}`)
      return
    }
    
    if (maxAmount <= 0) {
      setError('This bill is already fully paid')
      return
    }
    
    if (!paymentDate) {
      setError('Please select a payment date')
      return
    }
    
    setLoading(true)
    try {
      await recordPayment(bill.id!, paymentAmount, paymentDate, notes)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">Record Payment</h3>
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-medium text-gray-900">{formatCurrency(bill.total)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Already Paid:</span>
              <span className="font-medium text-gray-900">{formatCurrency(bill.paidAmount || 0)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Remaining Balance:</span>
              <span className="font-bold text-lg text-orange-600">{formatCurrency(currentBalance)}</span>
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
                Payment Amount *
              </label>
              <input
                type="number"
                min="0.01"
                max={maxAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                placeholder={`Max: ${formatCurrency(maxAmount)}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(maxAmount)}
              </p>
            </div>

            <div>
              <label className="form-label flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Add any notes about this payment..."
              />
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
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

