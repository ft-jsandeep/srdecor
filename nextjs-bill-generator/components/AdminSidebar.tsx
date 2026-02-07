'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  FileText, 
  List, 
  Package, 
  Users, 
  Settings,
  MessageSquare,
  CreditCard
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'New Bill', href: '/admin/new-bill', icon: FileText },
  { name: 'All Bills', href: '/admin/bills', icon: List },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Warehouse', href: '/admin/warehouse', icon: Package },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="sticky top-[73px] h-[calc(100vh-73px)] w-64 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
