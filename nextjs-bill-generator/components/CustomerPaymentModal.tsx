'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { Bill } from '@/contexts/AppContext'

interface CustomerPaymentModalProps {
  customerName: string
  customerBills: Bill[]
  totalPendingAmount: number
  onClose: () => void
  onSuccess?: () => void
}

export default function CustomerPaymentModal({ 
  customerName, 
  customerBills, 
  totalPendingAmount,
  onClose, 
  onSuccess 
}: CustomerPaymentModalProps) {
  const { recordCustomerPayment } = useApp()
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [distributionMode, setDistributionMode] = useState<'auto' | 'manual'>('auto')
  const [manualDistribution, setManualDistribution] = useState<{ [billId: string]: string }>({})

  // Initialize manual distribution with bill balances
  useEffect(() => {
    if (distributionMode === 'manual') {
      const initial: { [billId: string]: string } = {}
      customerBills.forEach(bill => {
        const balance = bill.balance ?? bill.total
        initial[bill.id!] = balance > 0 ? balance.toFixed(2) : '0.00'
      })
      setManualDistribution(initial)
    }
  }, [distributionMode, customerBills])

  // Sort bills by date (oldest first) for auto distribution
  const sortedBills = [...customerBills].sort((a, b) => {
    const dateA = new Date(a.billDate).getTime()
    const dateB = new Date(b.billDate).getTime()
    return dateA - dateB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid payment amount')
      return
    }
    
    const paymentAmount = parseFloat(amount)
    if (paymentAmount > totalPendingAmount) {
      setError(`Payment amount cannot exceed the total pending amount of ₹${totalPendingAmount.toFixed(2)}`)
      return
    }
    
    if (!paymentDate) {
      setError('Please select a payment date')
      return
    }
    
    setLoading(true)
    try {
      let billDistribution: { billId: string, amount: number }[] | undefined = undefined

      if (distributionMode === 'manual') {
        // Validate manual distribution
        const distribution: { billId: string, amount: number }[] = []
        let totalDistributed = 0

        for (const bill of sortedBills) {
          const billId = bill.id!
          const distAmount = parseFloat(manualDistribution[billId] || '0')
          
          if (distAmount < 0) {
            throw new Error(`Invalid amount for bill ${bill.billNumber}`)
          }

          const billBalance = bill.balance ?? bill.total
          if (distAmount > billBalance) {
            throw new Error(`Amount for bill ${bill.billNumber} exceeds balance of ₹${billBalance.toFixed(2)}`)
          }

          if (distAmount > 0) {
            distribution.push({ billId, amount: distAmount })
            totalDistributed += distAmount
          }
        }

        if (Math.abs(totalDistributed - paymentAmount) > 0.01) {
          throw new Error(`Total distribution (₹${totalDistributed.toFixed(2)}) does not match payment amount (₹${paymentAmount.toFixed(2)})`)
        }

        billDistribution = distribution
      }

      await recordCustomerPayment(customerName, paymentAmount, paymentDate, notes, billDistribution)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Payment recording error:', err)
      // Provide more specific error messages
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        setError('Permission denied. Please check your Firestore security rules. Make sure you have deployed the updated rules.')
      } else {
        setError(err.message || 'Failed to record payment')
      }
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

  // Calculate auto distribution preview
  const getAutoDistributionPreview = () => {
    const paymentAmount = parseFloat(amount || '0')
    if (paymentAmount <= 0) return []

    let remaining = paymentAmount
    const distribution: { bill: Bill, amount: number }[] = []

    for (const bill of sortedBills) {
      if (remaining <= 0) break
      const billBalance = bill.balance ?? bill.total
      const paymentAmount = Math.min(remaining, billBalance)
      
      if (paymentAmount > 0) {
        distribution.push({ bill, amount: paymentAmount })
        remaining -= paymentAmount
      }
    }

    return distribution
  }

  const autoDistributionPreview = getAutoDistributionPreview()
  const manualTotal = Object.values(manualDistribution).reduce((sum, val) => sum + parseFloat(val || '0'), 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold text-gray-900">Record Payment - {customerName}</h3>
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Number of Bills:</span>
              <span className="font-medium text-gray-900">{customerBills.length}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">Total Pending Amount:</span>
              <span className="font-bold text-lg text-orange-600">{formatCurrency(totalPendingAmount)}</span>
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
                max={totalPendingAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                placeholder={`Max: ${formatCurrency(totalPendingAmount)}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum: {formatCurrency(totalPendingAmount)}
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

            {/* Distribution Mode */}
            <div>
              <label className="form-label">Payment Distribution</label>
              <div className="flex space-x-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="auto"
                    checked={distributionMode === 'auto'}
                    onChange={(e) => setDistributionMode('auto')}
                    className="mr-2"
                  />
                  <span>Auto (Oldest bills first)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={distributionMode === 'manual'}
                    onChange={(e) => setDistributionMode('manual')}
                    className="mr-2"
                  />
                  <span>Manual (Specify per bill)</span>
                </label>
              </div>

              {/* Auto Distribution Preview */}
              {distributionMode === 'auto' && amount && parseFloat(amount) > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Auto Distribution Preview:</h4>
                  <div className="space-y-2">
                    {autoDistributionPreview.map(({ bill, amount: distAmount }) => (
                      <div key={bill.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{bill.billNumber} ({formatDate(bill.billDate)})</span>
                        <span className="font-medium">{formatCurrency(distAmount)}</span>
                      </div>
                    ))}
                    {autoDistributionPreview.length === 0 && (
                      <p className="text-sm text-gray-500">No bills to distribute payment to</p>
                    )}
                  </div>
                </div>
              )}

              {/* Manual Distribution */}
              {distributionMode === 'manual' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Manual Distribution:</h4>
                  <div className="space-y-3">
                    {sortedBills.map((bill) => {
                      const billBalance = bill.balance ?? bill.total
                      return (
                        <div key={bill.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{bill.billNumber}</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(bill.billDate)} • Balance: {formatCurrency(billBalance)}
                            </div>
                          </div>
                          <div className="w-32">
                            <input
                              type="number"
                              min="0"
                              max={billBalance}
                              step="0.01"
                              value={manualDistribution[bill.id!] || '0.00'}
                              onChange={(e) => {
                                const value = e.target.value
                                setManualDistribution(prev => ({
                                  ...prev,
                                  [bill.id!]: value
                                }))
                              }}
                              className="form-input text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Distributed:</span>
                    <span className={`text-sm font-bold ${Math.abs(manualTotal - parseFloat(amount || '0')) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(manualTotal)}
                    </span>
                  </div>
                  {Math.abs(manualTotal - parseFloat(amount || '0')) >= 0.01 && (
                    <p className="text-xs text-red-600 mt-1">
                      Distribution total must match payment amount
                    </p>
                  )}
                </div>
              )}
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
                disabled={loading || (distributionMode === 'manual' && Math.abs(manualTotal - parseFloat(amount || '0')) >= 0.01)}
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

