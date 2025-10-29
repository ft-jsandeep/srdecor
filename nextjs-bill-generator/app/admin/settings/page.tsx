'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building, CreditCard, FileText } from 'lucide-react'

export default function SettingsPage() {
  const { businessSettings, loadingSettings, saveBusinessSettings } = useApp()
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      pan: '',
      state: 'Haryana (06)'
    },
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      branch: ''
    },
    termsConditions: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (businessSettings) {
      setFormData(businessSettings)
    }
  }, [businessSettings])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await saveBusinessSettings(formData)
      setSuccess('Settings saved successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setSRDecorInfo = () => {
    setFormData({
      businessInfo: {
        name: 'S. R. DECOR',
        email: 'srdecorofficial@gmail.com',
        phone: '+91-9811627334',
        address: 'SHOP NO. 3, DHANI RAM COMPLEX, NEAR METRO PILLAR NO. 54-55, Gurgaon, Haryana - 122002',
        gstin: '06AFSPJ4994F1ZX',
        pan: 'AFSPJ4994F',
        state: 'Haryana (06)'
      },
      bankDetails: {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branch: ''
      },
      termsConditions: ''
    })
  }

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-gray-600 mt-1">Configure your default business information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Building className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
          </div>
          
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

        {/* Bank Details */}
        <div className="card">
          <div className="flex items-center mb-6">
            <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, bankName: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">A/c Holder Name</label>
              <input
                type="text"
                value={formData.bankDetails.accountHolderName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Account Number</label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                value={formData.bankDetails.ifscCode}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, ifscCode: e.target.value }
                }))}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Branch</label>
              <input
                type="text"
                value={formData.bankDetails.branch}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, branch: e.target.value }
                }))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="card">
          <div className="flex items-center mb-6">
            <FileText className="h-6 w-6 text-primary-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Default Terms & Conditions</h3>
          </div>
          
          <div>
            <label className="form-label">Terms & Conditions</label>
            <textarea
              value={formData.termsConditions}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                termsConditions: e.target.value
              }))}
              className="form-textarea"
              rows={6}
              placeholder="Enter your default terms and conditions..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={setSRDecorInfo}
            className="btn btn-outline"
          >
            Set S.R. Decor Info
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
