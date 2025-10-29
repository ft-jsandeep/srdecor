'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Types
export interface Bill {
  id?: string
  billType: 'invoice' | 'estimate'
  billNumber: string
  billDate: string
  placeOfSupply: string
  businessInfo: BusinessInfo
  customerInfo: CustomerInfo
  shippingInfo?: ShippingInfo
  bankDetails?: BankDetails
  items: BillItem[]
  subtotal: number
  taxAmount: number
  roundingAmount: number
  total: number
  termsConditions: string
  createdAt?: any
  updatedAt?: any
}

export interface BusinessInfo {
  name: string
  email: string
  phone: string
  address: string
  gstin?: string
  pan?: string
  state: string
}

export interface CustomerInfo {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state: string
  pincode?: string
  gstin?: string
}

export interface ShippingInfo {
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

export interface BankDetails {
  bankName?: string
  accountHolderName?: string
  accountNumber?: string
  ifscCode?: string
  branch?: string
}

export interface BillItem {
  name: string
  hsn: string
  quantity: number
  unit: string
  rate: number
  discount: number
  amount: number
  cgst: number
  sgst: number
  igst: number
  taxAmount: number
  totalAmount: number
}

export interface Item {
  id?: string
  name: string
  hsn: string
  defaultRate: number
  defaultUnit: string
  defaultTax: number
  createdAt?: any
  updatedAt?: any
}

export interface Customer {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state: string
  pincode?: string
  gstin?: string
  createdAt?: any
  updatedAt?: any
}

export interface BusinessSettings {
  businessInfo: BusinessInfo
  bankDetails: BankDetails
  termsConditions: string
}

interface AppContextType {
  // Bills
  bills: Bill[]
  loadingBills: boolean
  saveBill: (billData: Omit<Bill, 'id'>) => Promise<string>
  loadBills: () => Promise<void>
  deleteBill: (billId: string) => Promise<void>
  updateBill: (billId: string, billData: Partial<Bill>) => Promise<void>
  searchBills: (searchTerm: string) => Bill[]
  
  // Items
  items: Item[]
  loadingItems: boolean
  saveItem: (itemData: Omit<Item, 'id'>) => Promise<string>
  loadItems: () => Promise<void>
  deleteItem: (itemId: string) => Promise<void>
  updateItem: (itemId: string, itemData: Partial<Item>) => Promise<void>
  findItemByName: (name: string) => Item | undefined
  
  // Customers
  customers: Customer[]
  loadingCustomers: boolean
  saveCustomer: (customerData: Omit<Customer, 'id'>) => Promise<string>
  loadCustomers: () => Promise<void>
  deleteCustomer: (customerId: string) => Promise<void>
  updateCustomer: (customerId: string, customerData: Partial<Customer>) => Promise<void>
  findCustomerByName: (name: string) => Customer | undefined
  
  // Business Settings
  businessSettings: BusinessSettings | null
  loadingSettings: boolean
  saveBusinessSettings: (settings: BusinessSettings) => Promise<void>
  loadBusinessSettings: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  // Bills state
  const [bills, setBills] = useState<Bill[]>([])
  const [loadingBills, setLoadingBills] = useState(false)
  
  // Items state
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(false)
  
  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  
  // Business Settings state
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadBills()
      loadItems()
      loadCustomers()
      loadBusinessSettings()
    } else {
      setBills([])
      setItems([])
      setCustomers([])
      setBusinessSettings(null)
    }
  }, [user])

  // Bills functions
  const saveBill = async (billData: Omit<Bill, 'id'>) => {
    if (!user) throw new Error('Please log in to save bills')
    
    const collectionName = billData.billType === 'estimate' ? 'estimates' : 'bills'
    const docRef = await addDoc(collection(db, collectionName), {
      ...billData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Add to local state
    const newBill = { ...billData, id: docRef.id }
    setBills(prev => [newBill, ...prev])
    
    return docRef.id
  }

  const loadBills = async () => {
    if (!user) return
    
    setLoadingBills(true)
    try {
      const [billsQuery, estimatesQuery] = await Promise.all([
        getDocs(query(collection(db, 'bills'), where('userId', '==', user.uid))),
        getDocs(query(collection(db, 'estimates'), where('userId', '==', user.uid)))
      ])
      
      const billsData: Bill[] = []
      
      billsQuery.forEach((doc) => {
        billsData.push({ id: doc.id, ...doc.data() } as Bill)
      })
      
      estimatesQuery.forEach((doc) => {
        billsData.push({ id: doc.id, ...doc.data() } as Bill)
      })
      
      billsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      setBills(billsData)
    } catch (error) {
      console.error('Error loading bills:', error)
    } finally {
      setLoadingBills(false)
    }
  }

  const deleteBill = async (billId: string) => {
    if (!user) throw new Error('Please log in to delete bills')
    
    const bill = bills.find(b => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    
    const collectionName = bill.billType === 'estimate' ? 'estimates' : 'bills'
    await deleteDoc(doc(db, collectionName, billId))
    
    setBills(prev => prev.filter(bill => bill.id !== billId))
  }

  const updateBill = async (billId: string, billData: Partial<Bill>) => {
    if (!user) throw new Error('Please log in to update bills')
    
    const bill = bills.find(b => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    
    const collectionName = bill.billType === 'estimate' ? 'estimates' : 'bills'
    await updateDoc(doc(db, collectionName, billId), {
      ...billData,
      updatedAt: serverTimestamp()
    })
    
    setBills(prev => prev.map(b => 
      b.id === billId ? { ...b, ...billData, updatedAt: new Date() } : b
    ))
  }

  const searchBills = (searchTerm: string) => {
    if (!searchTerm) return bills
    
    const term = searchTerm.toLowerCase()
    return bills.filter(bill => 
      bill.customerInfo.name.toLowerCase().includes(term) ||
      bill.businessInfo.name.toLowerCase().includes(term) ||
      bill.billDate.includes(term) ||
      bill.items.some(item => 
        item.name.toLowerCase().includes(term) ||
        item.hsn.toLowerCase().includes(term)
      )
    )
  }

  // Items functions
  const saveItem = async (itemData: Omit<Item, 'id'>) => {
    if (!user) throw new Error('Please log in to save items')
    
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    const newItem = { ...itemData, id: docRef.id }
    setItems(prev => [...prev, newItem].sort((a, b) => a.name.localeCompare(b.name)))
    
    return docRef.id
  }

  const loadItems = async () => {
    if (!user) return
    
    setLoadingItems(true)
    try {
      const q = query(collection(db, 'items'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const itemsData: Item[] = []
      
      snapshot.forEach(doc => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item)
      })
      
      itemsData.sort((a, b) => a.name.localeCompare(b.name))
      setItems(itemsData)
    } catch (error) {
      console.error('Error loading items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!user) throw new Error('Please log in to delete items')
    
    await deleteDoc(doc(db, 'items', itemId))
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const updateItem = async (itemId: string, itemData: Partial<Item>) => {
    if (!user) throw new Error('Please log in to update items')
    
    await updateDoc(doc(db, 'items', itemId), {
      ...itemData,
      updatedAt: serverTimestamp()
    })
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...itemData, updatedAt: new Date() } : item
    ))
  }

  const findItemByName = (name: string) => {
    return items.find(item => item.name.toLowerCase() === name.toLowerCase())
  }

  // Customers functions
  const saveCustomer = async (customerData: Omit<Customer, 'id'>) => {
    if (!user) throw new Error('Please log in to save customers')
    
    const docRef = await addDoc(collection(db, 'customers'), {
      ...customerData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    const newCustomer = { ...customerData, id: docRef.id }
    setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)))
    
    return docRef.id
  }

  const loadCustomers = async () => {
    if (!user) return
    
    setLoadingCustomers(true)
    try {
      const q = query(collection(db, 'customers'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const customersData: Customer[] = []
      
      snapshot.forEach(doc => {
        customersData.push({ id: doc.id, ...doc.data() } as Customer)
      })
      
      customersData.sort((a, b) => a.name.localeCompare(b.name))
      setCustomers(customersData)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const deleteCustomer = async (customerId: string) => {
    if (!user) throw new Error('Please log in to delete customers')
    
    await deleteDoc(doc(db, 'customers', customerId))
    setCustomers(prev => prev.filter(customer => customer.id !== customerId))
  }

  const updateCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    if (!user) throw new Error('Please log in to update customers')
    
    await updateDoc(doc(db, 'customers', customerId), {
      ...customerData,
      updatedAt: serverTimestamp()
    })
    
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId ? { ...customer, ...customerData, updatedAt: new Date() } : customer
    ))
  }

  const findCustomerByName = (name: string) => {
    return customers.find(customer => customer.name.toLowerCase() === name.toLowerCase())
  }

  // Business Settings functions
  const saveBusinessSettings = async (settings: BusinessSettings) => {
    if (!user) throw new Error('Please log in to save settings')
    
    // For now, we'll store settings in localStorage
    // In a real app, you might want to store this in Firestore
    localStorage.setItem('businessSettings', JSON.stringify(settings))
    setBusinessSettings(settings)
  }

  const loadBusinessSettings = async () => {
    if (!user) return
    
    setLoadingSettings(true)
    try {
      const saved = localStorage.getItem('businessSettings')
      if (saved) {
        setBusinessSettings(JSON.parse(saved))
      } else {
        // Set default S.R. DECOR business information if no settings are saved
        const defaultSettings: BusinessSettings = {
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
        }
        setBusinessSettings(defaultSettings)
      }
    } catch (error) {
      console.error('Error loading business settings:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  const value = {
    // Bills
    bills,
    loadingBills,
    saveBill,
    loadBills,
    deleteBill,
    updateBill,
    searchBills,
    
    // Items
    items,
    loadingItems,
    saveItem,
    loadItems,
    deleteItem,
    updateItem,
    findItemByName,
    
    // Customers
    customers,
    loadingCustomers,
    saveCustomer,
    loadCustomers,
    deleteCustomer,
    updateCustomer,
    findCustomerByName,
    
    // Business Settings
    businessSettings,
    loadingSettings,
    saveBusinessSettings,
    loadBusinessSettings
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
