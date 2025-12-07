'use client'

import { useState } from 'react'
import { X, Download, Calendar } from 'lucide-react'
import { Bill } from '@/contexts/AppContext'
import { mergeBillsToPDF } from '@/lib/pdfUtils'

interface MergeBillsModalProps {
  onClose: () => void
  bills: Bill[]
}

export default function MergeBillsModal({ onClose, bills }: MergeBillsModalProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Default to current month
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // Filter bills by selected month
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.billDate)
    const billYear = billDate.getFullYear()
    const billMonth = String(billDate.getMonth() + 1).padStart(2, '0')
    const billMonthYear = `${billYear}-${billMonth}`
    return billMonthYear === selectedMonth
  })

  // Get month name for display
  const getMonthName = (monthYear: string) => {
    const [year, month] = monthYear.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Helper function to extract numeric sequence from bill number for sorting
  // Handles formats like: SR/2025-26/1, SR/ES/2025-26/1, etc.
  const getBillNumberSequence = (billNumber: string): number => {
    if (!billNumber) return 0
    
    // Split by '/' and get the last part (the sequence number)
    const parts = billNumber.split('/')
    const sequence = parts[parts.length - 1]
    const num = parseInt(sequence, 10)
    
    return isNaN(num) ? 0 : num
  }

  // Sort bills by invoice number (bill number)
  const sortBillsByInvoiceNumber = (bills: Bill[]): Bill[] => {
    return [...bills].sort((a, b) => {
      const seqA = getBillNumberSequence(a.billNumber || '')
      const seqB = getBillNumberSequence(b.billNumber || '')
      
      // If sequences are equal, fall back to string comparison
      if (seqA === seqB) {
        return (a.billNumber || '').localeCompare(b.billNumber || '')
      }
      
      return seqA - seqB
    })
  }

  const handleDownload = async () => {
    if (filteredBills.length === 0) {
      alert('No bills found for the selected month')
      return
    }

    setIsGenerating(true)
    try {
      // Sort bills by invoice number
      const sortedBills = sortBillsByInvoiceNumber(filteredBills)

      // Generate merged PDF
      const blob = await mergeBillsToPDF(sortedBills)

      // Download the PDF
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Bills_${selectedMonth.replace('-', '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      onClose()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900">Merge Bills by Month</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="modal-body space-y-4">
          <div>
            <label className="form-label flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">
              Bills found for <strong>{getMonthName(selectedMonth)}</strong>:
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
            </div>
            {filteredBills.length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                Total Amount: ₹{filteredBills.reduce((sum, bill) => sum + (bill.total || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {filteredBills.length > 0 && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Bill No.</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sortBillsByInvoiceNumber(filteredBills).map((bill) => (
                      <tr key={bill.id}>
                        <td className="font-medium">{bill.billNumber}</td>
                        <td>{new Date(bill.billDate).toLocaleDateString('en-IN')}</td>
                        <td>{bill.customerInfo.name}</td>
                        <td>₹{bill.total?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredBills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No bills found for the selected month.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating || filteredBills.length === 0}
            className="btn btn-primary"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Merged PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

