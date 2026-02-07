'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
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
  // Payment tracking fields
  paidAmount?: number
  balance?: number
  paymentStatus?: 'pending' | 'partial' | 'paid'
  createdAt?: any
  updatedAt?: any
}

export interface PaymentRecord {
  id?: string
  billId: string
  billNumber: string
  customerName: string
  amount: number
  paymentDate: string
  notes?: string
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

export interface QuotationRequest {
  id?: string
  productId: string
  productName: string
  productCategory: string
  productPrice: number
  customerName: string
  email: string
  phone: string
  message: string
  status: 'pending' | 'contacted' | 'quoted' | 'closed'
  createdAt?: any
  updatedAt?: any
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
  
  // Payments
  payments: PaymentRecord[]
  loadingPayments: boolean
  recordPayment: (billId: string, amount: number, paymentDate: string, notes?: string) => Promise<string>
  loadPayments: () => Promise<void>
  getPaymentsByBillId: (billId: string) => PaymentRecord[]
  getPendingBills: () => Bill[]
  updatePaymentStatus: (billId: string, paidAmount: number, paymentStatus?: 'pending' | 'partial' | 'paid') => Promise<void>
  recalculatePaymentStatus: (billId: string) => Promise<void>
  // Customer-level payments
  recordCustomerPayment: (customerName: string, totalAmount: number, paymentDate: string, notes?: string, billDistribution?: { billId: string, amount: number }[]) => Promise<void>
  updateCustomerPaymentStatus: (customerName: string, paidAmounts: { billId: string, paidAmount: number }[], paymentStatus?: 'pending' | 'partial' | 'paid') => Promise<void>
  
  // Quotation Requests
  quotationRequests: QuotationRequest[]
  loadingQuotationRequests: boolean
  loadQuotationRequests: () => Promise<void>
  updateQuotationRequestStatus: (requestId: string, status: QuotationRequest['status']) => Promise<void>
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
  const [businessSettingsDocId, setBusinessSettingsDocId] = useState<string | null>(null)
  const [isCreatingDefaultSettings, setIsCreatingDefaultSettings] = useState(false)
  
  // Payments state
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  
  // Quotation Requests state
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([])
  const [loadingQuotationRequests, setLoadingQuotationRequests] = useState(false)

  // Stabilize user.uid to prevent unnecessary re-renders
  const userId = useMemo(() => user?.uid, [user?.uid])

  // Bills functions
  const saveBill = async (billData: Omit<Bill, 'id'>) => {
    if (!user) throw new Error('Please log in to save bills')
    
    // Initialize payment tracking for new bills (only invoices, not estimates)
    const paymentData = billData.billType === 'invoice' ? {
      paidAmount: 0,
      balance: billData.total,
      paymentStatus: 'pending' as const
    } : {}
    
    const collectionName = billData.billType === 'estimate' ? 'estimates' : 'bills'
    const docRef = await addDoc(collection(db, collectionName), {
      ...billData,
      ...paymentData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Add to local state
    const newBill = { ...billData, ...paymentData, id: docRef.id }
    setBills(prev => [newBill, ...prev])
    
    return docRef.id
  }

  const loadBills = async () => {
    if (!user) return
    
    // Prevent multiple simultaneous loads
    if (loadingBills) return
    
    setLoadingBills(true)
    try {
      // Load bills and estimates in parallel
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
      
      // Sort on frontend
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
    
    // Prevent multiple simultaneous loads
    if (loadingItems) return
    
    setLoadingItems(true)
    try {
      const q = query(collection(db, 'items'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const itemsData: Item[] = []
      
      snapshot.forEach(doc => {
        itemsData.push({ id: doc.id, ...doc.data() } as Item)
      })
      
      // Sort on frontend
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
    
    // Prevent multiple simultaneous loads
    if (loadingCustomers) return
    
    setLoadingCustomers(true)
    try {
      const q = query(collection(db, 'customers'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const customersData: Customer[] = []
      
      snapshot.forEach(doc => {
        customersData.push({ id: doc.id, ...doc.data() } as Customer)
      })
      
      // Sort on frontend
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
    
    try {
      // Use setDoc with merge to avoid extra query if we have the doc ID
      let docId = businessSettingsDocId
      
      if (!docId) {
        // Only query if we don't have the doc ID cached
        const settingsRef = collection(db, 'businessSettings')
        const q = query(settingsRef, where('userId', '==', user.uid))
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          docId = snapshot.docs[0].id
          setBusinessSettingsDocId(docId)
        }
      }
      
      if (docId) {
        // Update existing document
        await updateDoc(doc(db, 'businessSettings', docId), {
          ...settings,
          userId: user.uid, // Ensure userId is preserved on update
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new document - use setDoc with generated ID to avoid query
        const newDocRef = doc(collection(db, 'businessSettings'))
        await setDoc(newDocRef, {
          ...settings,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        setBusinessSettingsDocId(newDocRef.id)
      }
      
      // Also save to localStorage as backup
      localStorage.setItem('businessSettings', JSON.stringify(settings))
      setBusinessSettings(settings)
    } catch (error: any) {
      console.error('Error saving business settings:', error)
      // Provide more helpful error message
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        throw new Error('Permission denied. Please check your Firestore security rules. Make sure you have rules for the businessSettings collection that allow authenticated users to read and write their own documents.')
      }
      throw error
    }
  }

  const loadBusinessSettings = async () => {
    if (!user) return
    
    // Prevent multiple simultaneous loads
    if (loadingSettings) return
    
    setLoadingSettings(true)
    try {
      // Try to load from Firebase first
      const settingsRef = collection(db, 'businessSettings')
      const q = query(settingsRef, where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        // Load from Firebase
        const docSnapshot = snapshot.docs[0]
        const settingsData = docSnapshot.data()
        const docId = docSnapshot.id
        setBusinessSettingsDocId(docId) // Cache the document ID for future updates
        
        const settings: BusinessSettings = {
          businessInfo: settingsData.businessInfo,
          bankDetails: settingsData.bankDetails || {
            bankName: '',
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            branch: ''
          },
          termsConditions: settingsData.termsConditions || ''
        }
        setBusinessSettings(settings)
        // Also update localStorage as backup
        localStorage.setItem('businessSettings', JSON.stringify(settings))
      } else {
        // Check if we're already creating default settings to prevent duplicate writes
        if (isCreatingDefaultSettings) {
          // Already creating, just set loading to false and return
          setLoadingSettings(false)
          return
        }
        
        // Try to load from localStorage (for migration)
        const saved = localStorage.getItem('businessSettings')
        if (saved) {
          const settings = JSON.parse(saved)
          setBusinessSettings(settings)
          
          // Only create if flag is not set (prevent duplicate writes)
          // No need for recheck read - the flag and loading state prevent race conditions
          if (!isCreatingDefaultSettings) {
            setIsCreatingDefaultSettings(true)
            try {
              const newDocRef = doc(collection(db, 'businessSettings'))
              await setDoc(newDocRef, {
                ...settings,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              })
              setBusinessSettingsDocId(newDocRef.id) // Cache the document ID
            } catch (error: any) {
              // If document already exists (race condition), try to load it
              if (error.code === 'permission-denied' || error.message?.includes('already exists')) {
                const recheckSnapshot = await getDocs(q)
                if (!recheckSnapshot.empty) {
                  const docSnapshot = recheckSnapshot.docs[0]
                  setBusinessSettingsDocId(docSnapshot.id)
                }
              } else {
                throw error
              }
            } finally {
              setIsCreatingDefaultSettings(false)
            }
          }
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
          
          // Only create if flag is not set (prevent duplicate writes)
          // No need for recheck read - the flag and loading state prevent race conditions
          if (!isCreatingDefaultSettings) {
            setIsCreatingDefaultSettings(true)
            try {
              // Save default settings to Firebase
              const newDocRef = doc(collection(db, 'businessSettings'))
              await setDoc(newDocRef, {
                ...defaultSettings,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              })
              setBusinessSettingsDocId(newDocRef.id) // Cache the document ID
            } catch (error: any) {
              // If document already exists (race condition), try to load it
              if (error.code === 'permission-denied' || error.message?.includes('already exists')) {
                const recheckSnapshot = await getDocs(q)
                if (!recheckSnapshot.empty) {
                  const docSnapshot = recheckSnapshot.docs[0]
                  const settingsData = docSnapshot.data()
                  const docId = docSnapshot.id
                  setBusinessSettingsDocId(docId)
                  
                  const loadedSettings: BusinessSettings = {
                    businessInfo: settingsData.businessInfo,
                    bankDetails: settingsData.bankDetails || {
                      bankName: '',
                      accountHolderName: '',
                      accountNumber: '',
                      ifscCode: '',
                      branch: ''
                    },
                    termsConditions: settingsData.termsConditions || ''
                  }
                  setBusinessSettings(loadedSettings)
                  localStorage.setItem('businessSettings', JSON.stringify(loadedSettings))
                }
              } else {
                throw error
              }
            } finally {
              setIsCreatingDefaultSettings(false)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading business settings:', error)
      // Fallback to localStorage if Firebase fails
      try {
        const saved = localStorage.getItem('businessSettings')
        if (saved) {
          setBusinessSettings(JSON.parse(saved))
        }
      } catch (localError) {
        console.error('Error loading from localStorage:', localError)
      }
    } finally {
      setLoadingSettings(false)
    }
  }

  // Payment functions
  const recordPayment = async (billId: string, amount: number, paymentDate: string, notes?: string) => {
    if (!user) throw new Error('Please log in to record payments')
    
    const bill = bills.find(b => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    
    if (bill.billType === 'estimate') {
      throw new Error('Cannot record payments for estimates')
    }
    
    // Create payment record
    const paymentRecord: Omit<PaymentRecord, 'id'> = {
      billId,
      billNumber: bill.billNumber,
      customerName: bill.customerInfo.name,
      amount,
      paymentDate,
      notes: notes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    const docRef = await addDoc(collection(db, 'payments'), {
      ...paymentRecord,
      userId: user.uid
    })
    
    // Update bill payment status
    // At this point, we know bill.billType is 'invoice' (not 'estimate') due to check above
    const currentPaidAmount = bill.paidAmount || 0
    const newPaidAmount = currentPaidAmount + amount
    const newBalance = bill.total - newPaidAmount
    const paymentStatus = newBalance <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending')
    
    // bill.billType is guaranteed to be 'invoice' here, so use 'bills' collection
    await updateDoc(doc(db, 'bills', billId), {
      paidAmount: newPaidAmount,
      balance: newBalance,
      paymentStatus,
      updatedAt: serverTimestamp()
    })
    
    // Update local state
    const newPayment = { ...paymentRecord, id: docRef.id }
    setPayments(prev => [newPayment, ...prev].sort((a, b) => {
      const dateA = a.paymentDate
      const dateB = b.paymentDate
      return dateB.localeCompare(dateA)
    }))
    
    setBills(prev => prev.map(b => 
      b.id === billId 
        ? { ...b, paidAmount: newPaidAmount, balance: newBalance, paymentStatus }
        : b
    ))
    
    return docRef.id
  }

  const loadPayments = async () => {
    if (!user) return
    
    if (loadingPayments) return
    
    setLoadingPayments(true)
    try {
      const q = query(collection(db, 'payments'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)
      const paymentsData: PaymentRecord[] = []
      
      snapshot.forEach(doc => {
        paymentsData.push({ id: doc.id, ...doc.data() } as PaymentRecord)
      })
      
      // Sort on frontend
      paymentsData.sort((a, b) => {
        const dateA = a.paymentDate
        const dateB = b.paymentDate
        return dateB.localeCompare(dateA)
      })
      
      setPayments(paymentsData)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const getPaymentsByBillId = (billId: string): PaymentRecord[] => {
    return payments.filter(p => p.billId === billId)
  }

  const getPendingBills = (): Bill[] => {
    return bills.filter(bill => 
      bill.billType === 'invoice' && 
      (bill.paymentStatus === 'pending' || bill.paymentStatus === 'partial')
    )
  }

  // Manually update payment status for a bill
  const updatePaymentStatus = async (billId: string, paidAmount: number, paymentStatus?: 'pending' | 'partial' | 'paid') => {
    if (!user) throw new Error('Please log in to update payment status')
    
    const bill = bills.find(b => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    
    if (bill.billType === 'estimate') {
      throw new Error('Cannot update payment status for estimates')
    }
    
    // Calculate balance and status if not provided
    // At this point, we know bill.billType is 'invoice' (not 'estimate') due to check above
    const newBalance = bill.total - paidAmount
    const calculatedStatus: 'pending' | 'partial' | 'paid' = newBalance <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending')
    const finalStatus = paymentStatus || calculatedStatus
    
    // bill.billType is guaranteed to be 'invoice' here, so use 'bills' collection
    await updateDoc(doc(db, 'bills', billId), {
      paidAmount,
      balance: newBalance,
      paymentStatus: finalStatus,
      updatedAt: serverTimestamp()
    })
    
    // Update local state
    setBills(prev => prev.map(b => 
      b.id === billId 
        ? { ...b, paidAmount, balance: newBalance, paymentStatus: finalStatus }
        : b
    ))
  }

  // Recalculate payment status from existing payment records
  const recalculatePaymentStatus = async (billId: string) => {
    if (!user) throw new Error('Please log in to recalculate payment status')
    
    const bill = bills.find(b => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    
    if (bill.billType === 'estimate') {
      throw new Error('Cannot recalculate payment status for estimates')
    }
    
    // Get all payments for this bill
    // At this point, we know bill.billType is 'invoice' (not 'estimate') due to check above
    const billPayments = payments.filter(p => p.billId === billId)
    const totalPaid = billPayments.reduce((sum, p) => sum + p.amount, 0)
    const newBalance = bill.total - totalPaid
    const paymentStatus: 'pending' | 'partial' | 'paid' = newBalance <= 0 ? 'paid' : (totalPaid > 0 ? 'partial' : 'pending')
    
    // bill.billType is guaranteed to be 'invoice' here, so use 'bills' collection
    await updateDoc(doc(db, 'bills', billId), {
      paidAmount: totalPaid,
      balance: newBalance,
      paymentStatus,
      updatedAt: serverTimestamp()
    })
    
    // Update local state
    setBills(prev => prev.map(b => 
      b.id === billId 
        ? { ...b, paidAmount: totalPaid, balance: newBalance, paymentStatus }
        : b
    ))
  }

  // Customer-level payment functions
  const recordCustomerPayment = async (
    customerName: string, 
    totalAmount: number, 
    paymentDate: string, 
    notes?: string,
    billDistribution?: { billId: string, amount: number }[]
  ) => {
    if (!user) throw new Error('Please log in to record payments')
    
    // Get all pending bills for this customer
    const customerBills = bills.filter(b => 
      b.customerInfo.name === customerName && 
      b.billType === 'invoice' &&
      (b.paymentStatus === 'pending' || b.paymentStatus === 'partial')
    ).sort((a, b) => {
      // Sort by date (oldest first) to pay oldest bills first
      const dateA = new Date(a.billDate).getTime()
      const dateB = new Date(b.billDate).getTime()
      return dateA - dateB
    })

    if (customerBills.length === 0) {
      throw new Error('No pending bills found for this customer')
    }

    let remainingAmount = totalAmount
    const paymentRecords: { billId: string, amount: number }[] = []

    // If billDistribution is provided, use it; otherwise distribute automatically
    if (billDistribution && billDistribution.length > 0) {
      // Validate distribution
      const distributionTotal = billDistribution.reduce((sum, d) => sum + d.amount, 0)
      if (Math.abs(distributionTotal - totalAmount) > 0.01) {
        throw new Error(`Distribution total (${distributionTotal}) does not match payment amount (${totalAmount})`)
      }

      // Validate each bill amount doesn't exceed balance
      for (const dist of billDistribution) {
        const bill = customerBills.find(b => b.id === dist.billId)
        if (!bill) {
          throw new Error(`Bill ${dist.billId} not found for customer ${customerName}`)
        }
        const billBalance = bill.balance ?? bill.total
        if (dist.amount > billBalance) {
          throw new Error(`Payment amount for bill ${bill.billNumber} exceeds balance`)
        }
        paymentRecords.push(dist)
      }
    } else {
      // Auto-distribute: pay oldest bills first
      for (const bill of customerBills) {
        if (remainingAmount <= 0) break
        
        const billBalance = bill.balance ?? bill.total
        const paymentAmount = Math.min(remainingAmount, billBalance)
        
        if (paymentAmount > 0) {
          paymentRecords.push({ billId: bill.id!, amount: paymentAmount })
          remainingAmount -= paymentAmount
        }
      }

      if (remainingAmount > 0.01) {
        throw new Error(`Payment amount exceeds total pending amount. Remaining: ${remainingAmount.toFixed(2)}`)
      }
    }

    // Record payments for each bill
    const paymentIds: string[] = []
    for (const paymentRecord of paymentRecords) {
      const bill = customerBills.find(b => b.id === paymentRecord.billId)!
      
      // Create payment record
      const paymentDoc: Omit<PaymentRecord, 'id'> = {
        billId: paymentRecord.billId,
        billNumber: bill.billNumber,
        customerName: customerName,
        amount: paymentRecord.amount,
        paymentDate,
        notes: notes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'payments'), {
        ...paymentDoc,
        userId: user.uid
      })
      paymentIds.push(docRef.id)

      // Update bill payment status
      const currentPaidAmount = bill.paidAmount || 0
      const newPaidAmount = currentPaidAmount + paymentRecord.amount
      const newBalance = bill.total - newPaidAmount
      const paymentStatus = newBalance <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending')
      
      // Ensure userId is preserved in the update
      // Note: userId is stored in Firestore but not in the Bill TypeScript interface
      const billData = bill as any
      const billUpdate: any = {
        paidAmount: newPaidAmount,
        balance: newBalance,
        paymentStatus,
        updatedAt: serverTimestamp()
      }
      
      // Preserve userId if it exists in the bill, otherwise set it to current user
      billUpdate.userId = billData.userId || user.uid
      
      await updateDoc(doc(db, 'bills', paymentRecord.billId), billUpdate)

      // Update local state
      setBills(prev => prev.map(b => 
        b.id === paymentRecord.billId 
          ? { ...b, paidAmount: newPaidAmount, balance: newBalance, paymentStatus }
          : b
      ))
    }

    // Add payment records to local state
    const newPayments = paymentRecords.map((pr, idx) => {
      const bill = customerBills.find(b => b.id === pr.billId)!
      return {
        id: paymentIds[idx],
        billId: pr.billId,
        billNumber: bill.billNumber,
        customerName: customerName,
        amount: pr.amount,
        paymentDate,
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      } as PaymentRecord
    })

    setPayments(prev => [...newPayments, ...prev].sort((a, b) => {
      const dateA = a.paymentDate
      const dateB = b.paymentDate
      return dateB.localeCompare(dateA)
    }))
  }

  const updateCustomerPaymentStatus = async (
    customerName: string,
    paidAmounts: { billId: string, paidAmount: number }[],
    paymentStatus?: 'pending' | 'partial' | 'paid'
  ) => {
    if (!user) throw new Error('Please log in to update payment status')
    
    // Get all bills for this customer
    const customerBills = bills.filter(b => 
      b.customerInfo.name === customerName && 
      b.billType === 'invoice'
    )

    // Update each bill
    for (const paidAmount of paidAmounts) {
      const bill = customerBills.find(b => b.id === paidAmount.billId)
      if (!bill) {
        throw new Error(`Bill ${paidAmount.billId} not found for customer ${customerName}`)
      }

      if (paidAmount.paidAmount < 0 || paidAmount.paidAmount > bill.total) {
        throw new Error(`Invalid paid amount for bill ${bill.billNumber}`)
      }

      const newBalance = bill.total - paidAmount.paidAmount
      const status = paymentStatus || (newBalance <= 0 ? 'paid' : (paidAmount.paidAmount > 0 ? 'partial' : 'pending'))
      
      // Ensure userId is preserved in the update
      // Note: userId is stored in Firestore but not in the Bill TypeScript interface
      const billData = bill as any
      const billUpdate: any = {
        paidAmount: paidAmount.paidAmount,
        balance: newBalance,
        paymentStatus: status,
        updatedAt: serverTimestamp()
      }
      
      // Preserve userId if it exists in the bill, otherwise set it to current user
      billUpdate.userId = billData.userId || user.uid
      
      await updateDoc(doc(db, 'bills', paidAmount.billId), billUpdate)

      // Update local state
      setBills(prev => prev.map(b => 
        b.id === paidAmount.billId 
          ? { ...b, paidAmount: paidAmount.paidAmount, balance: newBalance, paymentStatus: status }
          : b
      ))
    }
  }

  // Quotation Requests functions
  const loadQuotationRequests = async () => {
    if (!user) return
    
    if (loadingQuotationRequests) return
    
    setLoadingQuotationRequests(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'quotationRequests'))
      const requests: QuotationRequest[] = []
      
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as QuotationRequest)
      })
      
      // Sort by creation date (newest first)
      requests.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
      
      setQuotationRequests(requests)
    } catch (error) {
      console.error('Error loading quotation requests:', error)
    } finally {
      setLoadingQuotationRequests(false)
    }
  }

  const updateQuotationRequestStatus = async (requestId: string, status: QuotationRequest['status']) => {
    if (!user) throw new Error('Please log in to update quotation requests')
    
    await updateDoc(doc(db, 'quotationRequests', requestId), {
      status,
      updatedAt: serverTimestamp()
    })
    
    setQuotationRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status, updatedAt: new Date() } : req
    ))
  }

  // Load data when user changes
  useEffect(() => {
    if (!userId) {
      setBills([])
      setItems([])
      setCustomers([])
      setBusinessSettings(null)
      setBusinessSettingsDocId(null) // Reset cached doc ID
      setPayments([])
      setQuotationRequests([])
      return
    }
    
    // Call load functions - they're defined above, so they're available
    loadBills()
    loadItems()
    loadCustomers()
    loadBusinessSettings()
    loadPayments()
    loadQuotationRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]) // Only depend on user.uid, not the whole user object

  // Memoize context value to prevent SSR serialization issues
  const value = useMemo(() => ({
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
    loadBusinessSettings,
    
    // Payments
    payments,
    loadingPayments,
    recordPayment,
    loadPayments,
    getPaymentsByBillId,
    getPendingBills,
    updatePaymentStatus,
    recalculatePaymentStatus,
    recordCustomerPayment,
    updateCustomerPaymentStatus,
    
    // Quotation Requests
    quotationRequests,
    loadingQuotationRequests,
    loadQuotationRequests,
    updateQuotationRequestStatus
  }), [
    bills,
    loadingBills,
    items,
    loadingItems,
    customers,
    loadingCustomers,
    businessSettings,
    loadingSettings,
    payments,
    loadingPayments,
    quotationRequests,
    loadingQuotationRequests,
    searchBills
  ])

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
