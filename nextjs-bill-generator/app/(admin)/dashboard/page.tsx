'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import Link from 'next/link'
import { Package, TrendingUp, Sparkles, Plus, FileText, List, Users, Settings } from 'lucide-react'
import { products, getBestsellers, getNewArrivals } from '@/data/products'
import { Button } from '@/components/decor/Button'
import { useApp } from '@/contexts/AppContext'

export default function AdminDashboardPage() {
  const bestsellers = getBestsellers()
  const newArrivals = getNewArrivals()
  
  // Get bill generator data (will be empty arrays if context not available)
  const appContext = useApp()
  const bills = appContext?.bills || []
  const items = appContext?.items || []
  const customers = appContext?.customers || []
  const totalRevenue = bills.reduce((sum: number, bill: any) => sum + (bill.total || 0), 0)

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-4xl font-bold text-light-text dark:text-dark-text">
            Admin Dashboard
          </h1>
          <div className="flex gap-3">
            <Link href="/admin/products/new">
              <Button variant="outline">
                <Plus size={20} className="mr-2" />
                Add Product
              </Button>
            </Link>
            <Link href="/admin/new-bill">
              <Button variant="primary">
                <FileText size={20} className="mr-2" />
                New Bill
              </Button>
            </Link>
          </div>
        </div>

        {/* SR Décor Stats */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-light-text dark:text-dark-text mb-4">
            SR Décor
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <Package className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {products.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Total Products</p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {bestsellers.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Bestsellers</p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {newArrivals.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">New Arrivals</p>
            </div>
          </div>
        </div>

        {/* Bill Generator Stats */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-semibold text-light-text dark:text-dark-text mb-4">
            Bill Generator
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <FileText className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {bills.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Total Bills</p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <Package className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {items.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Total Items</p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                {customers.length}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Customers</p>
            </div>

            <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="text-light-accent dark:text-dark-accent" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
            <h2 className="font-serif text-xl font-semibold text-light-text dark:text-dark-text mb-4">
              SR Décor Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/products">
                <Button variant="outline">Manage Products</Button>
              </Link>
              <Link href="/admin/products/new">
                <Button variant="outline">Add Product</Button>
              </Link>
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-soft">
            <h2 className="font-serif text-xl font-semibold text-light-text dark:text-dark-text mb-4">
              Bill Generator Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/new-bill">
                <Button variant="primary">Create Bill</Button>
              </Link>
              <Link href="/admin/bills">
                <Button variant="outline">All Bills</Button>
              </Link>
              <Link href="/admin/warehouse">
                <Button variant="outline">Warehouse</Button>
              </Link>
              <Link href="/admin/customers">
                <Button variant="outline">Customers</Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline">
                  <Settings size={18} className="mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

