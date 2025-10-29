'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Eye, Save } from 'lucide-react'
import { Bill, BillItem, Item, Customer } from '@/contexts/AppContext'

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
      const amount = item.quantity * item.rate
      const discountAmount = (amount * item.discount) / 100
      const discountedAmount = amount - discountAmount
      
      const taxAmount = (discountedAmount * (item.cgst + item.sgst + item.igst)) / 100
      
      subtotal += discountedAmount
      totalTax += taxAmount
    })

    const rounding = Math.round(subtotal + totalTax) - (subtotal + totalTax)
    const total = subtotal + totalTax + rounding

    setTotals({
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(totalTax.toFixed(2)),
      roundingAmount: parseFloat(rounding.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    })
  }, [formData.items])

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        billType: initialData.billType,
        billNumber: initialData.billNumber,
        billDate: initialData.billDate,
        placeOfSupply: initialData.placeOfSupply,
        businessInfo: initialData.businessInfo,
        customerInfo: initialData.customerInfo,
        shippingInfo: initialData.shippingInfo || {
          name: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          phone: ''
        },
        bankDetails: initialData.bankDetails || {
          bankName: '',
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          branch: ''
        },
        items: initialData.items || [],
        termsConditions: initialData.termsConditions || ''
      })
    }
  }, [initialData])

  const addItem = () => {
    const newItem: BillItem = {
      name: '',
      hsn: '',
      quantity: 1,
      unit: 'pcs',
      rate: 0,
      discount: 0,
      amount: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
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
              updatedItem.hsn = warehouseItem.hsn
              updatedItem.rate = warehouseItem.defaultRate
              updatedItem.unit = warehouseItem.defaultUnit
              updatedItem.cgst = warehouseItem.defaultTax / 2
              updatedItem.sgst = warehouseItem.defaultTax / 2
              updatedItem.igst = 0
            }
          }
          
          // Calculate amounts
          const amount = updatedItem.quantity * updatedItem.rate
          const discountAmount = (amount * updatedItem.discount) / 100
          const discountedAmount = amount - discountAmount
          const taxAmount = (discountedAmount * (updatedItem.cgst + updatedItem.sgst + updatedItem.igst)) / 100
          
          updatedItem.amount = parseFloat(discountedAmount.toFixed(2))
          updatedItem.taxAmount = parseFloat(taxAmount.toFixed(2))
          updatedItem.totalAmount = parseFloat((discountedAmount + taxAmount).toFixed(2))
          
          return updatedItem
        }
        return item
      })
    }))
  }

  const handleCustomerSelect = (customerName: string) => {
    const customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
    if (customer) {
      setFormData(prev => ({
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
        }
      }))
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
              onChange={(e) => setFormData(prev => ({ ...prev, billType: e.target.value as 'invoice' | 'estimate' }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, billDate: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                customerInfo: { ...prev.customerInfo, state: e.target.value }
              }))}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Items</h3>
          <button
            type="button"
            onClick={addItem}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
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
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
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
                    </select>
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
                      value={`₹${item.amount.toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Tax Amount</label>
                    <input
                      type="text"
                      value={`₹${item.taxAmount.toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="form-label">Total Amount</label>
                    <input
                      type="text"
                      value={`₹${item.totalAmount.toFixed(2)}`}
                      className="form-input bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Tax:</span>
              <span>₹{totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rounding:</span>
              <span>₹{totals.roundingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total Amount:</span>
              <span>₹{totals.total.toFixed(2)}</span>
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
