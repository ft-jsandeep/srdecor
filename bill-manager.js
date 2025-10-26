// Bill management functions
import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from './firebase-config.js';

export class BillManager {
    constructor() {
        this.currentUser = null;
        this.bills = [];
        this.items = [];
        this.customers = [];
    }

    // Set current user
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // ===============================
    // Items (Products) Management
    // ===============================
    async saveItem(item) {
        if (!this.currentUser) throw new Error('Please log in to save items');
        const payload = {
            userId: this.currentUser.uid,
            name: item.name?.trim() || '',
            hsn: item.hsn?.trim() || '',
            defaultRate: Number(item.defaultRate) || 0,
            defaultUnit: item.defaultUnit || 'pcs',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const ref = await addDoc(collection(db, 'items'), payload);
        return ref.id;
    }

    async loadItems() {
        if (!this.currentUser) return [];
        const q = query(
            collection(db, 'items'),
            where('userId', '==', this.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        this.items = [];
        snapshot.forEach(d => this.items.push({ id: d.id, ...d.data() }));
        // sort by name asc for dropdowns
        this.items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return this.items;
    }

    getItems() {
        return this.items;
    }

    findItemByName(name) {
        const n = (name || '').toLowerCase();
        return this.items.find(i => (i.name || '').toLowerCase() === n);
    }

    async updateItem(itemId, itemData) {
        if (!this.currentUser) throw new Error('Please log in to update items');
        const payload = {
            name: itemData.name?.trim() || '',
            hsn: itemData.hsn?.trim() || '',
            defaultRate: Number(itemData.defaultRate) || 0,
            defaultUnit: itemData.defaultUnit || 'pcs',
            updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, 'items', itemId), payload);
        
        // Update local array
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.items[index] = { ...this.items[index], ...payload, updatedAt: new Date() };
        }
    }

    async deleteItem(itemId) {
        if (!this.currentUser) throw new Error('Please log in to delete items');
        await deleteDoc(doc(db, 'items', itemId));
        
        // Remove from local array
        this.items = this.items.filter(item => item.id !== itemId);
    }

    findItemById(itemId) {
        return this.items.find(item => item.id === itemId);
    }

    // ===============================
    // Customers Management
    // ===============================
    async saveCustomer(customer) {
        if (!this.currentUser) throw new Error('Please log in to save customers');
        const payload = {
            userId: this.currentUser.uid,
            name: customer.name?.trim() || '',
            email: customer.email?.trim() || '',
            phone: customer.phone?.trim() || '',
            address: customer.address?.trim() || '',
            city: customer.city?.trim() || '',
            state: customer.state?.trim() || '',
            pincode: customer.pincode?.trim() || '',
            gstin: customer.gstin?.trim() || '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const ref = await addDoc(collection(db, 'customers'), payload);
        return ref.id;
    }

    async loadCustomers() {
        if (!this.currentUser) return [];
        const q = query(
            collection(db, 'customers'),
            where('userId', '==', this.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        this.customers = [];
        snapshot.forEach(d => this.customers.push({ id: d.id, ...d.data() }));
        this.customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        return this.customers;
    }

    getCustomers() {
        return this.customers;
    }

    findCustomerByName(name) {
        const n = (name || '').toLowerCase();
        return this.customers.find(c => (c.name || '').toLowerCase() === n);
    }

    async updateCustomer(customerId, customerData) {
        if (!this.currentUser) throw new Error('Please log in to update customers');
        const payload = {
            name: customerData.name?.trim() || '',
            email: customerData.email?.trim() || '',
            phone: customerData.phone?.trim() || '',
            address: customerData.address?.trim() || '',
            city: customerData.city?.trim() || '',
            state: customerData.state?.trim() || '',
            pincode: customerData.pincode?.trim() || '',
            gstin: customerData.gstin?.trim() || '',
            updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, 'customers', customerId), payload);
        
        // Update local array
        const index = this.customers.findIndex(customer => customer.id === customerId);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...payload, updatedAt: new Date() };
        }
    }

    async deleteCustomer(customerId) {
        if (!this.currentUser) throw new Error('Please log in to delete customers');
        await deleteDoc(doc(db, 'customers', customerId));
        
        // Remove from local array
        this.customers = this.customers.filter(customer => customer.id !== customerId);
    }

    findCustomerById(customerId) {
        return this.customers.find(customer => customer.id === customerId);
    }

    // Save a new bill
    async saveBill(billData) {
        if (!this.currentUser) {
            throw new Error('Please log in to save bills');
        }

        try {
            // Use different collections for estimates and invoices
            const collectionName = billData.billType === 'estimate' ? 'estimates' : 'bills';
            const docRef = await addDoc(collection(db, collectionName), {
                ...billData,
                userId: this.currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            throw new Error('Failed to save bill: ' + error.message);
        }
    }

    // Load all bills for current user (modified to avoid index requirement)
    async loadBills() {
        if (!this.currentUser) return [];

        try {
            // Load from both bills and estimates collections
            const [billsQuery, estimatesQuery] = await Promise.all([
                getDocs(query(collection(db, 'bills'), where('userId', '==', this.currentUser.uid))),
                getDocs(query(collection(db, 'estimates'), where('userId', '==', this.currentUser.uid)))
            ]);
            
            this.bills = [];
            
            // Process invoices
            billsQuery.forEach((doc) => {
                const data = doc.data();
                this.bills.push({
                    id: doc.id,
                    ...data,
                    // Ensure we have proper date handling
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date()
                });
            });
            
            // Process estimates
            estimatesQuery.forEach((doc) => {
                const data = doc.data();
                this.bills.push({
                    id: doc.id,
                    ...data,
                    // Ensure we have proper date handling
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date()
                });
            });
            
            // Sort in JavaScript instead of Firestore
            this.bills.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                return dateB - dateA; // Descending order (newest first)
            });
            
            return this.bills;
        } catch (error) {
            throw new Error('Failed to load bills: ' + error.message);
        }
    }

    // Get bills array
    getBills() {
        return this.bills;
    }

    // Find bill by ID
    findBillById(billId) {
        return this.bills.find(bill => bill.id === billId);
    }

    // Delete a bill
    async deleteBill(billId) {
        try {
            // Find the bill to determine which collection it's in
            const bill = this.bills.find(b => b.id === billId);
            if (!bill) {
                throw new Error('Bill not found');
            }
            
            const collectionName = bill.billType === 'estimate' ? 'estimates' : 'bills';
            await deleteDoc(doc(db, collectionName, billId));
            
            // Remove from local array
            this.bills = this.bills.filter(bill => bill.id !== billId);
        } catch (error) {
            throw new Error('Failed to delete bill: ' + error.message);
        }
    }

    // Update a bill
    async updateBill(billId, billData) {
        try {
            // Find the bill to determine which collection it's in
            const bill = this.bills.find(b => b.id === billId);
            if (!bill) {
                throw new Error('Bill not found');
            }
            
            const collectionName = bill.billType === 'estimate' ? 'estimates' : 'bills';
            await updateDoc(doc(db, collectionName, billId), {
                ...billData,
                updatedAt: serverTimestamp()
            });
            
            // Update local array
            const index = this.bills.findIndex(bill => bill.id === billId);
            if (index !== -1) {
                this.bills[index] = { ...this.bills[index], ...billData, updatedAt: new Date() };
            }
        } catch (error) {
            throw new Error('Failed to update bill: ' + error.message);
        }
    }

    // Search bills
    searchBills(searchTerm) {
        if (!searchTerm) return this.bills;
        
        const term = searchTerm.toLowerCase();
        return this.bills.filter(bill => 
            bill.customerInfo.name.toLowerCase().includes(term) ||
            bill.businessInfo.name.toLowerCase().includes(term) ||
            bill.billDate.includes(term) ||
            bill.items.some(item => 
                item.name.toLowerCase().includes(term) ||
                item.description.toLowerCase().includes(term)
            )
        );
    }
}
