'use client'

import { useState } from 'react'
import { X, Printer } from 'lucide-react'
import { generateESTRTTemplate } from '@/lib/billTemplate'

interface BillPreviewProps {
  onClose: () => void
  billData?: any
}

export default function BillPreview({ onClose, billData }: BillPreviewProps) {
  const [template, setTemplate] = useState('est-rt')

  const handlePrint = () => {
    const printContent = document.getElementById('bill-preview-content')
    if (printContent) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Bill Preview</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .bill-preview { max-width: 800px; margin: 0 auto; }
                .bill-preview-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
                .bill-preview-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .bill-preview-items table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .bill-preview-items th, .bill-preview-items td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                .bill-preview-items th { background-color: #f5f5f5; }
                .bill-preview-totals { max-width: 300px; margin-left: auto; }
                .total-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
                .total-final { font-weight: bold; font-size: 1.1em; border-top: 2px solid #000; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  // Use actual bill data if provided, otherwise use sample data
  const currentBillData = billData || {
    billType: 'invoice',
    billNumber: 'SR/2025-26/0001',
    billDate: new Date().toISOString().split('T')[0],
    placeOfSupply: 'Haryana (06)',
    businessInfo: {
      name: 'S. R. DECOR',
      email: 'srdecorofficial@gmail.com',
      phone: '+91-9811627334',
      address: 'SHOP NO. 3, DHANI RAM COMPLEX, NEAR METRO PILLAR NO. 54-55, Gurgaon, Haryana - 122002',
      gstin: '06AFSPJ4994F1ZX',
      pan: 'AFSPJ4994F',
      state: 'Haryana (06)'
    },
    customerInfo: {
      name: 'Sample Customer',
      email: 'customer@example.com',
      phone: '+91-9876543210',
      address: '123 Customer Street',
      city: 'Gurgaon',
      state: 'Haryana (06)',
      pincode: '122001',
      gstin: '06ABCDE1234F1Z5'
    },
    items: [
      {
        name: 'Sample Item 1',
        hsn: '1234',
        quantity: 2,
        unit: 'pcs',
        rate: 100,
        discount: 0,
        amount: 200,
        cgst: 9,
        sgst: 9,
        igst: 18,
        taxAmount: 36,
        totalAmount: 236
      },
      {
        name: 'Sample Item 2',
        hsn: '5678',
        quantity: 1,
        unit: 'pcs',
        rate: 50,
        discount: 10,
        amount: 45,
        cgst: 4.5,
        sgst: 4.5,
        igst: 9,
        taxAmount: 8.1,
        totalAmount: 53.1
      }
    ],
    subtotal: 245,
    taxAmount: 44.1,
    roundingAmount: 0.9,
    total: 290,
    termsConditions: ''
  }

  // Helper functions matching the JS app
  const safeToFixed = (value: any, decimals: number = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00'
    }
    return parseFloat(value).toFixed(decimals)
  }

  const safeString = (value: any, defaultValue: string = '') => {
    if (value === null || value === undefined) {
      return defaultValue
    }
    return String(value)
  }

  // Helper function to extract unit value (handles custom units)
  const getUnitDisplay = (unit: string): string => {
    if (unit.startsWith('custom:')) {
      return unit.split(':')[1] || unit
    }
    return unit
  }

  const hasAnyDiscount = (items: any[]) => {
    return items.some(item => parseFloat(item.discount) > 0)
  }

  const isSameState = (businessState: string, customerState: string) => {
    if (!businessState || !customerState) return false
    
    // Extract state codes from the state strings (e.g., "Haryana (06)" -> "06")
    const businessStateCode = businessState.match(/\((\d+)\)/)?.[1]
    const customerStateCode = customerState.match(/\((\d+)\)/)?.[1]
    
    return businessStateCode === customerStateCode
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid Date'
    }
  }

  const numberToWords = (num: number) => {
    const safeNum = parseFloat(String(num)) || 0
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    
    if (safeNum === 0) return 'Zero'
    
    const integerPart = Math.floor(safeNum)
    const decimalPart = Math.round((safeNum - integerPart) * 100)
    
    let result = convertToWords(integerPart)
    if (decimalPart > 0) {
      result += ' and ' + convertToWords(decimalPart) + ' Paise'
    }
    
    return result + ' Rupees Only'
  }
  
  const convertToWords: any = (num: number) => {
    if (num === 0) return ''
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    
    if (num < 10) return ones[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + convertToWords(num % 100) : '')
    if (num < 100000) return convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convertToWords(num % 1000) : '')
    if (num < 10000000) return convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convertToWords(num % 100000) : '')
    return convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convertToWords(num % 10000000) : '')
  }

  const renderShippingAddress = (shippingInfo: any) => {
    if (!shippingInfo || (!shippingInfo.name && !shippingInfo.address && !shippingInfo.city)) {
      return ''
    }

    return `
      <div style="margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px;">Ship To:</h3>
        <div style="border: 1px solid #000; padding: 8px;">
          ${shippingInfo.name ? `<p style="margin: 0; font-weight: bold; font-size: 12px;">${safeString(shippingInfo.name)}</p>` : ''}
          ${shippingInfo.address ? `<p style="margin: 2px 0; font-size: 10px;">${safeString(shippingInfo.address)}</p>` : ''}
          ${shippingInfo.city ? `<p style="margin: 2px 0; font-size: 10px;">${safeString(shippingInfo.city)}</p>` : ''}
          ${shippingInfo.state ? `<p style="margin: 2px 0; font-size: 10px;">${safeString(shippingInfo.state).replace(/\s*\(\d+\)/, '')}</p>` : ''}
          ${shippingInfo.pincode ? `<p style="margin: 2px 0; font-size: 10px;">${safeString(shippingInfo.pincode)}</p>` : ''}
          ${shippingInfo.phone ? `<p style="margin: 2px 0; font-size: 10px;">Phone: ${safeString(shippingInfo.phone)}</p>` : ''}
        </div>
      </div>
    `
  }

  const renderBankDetails = (bankDetails: any) => {
    if (!bankDetails || (!bankDetails.bankName && !bankDetails.accountNumber && !bankDetails.ifscCode)) {
      return ''
    }

    return `
      <div style="margin-bottom: 10px;">
        <h3 style="margin: 0 0 5px 0; font-size: 12px;">Bank Details:</h3>
        <div style="border: 1px solid #000; padding: 8px;">
          ${bankDetails.bankName ? `<p style="margin: 0; font-size: 10px;"><strong>Bank Name:</strong> ${safeString(bankDetails.bankName)}</p>` : ''}
          ${bankDetails.accountHolderName ? `<p style="margin: 2px 0; font-size: 10px;"><strong>A/c Holder Name:</strong> ${safeString(bankDetails.accountHolderName)}</p>` : ''}
          ${bankDetails.accountNumber ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Account Number:</strong> ${safeString(bankDetails.accountNumber)}</p>` : ''}
          ${bankDetails.ifscCode ? `<p style="margin: 2px 0; font-size: 10px;"><strong>IFSC Code:</strong> ${safeString(bankDetails.ifscCode)}</p>` : ''}
          ${bankDetails.branch ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Branch:</strong> ${safeString(bankDetails.branch)}</p>` : ''}
        </div>
      </div>
    `
  }

  const renderTermsAndSignatory = (terms: string) => {
    const hasTerms = terms && terms.trim() !== ''
    
    // If no terms, only show the authorized signatory section
    if (!hasTerms) {
      return `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 50%; display: flex; flex-direction: column;">
              <h3 style="margin: 0 0 5px 0; font-size: 12px;">Authorized Signatory:</h3>
              <div style="border: 1px solid #000; padding: 8px; min-height: 80px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: bold; font-size: 10px;">For S. R. Decor</p>
                </div>
                <div style="text-align: right;">
                  <hr style="margin: 0 0 5px 0; border: none; border-top: 1px solid #000; width: 150px; margin-left: auto;">
                  <p style="margin: 0; font-size: 10px;">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
    
    return `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; gap: 20px; align-items: flex-start;">
          <!-- Terms & Conditions Section -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 5px 0; font-size: 12px;">Terms & Conditions:</h3>
            <div style="border: 1px solid #000; padding: 8px; flex: 1; min-height: 80px; display: flex; flex-direction: column;">
              <div style="white-space: pre-line; font-size: 10px; flex: 1;">${safeString(terms)}</div>
            </div>
          </div>
          
          <!-- Authorized Signatory Section -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 5px 0; font-size: 12px;">Authorized Signatory:</h3>
            <div style="border: 1px solid #000; padding: 8px; flex: 1; min-height: 80px; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; font-size: 10px;">For S. R. Decor</p>
              </div>
              <div style="text-align: right;">
                <hr style="margin: 0 0 5px 0; border: none; border-top: 1px solid #000; width: 150px; margin-left: auto;">
                <p style="margin: 0; font-size: 10px;">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  // generateESTRTTemplate is now imported from shared template utility

  const generateBillHTML = () => {
    // Use the shared template utility
    switch (template) {
      case 'est-rt':
        return generateESTRTTemplate(currentBillData)
      case 'ovies':
        // OVIES Global template (simplified version)
        return generateESTRTTemplate(currentBillData) // For now, use same as EST-RT
      case 'default':
      default:
        return generateESTRTTemplate(currentBillData) // For now, use same as EST-RT
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900">Bill Preview</h2>
          <div className="flex items-center space-x-2">
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="form-select text-sm"
            >
              <option value="est-rt">SR Format</option>
              <option value="ovies">OVIES Global Format</option>
              <option value="default">Default Format</option>
            </select>
            <button
              onClick={handlePrint}
              className="btn btn-outline btn-sm"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          <div 
            id="bill-preview-content"
            className="bg-white p-6 border rounded-lg"
            dangerouslySetInnerHTML={{ __html: generateBillHTML() }}
          />
        </div>
      </div>
    </div>
  )
}