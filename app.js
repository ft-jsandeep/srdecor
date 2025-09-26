// Main application module
import { AuthManager } from './auth-manager.js';
import { BillManager } from './bill-manager.js';
import { UIUtils } from './ui-utils.js';

export class BillGeneratorApp {
    constructor() {
        this.authManager = new AuthManager();
        this.billManager = new BillManager();
        this.currentView = 'generator';
        
        this.initializeApp();
    }

    // Initialize the application
    initializeApp() {
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.setCurrentDate();
        this.initializeCalculations();
    }

    // Setup event listeners
    setupEventListeners() {
        // Authentication
        UIUtils.addEventListener(UIUtils.getElement('login-form'), 'submit', (e) => this.handleLogin(e));
        UIUtils.addEventListener(UIUtils.getElement('register-form'), 'submit', (e) => this.handleRegister(e));
        
        // Navigation
        UIUtils.addEventListener(UIUtils.getElement('logout-btn'), 'click', () => this.handleLogout());
        UIUtils.addEventListener(UIUtils.getElement('new-bill-btn'), 'click', () => this.showBillGenerator());
        UIUtils.addEventListener(UIUtils.getElement('view-bills-btn'), 'click', () => this.showBillsList());
        UIUtils.addEventListener(UIUtils.getElement('back-to-generator'), 'click', () => this.showBillGenerator());
        
        // Bill form
        UIUtils.addEventListener(UIUtils.getElement('bill-form'), 'submit', (e) => this.handleBillSubmit(e));
        UIUtils.addEventListener(UIUtils.getElement('add-item-btn'), 'click', () => this.addItemRow());
        UIUtils.addEventListener(UIUtils.getElement('preview-bill-btn'), 'click', () => this.previewBill());
        
        // Items container (event delegation)
        UIUtils.addEventListener(UIUtils.getElement('items-container'), 'input', (e) => this.calculateItemAmount(e));
        UIUtils.addEventListener(UIUtils.getElement('items-container'), 'change', (e) => this.handleUnitChange(e));
        UIUtils.addEventListener(UIUtils.getElement('items-container'), 'click', (e) => this.handleItemActions(e));
        
        // Tax rate change
        UIUtils.addEventListener(UIUtils.getElement('tax-rate'), 'input', () => this.calculateTotals());
        
        // Search bills
        UIUtils.addEventListener(UIUtils.getElement('search-bills'), 'input', () => this.filterBills());
        
        // Modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            UIUtils.addEventListener(btn, 'click', () => this.closeModal());
        });
        
        // Print bill
        UIUtils.addEventListener(UIUtils.getElement('print-bill-btn'), 'click', () => this.printBill());
        
        // Close modal on outside click
        UIUtils.addEventListener(UIUtils.getElement('bill-preview-modal'), 'click', (e) => {
            if (e.target === UIUtils.getElement('bill-preview-modal')) {
                this.closeModal();
            }
        });
    }

    // Setup auth state listener
    setupAuthStateListener() {
        this.authManager.onAuthStateChange((user) => {
            if (user) {
                this.billManager.setCurrentUser(user);
                this.showMainApp();
                this.loadBills();
            } else {
                this.showAuthSection();
            }
        });
        
        this.authManager.init();
    }

    // Set current date
    setCurrentDate() {
        UIUtils.getElement('bill-date').value = new Date().toISOString().split('T')[0];
    }

    // Initialize calculations
    initializeCalculations() {
        this.calculateTotals();
    }

    // Authentication handlers
    async handleLogin(e) {
        e.preventDefault();
        const email = UIUtils.getElement('login-email').value;
        const password = UIUtils.getElement('login-password').value;
        
        try {
            await this.authManager.signIn(email, password);
            UIUtils.showMessage('Login successful!', 'success');
        } catch (error) {
            UIUtils.showMessage(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = UIUtils.getElement('register-email').value;
        const password = UIUtils.getElement('register-password').value;
        const confirmPassword = UIUtils.getElement('register-confirm').value;
        
        if (password !== confirmPassword) {
            UIUtils.showMessage('Passwords do not match', 'error');
            return;
        }
        
        try {
            await this.authManager.signUp(email, password);
            UIUtils.showMessage('Registration successful!', 'success');
        } catch (error) {
            UIUtils.showMessage(error.message, 'error');
        }
    }

    async handleLogout() {
        try {
            await this.authManager.signOut();
            UIUtils.showMessage('Logged out successfully', 'success');
        } catch (error) {
            UIUtils.showMessage(error.message, 'error');
        }
    }

    // UI Navigation
    showAuthSection() {
        UIUtils.hide(UIUtils.getElement('main-app'));
        UIUtils.show(UIUtils.getElement('auth-section'));
    }

    showMainApp() {
        UIUtils.hide(UIUtils.getElement('auth-section'));
        UIUtils.show(UIUtils.getElement('main-app'));
    }

    showBillGenerator() {
        UIUtils.hide(UIUtils.getElement('bills-list'));
        UIUtils.show(UIUtils.getElement('bill-generator'));
        this.currentView = 'generator';
    }

    showBillsList() {
        UIUtils.hide(UIUtils.getElement('bill-generator'));
        UIUtils.show(UIUtils.getElement('bills-list'));
        this.currentView = 'bills';
    }

    // Bill form handlers
    addItemRow() {
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" class="item-name" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="item-description">
            </div>
            <div class="item-fields-grid">
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="item-quantity" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <select class="item-unit" required>
                        <option value="pcs">Pieces</option>
                        <option value="kg">Kilograms</option>
                        <option value="g">Grams</option>
                        <option value="l">Liters</option>
                        <option value="ml">Milliliters</option>
                        <option value="m">Meters</option>
                        <option value="cm">Centimeters</option>
                        <option value="ft">Feet</option>
                        <option value="hrs">Hours</option>
                        <option value="days">Days</option>
                        <option value="custom">Custom</option>
                    </select>
                    <input type="text" class="item-custom-unit hidden" placeholder="Enter custom unit">
                </div>
                <div class="form-group">
                    <label>Rate (per unit)</label>
                    <input type="number" class="item-rate" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" class="item-amount" readonly>
                </div>
            </div>
            <div class="item-actions">
                <div class="item-amount-display">
                    Amount: ₹<span class="amount-value">0.00</span>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-item">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        UIUtils.getElement('items-container').appendChild(itemRow);
    }

    handleUnitChange(e) {
        if (e.target.classList.contains('item-unit')) {
            const customUnitInput = e.target.parentElement.querySelector('.item-custom-unit');
            if (e.target.value === 'custom') {
                UIUtils.show(customUnitInput);
                customUnitInput.required = true;
            } else {
                UIUtils.hide(customUnitInput);
                customUnitInput.required = false;
            }
        }
    }

    calculateItemAmount(e) {
        if (e.target.classList.contains('item-quantity') || e.target.classList.contains('item-rate')) {
            const itemRow = e.target.closest('.item-row');
            const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
            const amount = quantity * rate;
            
            itemRow.querySelector('.item-amount').value = amount.toFixed(2);
            itemRow.querySelector('.amount-value').textContent = amount.toFixed(2);
            this.calculateTotals();
        }
    }

    handleItemActions(e) {
        if (e.target.closest('.remove-item')) {
            const itemRow = e.target.closest('.item-row');
            if (UIUtils.getElement('items-container').children.length > 1) {
                itemRow.remove();
                this.calculateTotals();
            } else {
                UIUtils.showMessage('At least one item is required', 'error');
            }
        }
    }

    calculateTotals() {
        let subtotal = 0;
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
            subtotal += amount;
        });
        
        const taxRate = parseFloat(UIUtils.getElement('tax-rate').value) || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;
        
        UIUtils.getElement('subtotal').textContent = UIUtils.formatCurrency(subtotal);
        UIUtils.getElement('tax-amount').textContent = UIUtils.formatCurrency(taxAmount);
        UIUtils.getElement('total-amount').textContent = UIUtils.formatCurrency(total);
    }

    async handleBillSubmit(e) {
        e.preventDefault();
        
        try {
            const billData = this.collectBillData();
            await this.billManager.saveBill(billData);
            UIUtils.showMessage('Bill saved successfully!', 'success');
            this.resetBillForm();
            this.loadBills();
        } catch (error) {
            UIUtils.showMessage(error.message, 'error');
        }
    }

    collectBillData() {
        const businessInfo = {
            name: UIUtils.getElement('business-name').value,
            email: UIUtils.getElement('business-email').value,
            phone: UIUtils.getElement('business-phone').value,
            address: UIUtils.getElement('business-address').value
        };
        
        const customerInfo = {
            name: UIUtils.getElement('customer-name').value,
            email: UIUtils.getElement('customer-email').value,
            phone: UIUtils.getElement('customer-phone').value
        };
        
        const items = [];
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            const unit = row.querySelector('.item-unit').value;
            const customUnit = row.querySelector('.item-custom-unit').value;
            
            items.push({
                name: row.querySelector('.item-name').value,
                description: row.querySelector('.item-description').value,
                quantity: parseFloat(row.querySelector('.item-quantity').value),
                unit: unit === 'custom' ? customUnit : unit,
                rate: parseFloat(row.querySelector('.item-rate').value),
                amount: parseFloat(row.querySelector('.item-amount').value)
            });
        });
        
        const subtotal = parseFloat(UIUtils.getElement('subtotal').textContent.replace('₹', ''));
        const taxRate = parseFloat(UIUtils.getElement('tax-rate').value);
        const taxAmount = parseFloat(UIUtils.getElement('tax-amount').textContent.replace('₹', ''));
        const total = parseFloat(UIUtils.getElement('total-amount').textContent.replace('₹', ''));
        
        return {
            businessInfo,
            customerInfo,
            items,
            billDate: UIUtils.getElement('bill-date').value,
            subtotal,
            taxRate,
            taxAmount,
            total
        };
    }

    resetBillForm() {
        UIUtils.getElement('bill-form').reset();
        UIUtils.getElement('bill-date').value = new Date().toISOString().split('T')[0];
        
        // Reset items to single row
        UIUtils.getElement('items-container').innerHTML = '';
        this.addItemRow();
        
        this.calculateTotals();
    }

    // Bills management
    async loadBills() {
        try {
            await this.billManager.loadBills();
            this.displayBills();
        } catch (error) {
            UIUtils.showMessage(error.message, 'error');
        }
    }

    displayBills() {
        const billsContainer = UIUtils.getElement('bills-container');
        const bills = this.billManager.getBills();
        
        billsContainer.innerHTML = '';
        
        if (bills.length === 0) {
            billsContainer.innerHTML = '<p class="text-center">No bills found. Create your first bill!</p>';
            return;
        }
        
        bills.forEach(bill => {
            const billCard = document.createElement('div');
            billCard.className = 'bill-card';
            billCard.innerHTML = `
                <div class="bill-header">
                    <div class="bill-info">
                        <h3>${bill.customerInfo.name}</h3>
                        <p>Bill Date: ${UIUtils.formatDate(bill.billDate)}</p>
                    </div>
                    <div class="bill-amount">${UIUtils.formatCurrency(bill.total)}</div>
                </div>
                <div class="bill-details">
                    <div class="bill-detail">
                        <label>Business</label>
                        <span>${bill.businessInfo.name}</span>
                    </div>
                    <div class="bill-detail">
                        <label>Items</label>
                        <span>${bill.items.length} item(s)</span>
                    </div>
                    <div class="bill-detail">
                        <label>Tax Rate</label>
                        <span>${bill.taxRate}%</span>
                    </div>
                    <div class="bill-detail">
                        <label>Created</label>
                        <span>${UIUtils.formatDate(bill.createdAt)}</span>
                    </div>
                </div>
                <div class="bill-actions">
                    <button class="btn btn-secondary btn-sm" onclick="app.viewBill('${bill.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="app.editBill('${bill.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteBill('${bill.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            billsContainer.appendChild(billCard);
        });
    }

    filterBills() {
        const searchTerm = UIUtils.getElement('search-bills').value;
        const filteredBills = this.billManager.searchBills(searchTerm);
        
        const billsContainer = UIUtils.getElement('bills-container');
        const billCards = billsContainer.querySelectorAll('.bill-card');
        
        billCards.forEach((card, index) => {
            if (index < filteredBills.length) {
                UIUtils.show(card);
            } else {
                UIUtils.hide(card);
            }
        });
    }

    viewBill(billId) {
        const bill = this.billManager.findBillById(billId);
        if (bill) {
            this.generateBillPreview(bill);
            UIUtils.show(UIUtils.getElement('bill-preview-modal'));
        }
    }

    editBill(billId) {
        const bill = this.billManager.findBillById(billId);
        if (bill) {
            this.populateBillForm(bill);
            this.showBillGenerator();
        }
    }

    async deleteBill(billId) {
        if (confirm('Are you sure you want to delete this bill?')) {
            try {
                await this.billManager.deleteBill(billId);
                UIUtils.showMessage('Bill deleted successfully', 'success');
                this.loadBills();
            } catch (error) {
                UIUtils.showMessage(error.message, 'error');
            }
        }
    }

    populateBillForm(bill) {
        // Populate business info
        UIUtils.getElement('business-name').value = bill.businessInfo.name;
        UIUtils.getElement('business-email').value = bill.businessInfo.email;
        UIUtils.getElement('business-phone').value = bill.businessInfo.phone;
        UIUtils.getElement('business-address').value = bill.businessInfo.address;
        
        // Populate customer info
        UIUtils.getElement('customer-name').value = bill.customerInfo.name;
        UIUtils.getElement('customer-email').value = bill.customerInfo.email || '';
        UIUtils.getElement('customer-phone').value = bill.customerInfo.phone || '';
        UIUtils.getElement('bill-date').value = bill.billDate;
        
        // Clear existing items
        UIUtils.getElement('items-container').innerHTML = '';
        
        // Add items
        bill.items.forEach((item, index) => {
            if (index > 0) this.addItemRow();
            
            const itemRows = document.querySelectorAll('.item-row');
            const currentRow = itemRows[itemRows.length - 1];
            
            currentRow.querySelector('.item-name').value = item.name;
            currentRow.querySelector('.item-description').value = item.description || '';
            currentRow.querySelector('.item-quantity').value = item.quantity;
            currentRow.querySelector('.item-rate').value = item.rate;
            currentRow.querySelector('.item-amount').value = item.amount;
            currentRow.querySelector('.amount-value').textContent = item.amount.toFixed(2);
            
            // Handle unit selection
            const unitSelect = currentRow.querySelector('.item-unit');
            const customUnitInput = currentRow.querySelector('.item-custom-unit');
            
            if (['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'ft', 'hrs', 'days'].includes(item.unit)) {
                unitSelect.value = item.unit;
            } else {
                unitSelect.value = 'custom';
                UIUtils.show(customUnitInput);
                customUnitInput.value = item.unit;
            }
        });
        
        // Set tax rate
        UIUtils.getElement('tax-rate').value = bill.taxRate;
        
        // Calculate totals
        this.calculateTotals();
    }

    // Bill preview functions
    previewBill() {
        const billData = this.collectBillData();
        this.generateBillPreview(billData);
        UIUtils.show(UIUtils.getElement('bill-preview-modal'));
    }

    generateBillPreview(billData) {
        const previewContent = UIUtils.getElement('bill-preview-content');
        
        const itemsHtml = billData.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.description || '-'}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${UIUtils.formatCurrency(item.rate)}</td>
                <td>${UIUtils.formatCurrency(item.amount)}</td>
            </tr>
        `).join('');
        
        previewContent.innerHTML = `
            <div class="bill-preview">
                <div class="bill-preview-header">
                    <h1>${billData.businessInfo.name}</h1>
                    <p>${billData.businessInfo.address}</p>
                    <p>Email: ${billData.businessInfo.email} | Phone: ${billData.businessInfo.phone}</p>
                </div>
                
                <div class="bill-preview-info">
                    <div class="bill-preview-section">
                        <h3>Bill To:</h3>
                        <p><strong>${billData.customerInfo.name}</strong></p>
                        ${billData.customerInfo.email ? `<p>Email: ${billData.customerInfo.email}</p>` : ''}
                        ${billData.customerInfo.phone ? `<p>Phone: ${billData.customerInfo.phone}</p>` : ''}
                    </div>
                    <div class="bill-preview-section">
                        <h3>Bill Details:</h3>
                        <p><strong>Bill Date:</strong> ${UIUtils.formatDate(billData.billDate)}</p>
                        <p><strong>Bill Number:</strong> #${Date.now()}</p>
                    </div>
                </div>
                
                <div class="bill-preview-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Description</th>
                                <th>Qty</th>
                                <th>Unit</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
                
                <div class="bill-preview-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${UIUtils.formatCurrency(billData.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax (${billData.taxRate}%):</span>
                        <span>${UIUtils.formatCurrency(billData.taxAmount)}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>${UIUtils.formatCurrency(billData.total)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    closeModal() {
        UIUtils.hide(UIUtils.getElement('bill-preview-modal'));
    }

    printBill() {
        const printContent = UIUtils.getElement('bill-preview-content').innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bill Print</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .bill-preview { max-width: 800px; margin: 0 auto; }
                        .bill-preview-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #000; }
                        .bill-preview-info { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .bill-preview-items table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .bill-preview-items th, .bill-preview-items td { padding: 12px; text-align: left; border-bottom: 1px solid #000; }
                        .bill-preview-items th { background: #f5f5f5; }
                        .bill-preview-items td:last-child, .bill-preview-items th:last-child { text-align: right; }
                        .bill-preview-totals { text-align: right; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                        .total-final { font-size: 18px; font-weight: bold; background: #f5f5f5; padding: 12px 16px; border-radius: 6px; margin-top: 8px; }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Global functions for onclick handlers
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(`${tab}-form`).classList.remove('hidden');
};
