'use client'

import { useApp } from '@/contexts/AppContext'
import { useEffect, useState } from 'react'
import { 
  Mail, 
  Phone, 
  Package, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  RefreshCw
} from 'lucide-react'
import { QuotationRequest } from '@/contexts/AppContext'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  contacted: 'bg-blue-100 text-blue-800 border-blue-200',
  quoted: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

const statusIcons = {
  pending: Clock,
  contacted: MessageSquare,
  quoted: CheckCircle,
  closed: XCircle
}

export default function LeadsPage() {
  const { 
    quotationRequests, 
    loadingQuotationRequests, 
    loadQuotationRequests,
    updateQuotationRequestStatus 
  } = useApp()
  
  const [filterStatus, setFilterStatus] = useState<'all' | QuotationRequest['status']>('all')
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null)

  useEffect(() => {
    loadQuotationRequests()
  }, [loadQuotationRequests])

  const filteredRequests = filterStatus === 'all' 
    ? quotationRequests 
    : quotationRequests.filter(req => req.status === filterStatus)

  const handleStatusChange = async (requestId: string, newStatus: QuotationRequest['status']) => {
    try {
      await updateQuotationRequestStatus(requestId, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingCount = quotationRequests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotation Requests</h1>
          <p className="text-gray-600 mt-2">Manage and track customer quotation requests</p>
        </div>
        <button
          onClick={() => loadQuotationRequests()}
          disabled={loadingQuotationRequests}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loadingQuotationRequests ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Contacted</p>
              <p className="text-2xl font-bold text-blue-900">
                {quotationRequests.filter(r => r.status === 'contacted').length}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Quoted</p>
              <p className="text-2xl font-bold text-green-900">
                {quotationRequests.filter(r => r.status === 'quoted').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{quotationRequests.length}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({quotationRequests.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('contacted')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'contacted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Contacted ({quotationRequests.filter(r => r.status === 'contacted').length})
          </button>
          <button
            onClick={() => setFilterStatus('quoted')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'quoted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quoted ({quotationRequests.filter(r => r.status === 'quoted').length})
          </button>
          <button
            onClick={() => setFilterStatus('closed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'closed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Closed ({quotationRequests.filter(r => r.status === 'closed').length})
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loadingQuotationRequests ? (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No quotation requests found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusIcon = statusIcons[request.status]
            return (
              <div key={request.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.productName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {request.productCategory}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${statusColors[request.status]}`}>
                        <StatusIcon size={14} />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Customer</p>
                        <p className="text-sm text-gray-900">{request.customerName}</p>
                      </div>
                      {request.email && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                          <a 
                            href={`mailto:${request.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail size={14} />
                            {request.email}
                          </a>
                        </div>
                      )}
                      {request.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Phone</p>
                          <a 
                            href={`tel:${request.phone}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone size={14} />
                            {request.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {request.message && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Message</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {request.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 md:w-48">
                    <label className="text-sm font-medium text-gray-700">Update Status</label>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request.id!, e.target.value as QuotationRequest['status'])}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="quoted">Quoted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}






