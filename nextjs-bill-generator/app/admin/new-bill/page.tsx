'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Eye, Save } from 'lucide-react'
import BillForm from '@/components/BillForm'
import BillPreview from '@/components/BillPreview'

export default function NewBillPage() {
  const { saveBill, updateBill, bills, items, customers, loadItems, loadCustomers } = useApp()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editingBill, setEditingBill] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadItems()
    loadCustomers()
  }, [loadItems, loadCustomers])

  // Handle edit parameter
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId && bills.length > 0) {
      const billToEdit = bills.find(bill => bill.id === editId)
      if (billToEdit) {
        setEditingBill(billToEdit)
        setIsEditing(true)
      }
    }
  }, [searchParams, bills])

  const handleSaveBill = async (billData: any) => {
    setLoading(true)
    setError('')

    try {
      if (isEditing && editingBill) {
        await updateBill(editingBill.id, billData)
      } else {
        await saveBill(billData)
      }
      router.push('/admin/bills')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (billData: any) => {
    setPreviewData(billData)
    setShowPreview(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Bill' : 'Create New Bill'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update your bill details' : 'Fill in the details to generate your bill'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BillForm
            items={items}
            customers={customers}
            onSave={handleSaveBill}
            onPreview={handlePreview}
            loading={loading}
            initialData={editingBill}
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <p>Use the warehouse to manage your product catalog</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <p>Add customers to speed up future bill creation</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <p>Preview your bill before saving</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                <p>Choose from multiple bill templates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <BillPreview
          onClose={() => setShowPreview(false)}
          billData={previewData}
        />
      )}
    </div>
  )
}
