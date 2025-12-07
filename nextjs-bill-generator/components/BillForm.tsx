'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Eye, Save } from 'lucide-react'
import { Bill, BillItem, Item, Customer, useApp } from '@/contexts/AppContext'

interface BillFormProps {
  items: Item[]
  customers: Customer[]
  onSave: (billData: Omit<Bill, 'id'>) => void
  onPreview: (billData: Omit<Bill, 'id'>) => void
  loading: boolean
  initialData?: Bill
}

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

export default function BillForm({ items, customers, onSave, onPreview, loading, initialData }: BillFormProps) {
  const { businessSettings, bills } = useApp()
  
  const [formData, setFormData] = useState({
    billType: 'invoice' as 'invoice' | 'estimate',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    placeOfSupply: 'Haryana (06)',
    businessInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      pan: '',
      state: 'Haryana (06)'
    },
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstin: ''
    },
    shippingInfo: {
      name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      branch: ''
    },
    items: [] as BillItem[],
    termsConditions: ''
  })

  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    roundingAmount: 0,
    total: 0
  })

  // Calculate totals whenever items change
  useEffect(() => {
    let subtotal = 0
    let totalTax = 0

    formData.items.forEach(item => {
      // Ensure all values are valid numbers
      const quantity = item.quantity != null && !isNaN(item.quantity) ? Number(item.quantity) : 0
      const rate = item.rate != null && !isNaN(item.rate) ? Number(item.rate) : 0
      const discount = item.discount != null && !isNaN(item.discount) ? Number(item.discount) : 0
      const cgst = item.cgst != null && !isNaN(item.cgst) ? Number(item.cgst) : 0
      const sgst = item.sgst != null && !isNaN(item.sgst) ? Number(item.sgst) : 0
      const igst = item.igst != null && !isNaN(item.igst) ? Number(item.igst) : 0
      
      const amount = quantity * rate
      const discountAmount = (amount * discount) / 100
      const discountedAmount = amount - discountAmount
      
      // Tax calculation: If IGST is used, use only IGST; otherwise use CGST + SGST
      const taxAmount = igst > 0 
        ? (discountedAmount * igst) / 100
        : (discountedAmount * (cgst + sgst)) / 100
      
      subtotal += isNaN(discountedAmount) ? 0 : discountedAmount
      totalTax += isNaN(taxAmount) ? 0 : taxAmount
    })

    const rounding = Math.round(subtotal + totalTax) - (subtotal + totalTax)
    const total = subtotal + totalTax + rounding

    setTotals({
      subtotal: parseFloat(subtotal.toFixed(2)) || 0,
      taxAmount: parseFloat(totalTax.toFixed(2)) || 0,
      roundingAmount: parseFloat(rounding.toFixed(2)) || 0,
      total: parseFloat(total.toFixed(2)) || 0
    })
  }, [formData.items])

  // Track if we've prefilled the form to avoid overwriting user changes
  const [hasPrefilled, setHasPrefilled] = useState(false)
  // Track which initialData we've already initialized with to prevent re-initialization
  const [initializedBillId, setInitializedBillId] = useState<string | null>(null)

  // Helper function to check if two states are the same
  const isSameState = (state1: string, state2: string): boolean => {
    if (!state1 || !state2) return false
    // Extract state codes from the state strings (e.g., "Haryana (06)" -> "06")
    const stateCode1 = state1.match(/\((\d+)\)/)?.[1]
    const stateCode2 = state2.match(/\((\d+)\)/)?.[1]
    return stateCode1 === stateCode2
  }

  // Helper function to get default tax based on states
  const getDefaultTax = (businessState: string, customerState: string) => {
    const sameState = isSameState(businessState, customerState)
    if (sameState) {
      return { cgst: 9, sgst: 9, igst: 0 }
    } else {
      return { cgst: 0, sgst: 0, igst: 18 }
    }
  }

  // Generate bill number based on type, date, and existing bills
  const generateBillNumber = useCallback((billType: 'invoice' | 'estimate', billDate: string) => {
    // Compute financial year string from bill date
    const dateStr = billDate || new Date().toISOString().split('T')[0]
    const d = new Date(dateStr)
    const year = d.getFullYear()
    const month = d.getMonth() // 0-based
    const fyStartYear = month >= 3 ? year : year - 1 // FY begins in April
    const fyEndYearShort = (fyStartYear + 1).toString().slice(-2)
    const fyString = `${fyStartYear}-${fyEndYearShort}`

    const prefix = 'SR'

    // Find existing numbers for this FY and bill type, extract numeric sequence
    let maxSeq = 0
    bills.forEach(b => {
      const num = b.billNumber || ''
      const parts = num.split('/')

      if (billType === 'estimate') {
        // For estimates: SR/ES/2025-26/1
        if (parts.length === 4 && parts[0] === prefix && parts[1] === 'ES' && parts[2] === fyString) {
          const seq = parseInt(parts[3], 10)
          if (!isNaN(seq)) {
            maxSeq = Math.max(maxSeq, seq)
          }
        }
      } else {
        // For invoices: SR/2025-26/1
        if (parts.length === 3 && parts[0] === prefix && parts[1] === fyString) {
          const seq = parseInt(parts[2], 10)
          if (!isNaN(seq)) {
            maxSeq = Math.max(maxSeq, seq)
          }
        }
      }
    })

    const nextSeq = (maxSeq || 0) + 1

    // Generate bill number based on type
    if (billType === 'estimate') {
      return `${prefix}/ES/${fyString}/${nextSeq}`
    } else {
      return `${prefix}/${fyString}/${nextSeq}`
    }
  }, [bills])

  // Populate form with initial data when editing or prefill from settings for new bill
  useEffect(() => {
    if (initialData) {
      // Only initialize if this is a different bill (different ID) or we haven't initialized yet
      const currentBillId = initialData.id || null
      if (currentBillId !== initializedBillId) {
        // Editing existing bill - initialize form with bill data
        setFormData({
          billType: initialData.billType,
          billNumber: initialData.billNumber,
          billDate: initialData.billDate,
          placeOfSupply: initialData.placeOfSupply,
          businessInfo: {
            name: initialData.businessInfo.name,
            email: initialData.businessInfo.email,
            phone: initialData.businessInfo.phone,
            address: initialData.businessInfo.address,
            gstin: initialData.businessInfo.gstin || '',
            pan: initialData.businessInfo.pan || '',
            state: initialData.businessInfo.state
          },
          customerInfo: {
            name: initialData.customerInfo.name,
            email: initialData.customerInfo.email || '',
            phone: initialData.customerInfo.phone || '',
            address: initialData.customerInfo.address || '',
            city: initialData.customerInfo.city || '',
            state: initialData.customerInfo.state,
            pincode: initialData.customerInfo.pincode || '',
            gstin: initialData.customerInfo.gstin || ''
          },
          shippingInfo: {
            name: initialData.shippingInfo?.name || '',
            address: initialData.shippingInfo?.address || '',
            city: initialData.shippingInfo?.city || '',
            state: initialData.shippingInfo?.state || '',
            pincode: initialData.shippingInfo?.pincode || '',
            phone: initialData.shippingInfo?.phone || ''
          },
          bankDetails: {
            bankName: initialData.bankDetails?.bankName || '',
            accountHolderName: initialData.bankDetails?.accountHolderName || '',
            accountNumber: initialData.bankDetails?.accountNumber || '',
            ifscCode: initialData.bankDetails?.ifscCode || '',
            branch: initialData.bankDetails?.branch || ''
          },
          items: initialData.items || [],
          termsConditions: initialData.termsConditions || ''
        })
        setInitializedBillId(currentBillId)
        setHasPrefilled(true)
      }
    } else if (!initialData && initializedBillId) {
      // Switching from edit mode to new bill mode - reset state
      setInitializedBillId(null)
      setHasPrefilled(false)
    } else if (businessSettings && !hasPrefilled) {
      // New bill - prefill from business settings (only once)
      const currentDate = new Date().toISOString().split('T')[0]
      const generatedBillNumber = generateBillNumber('invoice', currentDate)
      setFormData(prev => ({
        ...prev,
        billNumber: generatedBillNumber,
        billDate: currentDate,
        businessInfo: {
          name: businessSettings.businessInfo.name,
          email: businessSettings.businessInfo.email,
          phone: businessSettings.businessInfo.phone,
          address: businessSettings.businessInfo.address,
          gstin: businessSettings.businessInfo.gstin || '',
          pan: businessSettings.businessInfo.pan || '',
          state: businessSettings.businessInfo.state
        },
        bankDetails: {
          bankName: businessSettings.bankDetails?.bankName || '',
          accountHolderName: businessSettings.bankDetails?.accountHolderName || '',
          accountNumber: businessSettings.bankDetails?.accountNumber || '',
          ifscCode: businessSettings.bankDetails?.ifscCode || '',
          branch: businessSettings.bankDetails?.branch || ''
        },
        termsConditions: businessSettings.termsConditions || '',
        placeOfSupply: businessSettings.businessInfo.state || 'Haryana (06)'
      }))
      setHasPrefilled(true)
      setInitializedBillId(null) // Reset when creating new bill
    } else if (businessSettings && hasPrefilled && !initialData) {
      // If bills loaded after businessSettings, regenerate bill number with correct sequence
      const currentDate = formData.billDate || new Date().toISOString().split('T')[0]
      const generatedBillNumber = generateBillNumber(formData.billType, currentDate)
      // Only update if bill number is different (to avoid infinite loops)
      if (generatedBillNumber !== formData.billNumber) {
        setFormData(prev => ({
          ...prev,
          billNumber: generatedBillNumber
        }))
      }
    }
  }, [initialData, businessSettings, hasPrefilled, generateBillNumber, formData.billNumber, formData.billType, initializedBillId])

  // Update bill number when bills list changes (for new bills only)
  // This ensures bill number is updated when new bills are saved
  useEffect(() => {
    if (!initialData && businessSettings && hasPrefilled && formData.billNumber) {
      const generatedBillNumber = generateBillNumber(formData.billType, formData.billDate)
      // Only update if the generated number is different (to avoid infinite loops)
      if (generatedBillNumber !== formData.billNumber) {
        setFormData(prev => ({
          ...prev,
          billNumber: generatedBillNumber
        }))
      }
    }
  }, [bills.length, formData.billType, formData.billDate, initialData, businessSettings, hasPrefilled, formData.billNumber])

  const addItem = () => {
    // Get default tax based on business and customer state
    const defaultTax = getDefaultTax(formData.businessInfo.state, formData.customerInfo.state)
    
    const newItem: BillItem = {
      name: '',
      hsn: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      discount: 0,
      amount: 0,
      cgst: defaultTax.cgst,
      sgst: defaultTax.sgst,
      igst: defaultTax.igst,
      taxAmount: 0,
      totalAmount: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value }
          
          // Auto-fill from warehouse if item name matches
          if (field === 'name' && value) {
            const warehouseItem = items.find(item => item.name.toLowerCase() === value.toLowerCase())
            if (warehouseItem) {
              updatedItem.hsn = warehouseItem.hsn || ''
              // Ensure defaultRate is a valid number, default to 0 if not
              const defaultRate = warehouseItem.defaultRate != null && !isNaN(warehouseItem.defaultRate) 
                ? Number(warehouseItem.defaultRate) 
                : 0
              updatedItem.rate = defaultRate
              updatedItem.unit = warehouseItem.defaultUnit || 'pcs'
              // Use warehouse defaultTax if available, otherwise use default based on state
              const warehouseTax = warehouseItem.defaultTax != null && !isNaN(warehouseItem.defaultTax)
                ? Number(warehouseItem.defaultTax)
                : 18 // Default to 18%
              const defaultTax = getDefaultTax(formData.businessInfo.state, formData.customerInfo.state)
              // Apply warehouse tax based on state
              // If same state: split warehouse tax into CGST and SGST
              // If different state: use warehouse tax as IGST
              if (defaultTax.cgst > 0 && defaultTax.sgst > 0) {
                // Same state: split warehouse tax into CGST and SGST
                updatedItem.cgst = warehouseTax / 2
                updatedItem.sgst = warehouseTax / 2
                updatedItem.igst = 0
              } else {
                // Different state: use warehouse tax as IGST
                updatedItem.cgst = 0
                updatedItem.sgst = 0
                updatedItem.igst = warehouseTax
              }
            }
          }
          
          // Calculate amounts - ensure all values are valid numbers
          const quantity = updatedItem.quantity != null && !isNaN(updatedItem.quantity) ? Number(updatedItem.quantity) : 0
          const rate = updatedItem.rate != null && !isNaN(updatedItem.rate) ? Number(updatedItem.rate) : 0
          const discount = updatedItem.discount != null && !isNaN(updatedItem.discount) ? Number(updatedItem.discount) : 0
          const cgst = updatedItem.cgst != null && !isNaN(updatedItem.cgst) ? Number(updatedItem.cgst) : 0
          const sgst = updatedItem.sgst != null && !isNaN(updatedItem.sgst) ? Number(updatedItem.sgst) : 0
          const igst = updatedItem.igst != null && !isNaN(updatedItem.igst) ? Number(updatedItem.igst) : 0
          
          const amount = quantity * rate
          const discountAmount = (amount * discount) / 100
          const discountedAmount = amount - discountAmount
          
          // Tax calculation: If IGST is used, use only IGST; otherwise use CGST + SGST
          const taxAmount = igst > 0 
            ? (discountedAmount * igst) / 100
            : (discountedAmount * (cgst + sgst)) / 100
          
          updatedItem.amount = parseFloat(discountedAmount.toFixed(2)) || 0
          updatedItem.taxAmount = parseFloat(taxAmount.toFixed(2)) || 0
          updatedItem.totalAmount = parseFloat((discountedAmount + taxAmount).toFixed(2)) || 0
          
          return updatedItem
        }
        return item
      })
    }))
  }

  // Helper function to recalculate item amounts
  const recalculateItemAmounts = (item: BillItem): BillItem => {
    const quantity = item.quantity != null && !isNaN(item.quantity) ? Number(item.quantity) : 0
    const rate = item.rate != null && !isNaN(item.rate) ? Number(item.rate) : 0
    const discount = item.discount != null && !isNaN(item.discount) ? Number(item.discount) : 0
    const cgst = item.cgst != null && !isNaN(item.cgst) ? Number(item.cgst) : 0
    const sgst = item.sgst != null && !isNaN(item.sgst) ? Number(item.sgst) : 0
    const igst = item.igst != null && !isNaN(item.igst) ? Number(item.igst) : 0
    
    const amount = quantity * rate
    const discountAmount = (amount * discount) / 100
    const discountedAmount = amount - discountAmount
    
    // Tax calculation: If IGST is used, use only IGST; otherwise use CGST + SGST
    const taxAmount = igst > 0 
      ? (discountedAmount * igst) / 100
      : (discountedAmount * (cgst + sgst)) / 100
    
    return {
      ...item,
      amount: parseFloat(discountedAmount.toFixed(2)) || 0,
      taxAmount: parseFloat(taxAmount.toFixed(2)) || 0,
      totalAmount: parseFloat((discountedAmount + taxAmount).toFixed(2)) || 0
    }
  }

  const handleCustomerSelect = (customerName: string) => {
    const customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
    if (customer) {
      setFormData(prev => {
        // Get default tax based on business and customer state
        const defaultTax = getDefaultTax(prev.businessInfo.state, customer.state)
        
        // Update tax for all existing items to match the new state and recalculate amounts
        const updatedItems = prev.items.map(item => {
          const itemWithNewTax = {
            ...item,
            cgst: defaultTax.cgst,
            sgst: defaultTax.sgst,
            igst: defaultTax.igst
          }
          return recalculateItemAmounts(itemWithNewTax)
        })
        
        return {
          ...prev,
          customerInfo: {
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state,
            pincode: customer.pincode || '',
            gstin: customer.gstin || ''
          },
          items: updatedItems
        }
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const billData = {
      ...formData,
      ...totals
    }
    onSave(billData)
  }

  const handlePreview = () => {
    const billData = {
      ...formData,
      ...totals
    }
    onPreview(billData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bill Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Bill Type</label>
            <select
              value={formData.billType}
              onChange={(e) => {
                const newBillType = e.target.value as 'invoice' | 'estimate'
                setFormData(prev => {
                  // Update bill number when type changes (for new bills only)
                  if (!initialData) {
                    const generatedBillNumber = generateBillNumber(newBillType, prev.billDate)
                    return { ...prev, billType: newBillType, billNumber: generatedBillNumber }
                  }
                  return { ...prev, billType: newBillType }
                })
              }}
              className="form-select"
            >
              <option value="invoice">Invoice</option>
              <option value="estimate">Estimate</option>
            </select>
          </div>
          <div>
            <label className="form-label">Bill Number</label>
            <input
              type="text"
              value={formData.billNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, billNumber: e.target.value }))}
              className="form-input"
              placeholder="Auto-generated if empty"
            />
          </div>
          <div>
            <label className="form-label">Bill Date</label>
            <input
              type="date"
              value={formData.billDate}
              onChange={(e) => {
                const newDate = e.target.value
                setFormData(prev => {
                  // Update bill number when date changes (for new bills only)
                  if (!initialData) {
                    const generatedBillNumber = generateBillNumber(prev.billType, newDate)
                    return { ...prev, billDate: newDate, billNumber: generatedBillNumber }
                  }
                  return { ...prev, billDate: newDate }
                })
              }}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Place of Supply</label>
            <select
              value={formData.placeOfSupply}
              onChange={(e) => setFormData(prev => ({ ...prev, placeOfSupply: e.target.value }))}
              className="form-select"
              required
            >
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Business Name *</label>
            <input
              type="text"
              value={formData.businessInfo.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, name: e.target.value }
              }))}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Email *</label>
            <input
              type="email"
              value={formData.businessInfo.email}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, email: e.target.value }
              }))}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Phone *</label>
            <input
              type="tel"
              value={formData.businessInfo.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, phone: e.target.value }
              }))}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">GSTIN</label>
            <input
              type="text"
              value={formData.businessInfo.gstin}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, gstin: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">PAN No.</label>
            <input
              type="text"
              value={formData.businessInfo.pan}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, pan: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Business State *</label>
            <select
              value={formData.businessInfo.state}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, state: e.target.value }
              }))}
              className="form-select"
              required
            >
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address *</label>
            <textarea
              value={formData.businessInfo.address}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                businessInfo: { ...prev.businessInfo, address: e.target.value }
              }))}
              className="form-textarea"
              rows={3}
              required
            />
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Customer Name *</label>
            <input
              type="text"
              list="customers"
              value={formData.customerInfo.name}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  customerInfo: { ...prev.customerInfo, name: e.target.value }
                }))
                handleCustomerSelect(e.target.value)
              }}
              className="form-input"
              required
            />
            <datalist id="customers">
              {customers.map(customer => (
                <option key={customer.id} value={customer.name} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.customerInfo.email}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, email: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              type="tel"
              value={formData.customerInfo.phone}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, phone: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">GSTIN</label>
            <input
              type="text"
              value={formData.customerInfo.gstin}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, gstin: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">City</label>
            <input
              type="text"
              value={formData.customerInfo.city}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, city: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">State *</label>
            <select
              value={formData.customerInfo.state}
              onChange={(e) => {
                const newState = e.target.value
                setFormData(prev => {
                  // Get default tax based on business and new customer state
                  const defaultTax = getDefaultTax(prev.businessInfo.state, newState)
                  
                  // Update tax for all existing items to match the new state and recalculate amounts
                  const updatedItems = prev.items.map(item => {
                    const itemWithNewTax = {
                      ...item,
                      cgst: defaultTax.cgst,
                      sgst: defaultTax.sgst,
                      igst: defaultTax.igst
                    }
                    return recalculateItemAmounts(itemWithNewTax)
                  })
                  
                  return {
                    ...prev,
                    customerInfo: { ...prev.customerInfo, state: newState },
                    items: updatedItems
                  }
                })
              }}
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
              value={formData.customerInfo.pincode}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, pincode: e.target.value }
              }))}
              className="form-input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <textarea
              value={formData.customerInfo.address}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, address: e.target.value }
              }))}
              className="form-textarea"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
        </div>

        {formData.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items added yet. Click "Add Item" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">Item Name *</label>
                    <input
                      type="text"
                      list={`items-${index}`}
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="form-input"
                      required
                    />
                    <datalist id={`items-${index}`}>
                      {items.map(warehouseItem => (
                        <option key={warehouseItem.id} value={warehouseItem.name} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="form-label">HSN Code *</label>
                    <input
                      type="text"
                      value={item.hsn}
                      onChange={(e) => updateItem(index, 'hsn', e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Unit *</label>
                    {item.unit.startsWith('custom:') ? (
                      <div>
                        <select
                          value="custom"
                          onChange={(e) => {
                            if (e.target.value !== 'custom') {
                              updateItem(index, 'unit', e.target.value)
                            }
                          }}
                          className="form-select mb-2"
                        >
                          <option value="pcs">Pieces</option>
                          <option value="kg">Kilograms</option>
                          <option value="g">Grams</option>
                          <option value="l">Liters</option>
                          <option value="ml">Milliliters</option>
                          <option value="m">Meters</option>
                          <option value="cm">Centimeters</option>
                          <option value="ft">Feet</option>
                          <option value="hrs">Hours</option>
                          <option value="days">Days</option>
                          <option value="sqm">Square Meters</option>
                          <option value="sqft">Sq. Ft.</option>
                          <option value="custom">Custom</option>
                        </select>
                        <input
                          type="text"
                          value={item.unit.split(':')[1] || ''}
                          onChange={(e) => updateItem(index, 'unit', `custom:${e.target.value}`)}
                          placeholder="Enter custom unit"
                          className="form-input"
                          required
                        />
                      </div>
                    ) : (
                      <select
                        value={item.unit}
                        onChange={(e) => {
                          if (e.target.value === 'custom') {
                            updateItem(index, 'unit', 'custom:')
                          } else {
                            updateItem(index, 'unit', e.target.value)
                          }
                        }}
                        className="form-select"
                        required
                      >
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="l">Liters</option>
                        <option value="ml">Milliliters</option>
                        <option value="m">Meters</option>
                        <option value="cm">Centimeters</option>
                        <option value="ft">Feet</option>
                        <option value="hrs">Hours</option>
                        <option value="days">Days</option>
                        <option value="sqm">Square Meters</option>
                        <option value="sqft">Sq. Ft.</option>
                        <option value="custom">Custom</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Rate *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Discount %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">CGST %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.cgst}
                      onChange={(e) => updateItem(index, 'cgst', parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">SGST %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.sgst}
                      onChange={(e) => updateItem(index, 'sgst', parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">IGST %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.igst}
                      onChange={(e) => updateItem(index, 'igst', parseFloat(e.target.value) || 0)}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Amount</label>
                    <input
                      type="text"
                      value={`₹${(item.amount || 0).toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Tax Amount</label>
                    <input
                      type="text"
                      value={`₹${(item.taxAmount || 0).toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Amount</label>
                    <input
                      type="text"
                      value={`₹${(item.totalAmount || 0).toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Item Button at Bottom */}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={addItem}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h3>
        <textarea
          value={formData.termsConditions}
          onChange={(e) => setFormData(prev => ({ ...prev, termsConditions: e.target.value }))}
          className="form-textarea"
          rows={4}
          placeholder="Enter terms and conditions..."
        />
      </div>

      {/* Totals */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h3>
        <div className="max-w-md ml-auto">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{(totals.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tax:</span>
              <span>₹{(totals.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rounding:</span>
              <span>₹{(totals.roundingAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total Amount:</span>
              <span>₹{(totals.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={handlePreview}
          className="btn btn-outline"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        <button
          type="submit"
          disabled={loading || formData.items.length === 0}
          className="btn btn-primary"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Bill'}
        </button>
      </div>
    </form>
  )
}
