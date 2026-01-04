'use client'

import { useApp } from '@/contexts/AppContext'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Package, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  AlertCircle,
  DollarSign,
  MessageSquare
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { 
    bills, 
    items, 
    customers, 
    quotationRequests,
    loadingBills, 
    loadingItems, 
    loadingCustomers,
    getPendingBills
  } = useApp()

  const recentBills = bills.slice(0, 5)
  const totalBills = bills.length
  const totalItems = items.length
  const totalCustomers = customers.length
  const pendingLeads = quotationRequests.filter(r => r.status === 'pending').length

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)
  const pendingBills = getPendingBills()
  const totalPendingAmount = pendingBills.reduce((sum, bill) => sum + (bill.balance || bill.total), 0)

  const stats = [
    {
      name: 'Total Bills',
      value: totalBills,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Payments */}
      {pendingBills.length > 0 && (
        <div className="card border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
              Pending Payments
            </h3>
            <span className="text-sm text-gray-600">
              {pendingBills.length} {pendingBills.length === 1 ? 'bill' : 'bills'} pending
            </span>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Total Pending Amount:</span>
              <span className="text-lg font-bold text-orange-600">
                ₹{totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingBills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{bill.billNumber}</div>
                  <div className="text-sm text-gray-600">{bill.customerInfo.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    ₹{(bill.balance || bill.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {bill.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {pendingBills.length > 5 && (
            <Link
              href="/admin/bills"
              className="block text-center text-blue-600 hover:text-blue-700 font-medium mt-3"
            >
              View all pending bills ({pendingBills.length})
            </Link>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/admin/new-bill"
              className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-5 w-5 mr-3" />
              Create New Bill
            </Link>
            <Link
              href="/admin/warehouse"
              className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="h-5 w-5 mr-3" />
              Manage Items
            </Link>
            <Link
              href="/admin/customers"
              className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 mr-3" />
              Manage Customers
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="h-5 w-5 mr-3" />
              Manage SR Décor Products
            </Link>
            <Link
              href="/admin/leads"
              className="flex items-center p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Quotation Requests
              {pendingLeads > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingLeads}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h3>
          {loadingBills ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
            </div>
          ) : recentBills.length > 0 ? (
            <div className="space-y-3">
              {recentBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{bill.billNumber}</p>
                    <p className="text-sm text-gray-600">{bill.customerInfo.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">₹{bill.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{bill.billDate}</p>
                  </div>
                </div>
              ))}
              <Link
                href="/admin/bills"
                className="block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View all bills
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bills created yet</p>
              <Link
                href="/admin/new-bill"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first bill
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
