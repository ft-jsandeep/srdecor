// Bill management functions
import { auth, db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp } from './firebase-config.js';

export class BillManager {
    constructor() {
        this.currentUser = null;
        this.bills = [];
    }

    // Set current user
    setCurrentUser(user) {
        this.currentUser = user;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Save a new bill
    async saveBill(billData) {
        if (!this.currentUser) {
            throw new Error('Please log in to save bills');
        }

        try {
            const docRef = await addDoc(collection(db, 'bills'), {
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
            // First, get all bills for the user (no ordering)
            const q = query(
                collection(db, 'bills'),
                where('userId', '==', this.currentUser.uid)
            );
            
            const querySnapshot = await getDocs(q);
            this.bills = [];
            
            querySnapshot.forEach((doc) => {
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
            await deleteDoc(doc(db, 'bills', billId));
            // Remove from local array
            this.bills = this.bills.filter(bill => bill.id !== billId);
        } catch (error) {
            throw new Error('Failed to delete bill: ' + error.message);
        }
    }

    // Update a bill
    async updateBill(billId, billData) {
        try {
            await updateDoc(doc(db, 'bills', billId), {
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
