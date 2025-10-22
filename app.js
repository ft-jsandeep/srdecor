// Enhanced Bill Generator App with all new features
import { AuthManager } from './auth-manager.js';
import { BillManager } from './bill-manager.js';
import { UIUtils } from './ui-utils.js';
import { BillTemplates } from './bill-templates.js';

export class BillGeneratorApp {
    constructor() {
        console.log('BillGeneratorApp constructor called');
        this.authManager = new AuthManager();
        this.billManager = new BillManager();
        this.currentView = 'generator';
        this.selectedTemplate = 'est-rt';
        this.billType = 'invoice';
        this.roundingAmount = 0;
        this.editingBillId = null; // Track if we're editing an existing bill
        this.editingItemId = null; // Track if we're editing an existing item
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        console.log('Initializing app...');
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.setCurrentDate();
        this.initializeCalculations();
        this.loadBusinessSettings();
        console.log('App initialized successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Wait a bit for elements to be available
        setTimeout(() => {
            console.log('Setting up event listeners...');
            // Business settings button
            const businessSettingsBtn = document.getElementById('business-settings-btn');
            if (businessSettingsBtn) {
                businessSettingsBtn.addEventListener('click', () => this.showBusinessSettings());
            }
            
            // Business settings form
            const businessSettingsForm = document.getElementById('business-settings-form');
            if (businessSettingsForm) {
                businessSettingsForm.addEventListener('submit', (e) => this.handleBusinessSettingsSubmit(e));
            }
            
            // Clear business info button
            const clearBusinessInfoBtn = document.getElementById('clear-business-info-btn');
            if (clearBusinessInfoBtn) {
                clearBusinessInfoBtn.addEventListener('click', () => this.clearBusinessInfo());
            }
            
            // Bill type change
            const billTypeSelect = document.getElementById('bill-type');
            if (billTypeSelect) {
                billTypeSelect.addEventListener('change', (e) => this.handleBillTypeChange(e));
            }
            
            // State change listeners for tax calculation
            const businessStateSelect = document.getElementById('business-state');
            const customerStateSelect = document.getElementById('customer-state');
            if (businessStateSelect) {
                businessStateSelect.addEventListener('change', () => this.updateTaxFields());
            }
            if (customerStateSelect) {
                customerStateSelect.addEventListener('change', () => this.updateTaxFields());
            }
            
            // Preview button
            const previewBtn = document.getElementById('preview-bill-btn');
            if (previewBtn) {
                previewBtn.addEventListener('click', (e) => {
                    console.log('Preview button clicked!');
                    e.preventDefault();
                    this.previewBill();
                });
            }
            
            // Other event listeners
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const logoutBtn = document.getElementById('logout-btn');
            const googleSignInBtn = document.getElementById('google-signin-btn');
            const googleSignInBtnRegister = document.getElementById('google-signin-btn-register');
            const newBillBtn = document.getElementById('new-bill-btn');
            const viewBillsBtn = document.getElementById('view-bills-btn');
            const warehouseBtn = document.getElementById('warehouse-btn');
            const backToGenerator = document.getElementById('back-to-generator');
            const backToGeneratorWarehouse = document.getElementById('back-to-generator-warehouse');
            const billForm = document.getElementById('bill-form');
            const addItemBtn = document.getElementById('add-item-btn');
            const templateSelect = document.getElementById('template-select');
            const itemsContainer = document.getElementById('items-container');
            const searchBills = document.getElementById('search-bills');
            const printBillBtn = document.getElementById('print-bill-btn');
            const billDateInput = document.getElementById('bill-date');
            
            // Warehouse event listeners
            const addItemBtnWarehouse = document.getElementById('add-item-btn-warehouse');
            const itemForm = document.getElementById('item-form');
            const itemUnit = document.getElementById('item-unit');
            const searchItems = document.getElementById('search-items');
            
            if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            if (registerForm) registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
            if (googleSignInBtn) googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
            if (googleSignInBtnRegister) googleSignInBtnRegister.addEventListener('click', () => this.handleGoogleSignIn());
            if (newBillBtn) newBillBtn.addEventListener('click', () => this.showBillGenerator());
            if (viewBillsBtn) viewBillsBtn.addEventListener('click', () => this.showBillsList());
            if (warehouseBtn) {
                console.log('Warehouse button found, adding event listener');
                warehouseBtn.addEventListener('click', () => this.showWarehouse());
            } else {
                console.error('Warehouse button not found!');
            }
            if (backToGenerator) backToGenerator.addEventListener('click', () => this.showBillGenerator());
            if (backToGeneratorWarehouse) backToGeneratorWarehouse.addEventListener('click', () => this.showBillGenerator());
            if (billForm) billForm.addEventListener('submit', (e) => this.handleBillSubmit(e));
            if (addItemBtn) addItemBtn.addEventListener('click', () => this.addItemRow());
            if (templateSelect) templateSelect.addEventListener('change', (e) => this.changeTemplate(e));
            if (itemsContainer) {
                itemsContainer.addEventListener('input', (e) => {
                    if (e.target.classList.contains('item-name')) {
                        this.handleItemNameInput(e);
                    }
                    this.calculateItemAmount(e);
                });
                itemsContainer.addEventListener('change', (e) => this.handleUnitChange(e));
                itemsContainer.addEventListener('click', (e) => this.handleItemActions(e));
            }
            if (searchBills) searchBills.addEventListener('input', () => this.filterBills());
            if (printBillBtn) printBillBtn.addEventListener('click', () => this.printBill());
            if (billDateInput) billDateInput.addEventListener('change', () => this.updateBillNumber());
            
            // Warehouse event listeners
            if (addItemBtnWarehouse) addItemBtnWarehouse.addEventListener('click', () => this.showAddItemModal());
            if (itemForm) itemForm.addEventListener('submit', (e) => this.handleItemSubmit(e));
            if (itemUnit) itemUnit.addEventListener('change', (e) => this.handleItemUnitChange(e));
            if (searchItems) searchItems.addEventListener('input', () => this.filterItems());
            
            // Modal
            document.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => this.closeModal());
            });
            
            const billPreviewModal = document.getElementById('bill-preview-modal');
            if (billPreviewModal) {
                billPreviewModal.addEventListener('click', (e) => {
                    if (e.target === billPreviewModal) {
                        this.closeModal();
                    }
                });
            }
            
            console.log('Event listeners set up');
        }, 500);
    }

    setupAuthStateListener() {
        this.authManager.onAuthStateChange((user) => {
            if (user) {
                this.billManager.setCurrentUser(user);
                this.showMainApp();
                this.loadBills();
                // Load master data for autocomplete
                this.loadMasterData();
            } else {
                this.showAuthSection();
            }
        });
        
        this.authManager.init();
    }

    setCurrentDate() {
        const dateInput = document.getElementById('bill-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    initializeCalculations() {
        this.calculateTotals();
    }

    // State comparison helper function
    isSameState(businessState, customerState) {
        if (!businessState || !customerState) return false;
        
        // Extract state codes from the state strings (e.g., "Haryana (06)" -> "06")
        const businessStateCode = businessState.match(/\((\d+)\)/)?.[1];
        const customerStateCode = customerState.match(/\((\d+)\)/)?.[1];
        
        return businessStateCode === customerStateCode;
    }

    // Update tax fields based on state selection
    updateTaxFields() {
        const businessState = document.getElementById('business-state')?.value || '';
        const customerState = document.getElementById('customer-state')?.value || '';
        const isSameState = this.isSameState(businessState, customerState);
        
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            const cgstGroup = row.querySelector('.item-cgst').parentElement;
            const sgstGroup = row.querySelector('.item-sgst').parentElement;
            const igstGroup = row.querySelector('.item-igst').parentElement;
            
            if (isSameState) {
                // Same state: Show CGST + SGST, hide IGST
                cgstGroup.classList.remove('hidden');
                sgstGroup.classList.remove('hidden');
                igstGroup.classList.add('hidden');
                
                // Set IGST to 0 and calculate as sum of CGST + SGST
                const cgst = parseFloat(row.querySelector('.item-cgst').value) || 0;
                const sgst = parseFloat(row.querySelector('.item-sgst').value) || 0;
                row.querySelector('.item-igst').value = (cgst + sgst).toFixed(2);
            } else {
                // Different state: Hide CGST + SGST, show IGST
                cgstGroup.classList.add('hidden');
                sgstGroup.classList.add('hidden');
                igstGroup.classList.remove('hidden');
                
                // Set IGST to sum of CGST + SGST if not already set
                const igst = parseFloat(row.querySelector('.item-igst').value) || 0;
                if (igst === 0) {
                    const cgst = parseFloat(row.querySelector('.item-cgst').value) || 0;
                    const sgst = parseFloat(row.querySelector('.item-sgst').value) || 0;
                    row.querySelector('.item-igst').value = (cgst + sgst).toFixed(2);
                }
            }
        });
        
        // Recalculate all items
        this.recalculateAllItems();
    }

    // Recalculate all items when state changes
    recalculateAllItems() {
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            // Trigger calculation for each item
            const quantityInput = row.querySelector('.item-quantity');
            if (quantityInput) {
                quantityInput.dispatchEvent(new Event('input'));
            }
        });
    }

    // Business Settings Management
    loadBusinessSettings() {
        const settings = localStorage.getItem('businessSettings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            this.populateBusinessSettings(parsedSettings);
            this.prefillBusinessInfo(parsedSettings);
        }
    }

    saveBusinessSettings(settings) {
        localStorage.setItem('businessSettings', JSON.stringify(settings));
    }

    populateBusinessSettings(settings) {
        const fields = [
            'default-business-name', 'default-business-email', 'default-business-phone',
            'default-business-gstin', 'default-business-pan', 'default-business-state', 'default-business-address', 'default-bank-name',
            'default-account-number', 'default-account-holder-name', 'default-ifsc-code', 'default-branch', 'default-terms'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && settings[fieldId]) {
                element.value = settings[fieldId];
            }
        });
    }

    prefillBusinessInfo(settings) {
        // Map default settings to bill form fields
        const fieldMapping = {
            'default-business-name': 'business-name',
            'default-business-email': 'business-email',
            'default-business-phone': 'business-phone',
            'default-business-gstin': 'business-gstin',
            'default-business-pan': 'business-pan',
            'default-business-state': 'business-state',
            'default-business-address': 'business-address',
            'default-bank-name': 'bank-name',
            'default-account-number': 'account-number',
            'default-account-holder-name': 'account-holder-name',
            'default-ifsc-code': 'ifsc-code',
            'default-branch': 'branch',
            'default-terms': 'terms-conditions'
        };
        
        Object.entries(fieldMapping).forEach(([defaultField, billField]) => {
            const billElement = document.getElementById(billField);
            if (billElement && settings[defaultField]) {
                billElement.value = settings[defaultField];
            }
        });
    }

    clearBusinessInfo() {
        const businessFields = [
            'business-name', 'business-email', 'business-phone', 'business-gstin', 
            'business-pan', 'business-state', 'business-address', 'bank-name', 'account-number', 
            'account-holder-name', 'ifsc-code', 'branch', 'terms-conditions'
        ];
        
        businessFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = '';
            }
        });
        
        this.showMessage('Business information cleared', 'success');
    }

    showBusinessSettings() {
        const modal = document.getElementById('business-settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeBusinessSettings() {
        const modal = document.getElementById('business-settings-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    handleBusinessSettingsSubmit(e) {
        e.preventDefault();
        
        const settings = {
            'default-business-name': document.getElementById('default-business-name')?.value || '',
            'default-business-email': document.getElementById('default-business-email')?.value || '',
            'default-business-phone': document.getElementById('default-business-phone')?.value || '',
            'default-business-gstin': document.getElementById('default-business-gstin')?.value || '',
            'default-business-pan': document.getElementById('default-business-pan')?.value || '',
            'default-business-state': document.getElementById('default-business-state')?.value || '',
            'default-business-address': document.getElementById('default-business-address')?.value || '',
            'default-bank-name': document.getElementById('default-bank-name')?.value || '',
            'default-account-number': document.getElementById('default-account-number')?.value || '',
            'default-account-holder-name': document.getElementById('default-account-holder-name')?.value || '',
            'default-ifsc-code': document.getElementById('default-ifsc-code')?.value || '',
            'default-branch': document.getElementById('default-branch')?.value || '',
            'default-terms': document.getElementById('default-terms')?.value || ''
        };
        
        this.saveBusinessSettings(settings);
        this.prefillBusinessInfo(settings);
        this.showMessage('Business settings saved successfully!', 'success');
        this.closeBusinessSettings();
    }

    handleBillTypeChange(e) {
        this.billType = e.target.value;
        this.updateBillNumber();
    }

    updateBillNumber() {
        const billNumberInput = document.getElementById('bill-number');
        if (!billNumberInput) return;

        // Compute financial year string from selected bill date
        const billDateEl = document.getElementById('bill-date');
        const dateStr = billDateEl?.value || new Date().toISOString().split('T')[0];
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = d.getMonth(); // 0-based
        const fyStartYear = month >= 3 ? year : year - 1; // FY begins in April
        const fyEndYearShort = (fyStartYear + 1).toString().slice(-2);
        const fyString = `${fyStartYear}-${fyEndYearShort}`;

        const prefix = 'SR';
        const bills = this.billManager.getBills() || [];
        // Find existing numbers for this FY and extract numeric sequence
        let maxSeq = 0;
        bills.forEach(b => {
            const num = b.billNumber || '';
            const parts = num.split('/');
            if (parts.length === 3 && parts[0] === prefix && parts[1] === fyString) {
                const seq = parseInt(parts[2], 10);
                if (!isNaN(seq)) {
                    maxSeq = Math.max(maxSeq, seq);
                }
            }
        });
        const nextSeq = (maxSeq || 0) + 1;
        billNumberInput.value = `${prefix}/${fyString}/${nextSeq}`;
    }

    changeTemplate(e) {
        this.selectedTemplate = e.target.value;
    }

    // Authentication handlers
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await this.authManager.signIn(email, password);
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        try {
            await this.authManager.signUp(email, password);
            this.showMessage('Registration successful!', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleLogout() {
        try {
            await this.authManager.signOut();
            this.showMessage('Logged out successfully', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleGoogleSignIn() {
        try {
            await this.authManager.signInWithGoogle();
            this.showMessage('Google sign-in successful!', 'success');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    // UI Navigation
    showAuthSection() {
        const mainApp = document.getElementById('main-app');
        const authSection = document.getElementById('auth-section');
        if (mainApp) mainApp.classList.add('hidden');
        if (authSection) authSection.classList.remove('hidden');
    }

    showMainApp() {
        const mainApp = document.getElementById('main-app');
        const authSection = document.getElementById('auth-section');
        if (mainApp) mainApp.classList.remove('hidden');
        if (authSection) authSection.classList.add('hidden');
        
        // Ensure warehouse button has event listener
        this.ensureWarehouseButtonSetup();
        
        // Show bill generator by default
        this.showBillGenerator();
    }

    ensureWarehouseButtonSetup() {
        const warehouseBtn = document.getElementById('warehouse-btn');
        if (warehouseBtn && !warehouseBtn.hasAttribute('data-listener-added')) {
            console.log('Setting up warehouse button event listener');
            warehouseBtn.addEventListener('click', () => this.showWarehouse());
            warehouseBtn.setAttribute('data-listener-added', 'true');
        }
    }

    showBillGenerator() {
        const billsList = document.getElementById('bills-list');
        const billGenerator = document.getElementById('bill-generator');
        const warehouseSection = document.getElementById('warehouse-section');
        if (billsList) billsList.classList.add('hidden');
        if (billGenerator) billGenerator.classList.remove('hidden');
        if (warehouseSection) warehouseSection.classList.add('hidden');
        this.currentView = 'generator';
        
        // Only populate default business info if we're not editing
        if (!this.editingBillId) {
            this.populateDefaultBusinessInfo();
            
            // Ensure there's at least one item row
            const itemsContainer = document.getElementById('items-container');
            if (itemsContainer && itemsContainer.children.length === 0) {
                this.addItemRow();
            }

            // Prefill next bill number
            this.updateBillNumber();
        }
    }

    showBillsList() {
        const billsList = document.getElementById('bills-list');
        const billGenerator = document.getElementById('bill-generator');
        const warehouseSection = document.getElementById('warehouse-section');
        if (billsList) billsList.classList.remove('hidden');
        if (billGenerator) billGenerator.classList.add('hidden');
        if (warehouseSection) warehouseSection.classList.add('hidden');
        this.currentView = 'bills';
        // Load and display bills when showing the bills list
        this.loadBills();
    }

    showWarehouse() {
        console.log('showWarehouse called');
        const billsList = document.getElementById('bills-list');
        const billGenerator = document.getElementById('bill-generator');
        const warehouseSection = document.getElementById('warehouse-section');
        if (billsList) billsList.classList.add('hidden');
        if (billGenerator) billGenerator.classList.add('hidden');
        if (warehouseSection) warehouseSection.classList.remove('hidden');
        this.currentView = 'warehouse';
        // Load and display items when showing the warehouse
        this.loadWarehouseItems();
    }

    populateDefaultBusinessInfo() {
        const settings = localStorage.getItem('businessSettings');
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            
            const businessName = document.getElementById('business-name');
            const businessEmail = document.getElementById('business-email');
            const businessPhone = document.getElementById('business-phone');
            const businessGstin = document.getElementById('business-gstin');
            const businessAddress = document.getElementById('business-address');
            const businessState = document.getElementById('business-state');
            
            if (businessName && parsedSettings['default-business-name']) businessName.value = parsedSettings['default-business-name'];
            if (businessEmail && parsedSettings['default-business-email']) businessEmail.value = parsedSettings['default-business-email'];
            if (businessPhone && parsedSettings['default-business-phone']) businessPhone.value = parsedSettings['default-business-phone'];
            if (businessGstin && parsedSettings['default-business-gstin']) businessGstin.value = parsedSettings['default-business-gstin'];
            
            const businessPan = document.getElementById('business-pan');
            if (businessPan && parsedSettings['default-business-pan']) businessPan.value = parsedSettings['default-business-pan'];
            if (businessState && parsedSettings['default-business-state']) businessState.value = parsedSettings['default-business-state'];
            if (businessAddress && parsedSettings['default-business-address']) businessAddress.value = parsedSettings['default-business-address'];
            
            // Populate bank details if available
            const bankName = document.getElementById('bank-name');
            const accountNumber = document.getElementById('account-number');
            const ifscCode = document.getElementById('ifsc-code');
            const branch = document.getElementById('branch');
            
            if (bankName && parsedSettings['default-bank-name']) bankName.value = parsedSettings['default-bank-name'];
            if (accountNumber && parsedSettings['default-account-number']) accountNumber.value = parsedSettings['default-account-number'];
            
            const accountHolderName = document.getElementById('account-holder-name');
            if (accountHolderName && parsedSettings['default-account-holder-name']) accountHolderName.value = parsedSettings['default-account-holder-name'];
            if (ifscCode && parsedSettings['default-ifsc-code']) ifscCode.value = parsedSettings['default-ifsc-code'];
            if (branch && parsedSettings['default-branch']) branch.value = parsedSettings['default-branch'];
            
            // Populate terms if available
            const terms = document.getElementById('terms-conditions');
            if (terms && parsedSettings['default-terms']) terms.value = parsedSettings['default-terms'];
            
            // Update tax fields after populating business info
            this.updateTaxFields();
        }
    }

    // Bill form handlers
    addItemRow() {
        const itemsContainer = document.getElementById('items-container');
        if (!itemsContainer) return;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'item-row';
        itemRow.innerHTML = `
            <div class="form-group item-name-group">
                <label>Item Name</label>
                <input type="text" class="item-name" list="items-datalist" required>
                <datalist id="items-datalist"></datalist>
            </div>
            <div class="form-group item-description-group">
                <label>Description</label>
                <input type="text" class="item-description">
            </div>
            <div class="item-fields-grid">
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="item-quantity" min="0" step="0.01" value="1" required>
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
                        <option value="sqm">Square Meters</option>
                        <option value="sqft">Sq. Ft.</option>
                        <option value="custom">Custom</option>
                    </select>
                    <input type="text" class="item-custom-unit hidden" placeholder="Enter custom unit">
                </div>
                <div class="form-group">
                    <label>Rate (per unit)</label>
                    <input type="number" class="item-rate" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label>Discount %</label>
                    <input type="number" class="item-discount" min="0" max="100" step="0.01" value="0">
                </div>
                <div class="form-group">
                    <label class="tax-label-cgst">CGST %</label>
                    <input type="number" class="item-cgst" min="0" max="100" step="0.01" value="9">
                </div>
                <div class="form-group">
                    <label class="tax-label-sgst">SGST %</label>
                    <input type="number" class="item-sgst" min="0" max="100" step="0.01" value="9">
                </div>
                <div class="form-group hidden">
                    <label class="tax-label-igst">IGST %</label>
                    <input type="number" class="item-igst" min="0" max="100" step="0.01" value="18">
                </div>
                <div class="form-group">
                    <label>HSN/SAC Code</label>
                    <input type="text" class="item-hsn" placeholder="e.g., 44219990" required>
                </div>
                <div class="form-group">
                    <label>Amount</label>
                    <input type="number" class="item-amount" readonly>
                </div>
            </div>
            <div class="item-actions">
                <div class="item-amount-display">
                    <div>
                        <div>Amount</div>
                        <span class="amount-value">0.00</span>
                    </div>
                    <div>
                        <div>Tax</div>
                        <span class="tax-value">0.00</span>
                    </div>
                    <div>
                        <div>Total</div>
                        <span class="total-value">0.00</span>
                    </div>
                </div>
                <button type="button" class="btn btn-danger btn-sm remove-item">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        `;
        
        itemsContainer.appendChild(itemRow);
    }

    handleUnitChange(e) {
        if (e.target.classList.contains('item-unit')) {
            const customUnitInput = e.target.parentElement.querySelector('.item-custom-unit');
            if (e.target.value === 'custom') {
                customUnitInput.classList.remove('hidden');
                customUnitInput.required = true;
            } else {
                customUnitInput.classList.add('hidden');
                customUnitInput.required = false;
            }
        }
    }

    calculateItemAmount(e) {
        if (e.target.classList.contains('item-quantity') || 
            e.target.classList.contains('item-rate') || 
            e.target.classList.contains('item-discount') ||
            e.target.classList.contains('item-cgst') ||
            e.target.classList.contains('item-sgst') ||
            e.target.classList.contains('item-igst')) {
            
            const itemRow = e.target.closest('.item-row');
            const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
            const rate = parseFloat(itemRow.querySelector('.item-rate').value) || 0;
            const discount = parseFloat(itemRow.querySelector('.item-discount').value) || 0;
            
            // Calculate subtotal
            const subtotal = quantity * rate;
            
            // Calculate discount amount
            const discountAmount = (subtotal * discount) / 100;
            
            // Calculate amount after discount
            const amountAfterDiscount = subtotal - discountAmount;
            
            // Determine tax type based on state comparison
            const businessState = document.getElementById('business-state')?.value || '';
            const customerState = document.getElementById('customer-state')?.value || '';
            const isSameState = this.isSameState(businessState, customerState);
            
            let totalTax = 0;
            
            if (isSameState) {
                // Same state: Use CGST + SGST
                const cgst = parseFloat(itemRow.querySelector('.item-cgst').value) || 0;
                const sgst = parseFloat(itemRow.querySelector('.item-sgst').value) || 0;
                const cgstAmount = (amountAfterDiscount * cgst) / 100;
                const sgstAmount = (amountAfterDiscount * sgst) / 100;
                totalTax = cgstAmount + sgstAmount;
            } else {
                // Different state: Use IGST
                const igst = parseFloat(itemRow.querySelector('.item-igst').value) || 0;
                totalTax = (amountAfterDiscount * igst) / 100;
            }
            
            // Calculate final total
            const finalAmount = amountAfterDiscount + totalTax;
            
            // Update the display
            itemRow.querySelector('.item-amount').value = amountAfterDiscount.toFixed(2);
            itemRow.querySelector('.amount-value').textContent = amountAfterDiscount.toFixed(2);
            itemRow.querySelector('.tax-value').textContent = totalTax.toFixed(2);
            itemRow.querySelector('.total-value').textContent = finalAmount.toFixed(2);
            
            this.calculateTotals();
        }
    }

    handleItemActions(e) {
        if (e.target.closest('.remove-item')) {
            const itemRow = e.target.closest('.item-row');
            const itemsContainer = document.getElementById('items-container');
            if (itemsContainer.children.length > 1) {
                itemRow.remove();
                this.calculateTotals();
            } else {
                this.showMessage('At least one item is required', 'error');
            }
        }
    }

    calculateTotals() {
        let subtotal = 0;
        let totalTax = 0;
        let grandTotal = 0;
        
        const itemRows = document.querySelectorAll('.item-row');
        
        itemRows.forEach(row => {
            const amount = parseFloat(row.querySelector('.item-amount').value) || 0;
            const taxValue = parseFloat(row.querySelector('.tax-value').textContent) || 0;
            const totalValue = parseFloat(row.querySelector('.total-value').textContent) || 0;
            
            subtotal += amount;
            totalTax += taxValue;
            grandTotal += totalValue;
        });
        
        // Round off the grand total to nearest integer
        const roundedTotal = Math.round(grandTotal);
        const roundingAmount = roundedTotal - grandTotal;
        
        console.log('calculateTotals - grandTotal:', grandTotal, 'roundedTotal:', roundedTotal, 'roundingAmount:', roundingAmount);
        
        // Update the totals display
        const subtotalEl = document.getElementById('subtotal');
        const totalTaxEl = document.getElementById('total-tax-amount');
        const totalAmountEl = document.getElementById('total-amount');
        const roundingEl = document.getElementById('rounding-amount');
        
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (totalTaxEl) totalTaxEl.textContent = `₹${totalTax.toFixed(2)}`;
        if (roundingEl) roundingEl.textContent = `₹${roundingAmount.toFixed(2)}`;
        if (totalAmountEl) totalAmountEl.textContent = `₹${roundedTotal.toFixed(2)}`;
        
        // Store rounding amount for use in templates (round to 2 decimal places to avoid floating point issues)
        this.roundingAmount = Math.round(roundingAmount * 100) / 100;
        console.log('Stored roundingAmount:', this.roundingAmount);
    }

    async handleBillSubmit(e) {
        e.preventDefault();
        
        try {
            // Ensure totals are calculated before collecting data
            this.calculateTotals();
            const billData = this.collectBillData();
            // Validate HSN presence for each item
            const missingHsn = billData.items.find(it => !it.hsn || !it.hsn.trim());
            if (missingHsn) {
                this.showMessage('HSN code is required for all items', 'error');
                return;
            }
            
            if (this.editingBillId) {
                // Update existing bill
                await this.billManager.updateBill(this.editingBillId, billData);
                this.showMessage('Bill updated successfully!', 'success');
                this.editingBillId = null; // Clear editing state
            } else {
                // Create new bill
                await this.billManager.saveBill(billData);
                this.showMessage('Bill saved successfully!', 'success');
            }
            
            // Upsert master data for items and customer (best-effort)
            this.upsertMasterDataFromBill(billData);

            this.resetBillForm();
            this.loadBills();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    collectBillData() {
        const businessInfo = {
            name: document.getElementById('business-name')?.value || '',
            email: document.getElementById('business-email')?.value || '',
            phone: document.getElementById('business-phone')?.value || '',
            address: document.getElementById('business-address')?.value || '',
            gstin: document.getElementById('business-gstin')?.value || '',
            pan: document.getElementById('business-pan')?.value || '',
            state: document.getElementById('business-state')?.value || '',
        };
        
        const customerInfo = {
            name: document.getElementById('customer-name')?.value || '',
            email: document.getElementById('customer-email')?.value || '',
            phone: document.getElementById('customer-phone')?.value || '',
            address: document.getElementById('customer-address')?.value || '',
            city: document.getElementById('customer-city')?.value || '',
            state: document.getElementById('customer-state')?.value || '',
            pincode: document.getElementById('customer-pincode')?.value || '',
            gstin: document.getElementById('customer-gstin')?.value || ''
        };
        
        const bankDetails = {
            accountHolderName: document.getElementById('account-holder-name')?.value || '',
            bankName: document.getElementById('bank-name')?.value || '',
            accountNumber: document.getElementById('account-number')?.value || '',
            ifscCode: document.getElementById('ifsc-code')?.value || '',
            branch: document.getElementById('branch')?.value || ''
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
                discount: parseFloat(row.querySelector('.item-discount').value) || 0,
                cgst: parseFloat(row.querySelector('.item-cgst').value) || 0,
                sgst: parseFloat(row.querySelector('.item-sgst').value) || 0,
                igst: parseFloat(row.querySelector('.item-igst').value) || 0,
                hsn: row.querySelector('.item-hsn').value,
                amount: parseFloat(row.querySelector('.item-amount').value),
                taxAmount: parseFloat(row.querySelector('.tax-value').textContent) || 0,
                totalAmount: parseFloat(row.querySelector('.total-value').textContent) || 0
            });
        });
        
        const subtotalEl = document.getElementById('subtotal');
        const totalTaxEl = document.getElementById('total-tax-amount');
        const totalAmountEl = document.getElementById('total-amount');
        
        const subtotal = subtotalEl ? parseFloat(subtotalEl.textContent.replace('₹', '')) : 0;
        const totalTax = totalTaxEl ? parseFloat(totalTaxEl.textContent.replace('₹', '')) : 0;
        const total = totalAmountEl ? parseFloat(totalAmountEl.textContent.replace('₹', '')) : 0;
        
        console.log('Collecting bill data - roundingAmount:', this.roundingAmount);
        console.log('Collecting bill data - subtotal:', subtotal, 'totalTax:', totalTax, 'total:', total);
        
        const billData = {
            billType: this.billType,
            billNumber: document.getElementById('bill-number')?.value || '',
            businessInfo,
            customerInfo,
            bankDetails,
            items,
            billDate: document.getElementById('bill-date')?.value || new Date().toISOString().split('T')[0],
            termsConditions: document.getElementById('terms-conditions')?.value || '',
            subtotal,
            taxAmount: totalTax,
            total,
            roundingAmount: this.roundingAmount !== undefined ? this.roundingAmount : 0,
            template: this.selectedTemplate
        };
        
        console.log('Final bill data being returned:', billData);
        return billData;
    }

    async upsertMasterDataFromBill(billData) {
        try {
            // Save customer if new
            const existingCustomer = this.billManager.findCustomerByName(billData.customerInfo.name);
            if (!existingCustomer && billData.customerInfo.name) {
                await this.billManager.saveCustomer(billData.customerInfo);
            }

            // Save items if new
            for (const it of billData.items) {
                if (!it.name) continue;
                const existingItem = this.billManager.findItemByName(it.name);
                if (!existingItem) {
                    await this.billManager.saveItem({
                        name: it.name,
                        hsn: it.hsn,
                        defaultRate: it.rate,
                        defaultUnit: it.unit
                    });
                }
            }

            // Refresh lists
            await this.loadMasterData();
        } catch (err) {
            console.warn('Failed to upsert master data', err);
        }
    }

    resetBillForm() {
        const billForm = document.getElementById('bill-form');
        const billDate = document.getElementById('bill-date');
        const itemsContainer = document.getElementById('items-container');
        const billNumber = document.getElementById('bill-number');
        
        if (billForm) billForm.reset();
        if (billDate) billDate.value = new Date().toISOString().split('T')[0];
        if (billNumber) billNumber.value = '';
        
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            this.addItemRow();
        }
        
        // Clear editing state
        this.editingBillId = null;
        
        // Reset form title
        const formTitle = document.querySelector('#bill-generator h2');
        if (formTitle) {
            formTitle.textContent = 'Create New Bill';
        }
        
        this.updateBillNumber();
        this.populateDefaultBusinessInfo();
        this.calculateTotals();
    }

    // Bills management
    async loadMasterData() {
        try {
            await Promise.all([
                this.billManager.loadItems(),
                this.billManager.loadCustomers()
            ]);
            this.populateDatalists();
        } catch (err) {
            console.error('Failed to load master data', err);
        }
    }

    populateDatalists() {
        // Items datalist
        const itemsDatalist = document.getElementById('items-datalist');
        if (itemsDatalist) {
            itemsDatalist.innerHTML = '';
            this.billManager.getItems().forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.name;
                opt.label = item.hsn ? `${item.name} — HSN ${item.hsn}` : item.name;
                itemsDatalist.appendChild(opt);
            });
        }

        // Customers datalist
        const customersDatalist = document.getElementById('customers-datalist');
        if (customersDatalist) {
            customersDatalist.innerHTML = '';
            this.billManager.getCustomers().forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                customersDatalist.appendChild(opt);
            });
        }
    }

    handleItemNameInput(e) {
        const input = e.target;
        const row = input.closest('.item-row');
        const item = this.billManager.findItemByName(input.value);
        if (item && row) {
            const rateEl = row.querySelector('.item-rate');
            const unitSel = row.querySelector('.item-unit');
            const customUnitEl = row.querySelector('.item-custom-unit');
            const hsnEl = row.querySelector('.item-hsn');
            if (rateEl) rateEl.value = item.defaultRate || 0;
            if (unitSel) {
                const unit = item.defaultUnit || 'pcs';
                if ([
                    'pcs','kg','g','l','ml','m','cm','ft','hrs','days','sqm','sqft'
                ].includes(unit)) {
                    unitSel.value = unit;
                    if (customUnitEl) {
                        customUnitEl.classList.add('hidden');
                        customUnitEl.required = false;
                        customUnitEl.value = '';
                    }
                } else {
                    unitSel.value = 'custom';
                    if (customUnitEl) {
                        customUnitEl.classList.remove('hidden');
                        customUnitEl.required = true;
                        customUnitEl.value = unit;
                    }
                }
            }
            if (hsnEl) hsnEl.value = item.hsn || '';
        }
    }
    async loadBills() {
        try {
            console.log('Loading bills...');
            console.log('Current user:', this.billManager.getCurrentUser());
            const bills = await this.billManager.loadBills();
            console.log('Loaded bills:', bills);
            this.displayBills();
            // Refresh bill number suggestion once bills are loaded
            if (!this.editingBillId) {
                this.updateBillNumber();
            }
        } catch (error) {
            console.error('Error loading bills:', error);
            this.showMessage(error.message, 'error');
        }
    }

    displayBills() {
        const billsContainer = document.getElementById('bills-container');
        if (!billsContainer) {
            console.error('Bills container not found!');
            return;
        }
        
        const bills = this.billManager.getBills();
        console.log('Displaying bills:', bills);
        
        billsContainer.innerHTML = '';
        
        if (bills.length === 0) {
            console.log('No bills found, showing empty message');
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
                        <p>${bill.billType === 'estimate' ? 'Estimate' : 'Invoice'} - ${this.formatDate(bill.billDate)}</p>
                    </div>
                    <div class="bill-amount">₹${bill.total.toFixed(2)}</div>
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
                        <label>Total Tax</label>
                        <span>₹${bill.taxAmount.toFixed(2)}</span>
                    </div>
                    <div class="bill-detail">
                        <label>Created</label>
                        <span>${this.formatDate(bill.createdAt)}</span>
                    </div>
                </div>
                <div class="bill-actions">
                    <button class="btn btn-secondary btn-sm view-bill-btn" data-bill-id="${bill.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary btn-sm edit-bill-btn" data-bill-id="${bill.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-bill-btn" data-bill-id="${bill.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            billsContainer.appendChild(billCard);
        });
        
        // Add event listeners to the new buttons
        this.setupBillActionListeners();
    }

    setupBillActionListeners() {
        // View buttons
        document.querySelectorAll('.view-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.closest('.view-bill-btn').dataset.billId;
                this.viewBill(billId);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.closest('.edit-bill-btn').dataset.billId;
                this.editBill(billId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-bill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const billId = e.target.closest('.delete-bill-btn').dataset.billId;
                this.deleteBill(billId);
            });
        });
    }

    filterBills() {
        const searchTerm = document.getElementById('search-bills')?.value || '';
        const filteredBills = this.billManager.searchBills(searchTerm);
        
        const billsContainer = document.getElementById('bills-container');
        if (!billsContainer) return;
        
        const billCards = billsContainer.querySelectorAll('.bill-card');
        
        billCards.forEach((card, index) => {
            if (index < filteredBills.length) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    viewBill(billId) {
        console.log('viewBill called with ID:', billId);
        const bill = this.billManager.findBillById(billId);
        if (bill) {
            console.log('Bill found:', bill);
            // Validate and fix bill data before preview
            const validatedBill = this.validateBillData(bill);
            this.generateBillPreview(validatedBill);
            const modal = document.getElementById('bill-preview-modal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('Modal should be visible now');
            } else {
                console.error('Modal not found!');
            }
        } else {
            console.error('Bill not found with ID:', billId);
            this.showMessage('Bill not found', 'error');
        }
    }

    // New function to validate and fix bill data
    validateBillData(bill) {
        console.log('Validating bill data:', bill);
        
        // Ensure businessInfo has all required fields
        if (!bill.businessInfo) {
            bill.businessInfo = {};
        }
        bill.businessInfo.name = bill.businessInfo.name || '';
        bill.businessInfo.email = bill.businessInfo.email || '';
        bill.businessInfo.phone = bill.businessInfo.phone || '';
        bill.businessInfo.address = bill.businessInfo.address || '';
        bill.businessInfo.gstin = bill.businessInfo.gstin || '';
        bill.businessInfo.pan = bill.businessInfo.pan || '';
        bill.businessInfo.state = bill.businessInfo.state || 'Haryana (06)';
        
        // Ensure customerInfo has all required fields
        if (!bill.customerInfo) {
            bill.customerInfo = {};
        }
        bill.customerInfo.name = bill.customerInfo.name || '';
        bill.customerInfo.email = bill.customerInfo.email || '';
        bill.customerInfo.phone = bill.customerInfo.phone || '';
        bill.customerInfo.address = bill.customerInfo.address || '';
        bill.customerInfo.city = bill.customerInfo.city || '';
        bill.customerInfo.state = bill.customerInfo.state || '';
        bill.customerInfo.pincode = bill.customerInfo.pincode || '';
        bill.customerInfo.gstin = bill.customerInfo.gstin || '';
        
        // Ensure bankDetails has all required fields
        if (!bill.bankDetails) {
            bill.bankDetails = {};
        }
        bill.bankDetails.bankName = bill.bankDetails.bankName || '';
        bill.bankDetails.accountNumber = bill.bankDetails.accountNumber || '';
        bill.bankDetails.accountHolderName = bill.bankDetails.accountHolderName || '';
        bill.bankDetails.ifscCode = bill.bankDetails.ifscCode || '';
        bill.bankDetails.branch = bill.bankDetails.branch || '';
        
        // Ensure items have all required fields
        if (!bill.items || !Array.isArray(bill.items)) {
            bill.items = [];
        }
        
        bill.items = bill.items.map(item => {
            return {
                name: item.name || '',
                description: item.description || '',
                quantity: parseFloat(item.quantity) || 1,
                unit: item.unit || 'pcs',
                rate: parseFloat(item.rate) || 0,
                discount: parseFloat(item.discount) || 0,
                cgst: parseFloat(item.cgst) || 9,
                sgst: parseFloat(item.sgst) || 9,
                igst: parseFloat(item.igst) || 18,
                hsn: item.hsn || '',
                amount: parseFloat(item.amount) || 0,
                taxAmount: parseFloat(item.taxAmount) || 0,
                totalAmount: parseFloat(item.totalAmount) || 0
            };
        });
        
        // Ensure totals are valid numbers
        bill.subtotal = parseFloat(bill.subtotal) || 0;
        bill.taxAmount = parseFloat(bill.taxAmount) || 0;
        bill.total = parseFloat(bill.total) || 0;
        bill.roundingAmount = parseFloat(bill.roundingAmount) || 0;
        bill.billDate = bill.billDate || new Date().toISOString().split('T')[0];
        bill.billNumber = bill.billNumber || '';
        bill.billType = bill.billType || 'estimate';
        bill.termsConditions = bill.termsConditions || '';
        bill.template = bill.template || 'est-rt';
        
        console.log('Validated bill data:', bill);
        return bill;
    }

    editBill(billId) {
        console.log('editBill called with ID:', billId);
        const bill = this.billManager.findBillById(billId);
        if (bill) {
            console.log('Bill found for editing:', bill);
            this.editingBillId = billId; // Set the editing bill ID
            const validatedBill = this.validateBillData(bill);
            this.populateBillForm(validatedBill);
            this.showBillGenerator();
            
            // Update the form title to indicate editing
            const formTitle = document.querySelector('#bill-generator h2');
            if (formTitle) {
                formTitle.textContent = `Edit ${bill.billType === 'estimate' ? 'Estimate' : 'Invoice'} - ${bill.billNumber}`;
            }
        } else {
            console.error('Bill not found with ID:', billId);
            this.showMessage('Bill not found', 'error');
        }
    }

    async deleteBill(billId) {
        console.log('deleteBill called with ID:', billId);
        if (confirm('Are you sure you want to delete this bill?')) {
            try {
                await this.billManager.deleteBill(billId);
                this.showMessage('Bill deleted successfully', 'success');
                this.loadBills();
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        }
    }

    populateBillForm(bill) {
        console.log('populateBillForm called with:', bill);
        
        // Populate bill type and number
        const billType = document.getElementById('bill-type');
        const billNumber = document.getElementById('bill-number');
        const billDate = document.getElementById('bill-date');
        
        if (billType) billType.value = bill.billType || 'estimate';
        if (billNumber) billNumber.value = bill.billNumber || '';
        if (billDate) billDate.value = bill.billDate;
        
        const placeOfSupply = document.getElementById('place-of-supply');
        if (placeOfSupply) placeOfSupply.value = bill.placeOfSupply || 'Haryana (06)';
        
        // Populate business info
        const businessName = document.getElementById('business-name');
        const businessEmail = document.getElementById('business-email');
        const businessPhone = document.getElementById('business-phone');
        const businessAddress = document.getElementById('business-address');
        const businessGstin = document.getElementById('business-gstin');
        const businessState = document.getElementById('business-state');
        
        if (businessName) businessName.value = bill.businessInfo.name;
        if (businessEmail) businessEmail.value = bill.businessInfo.email;
        if (businessPhone) businessPhone.value = bill.businessInfo.phone;
        if (businessAddress) businessAddress.value = bill.businessInfo.address;
        if (businessGstin) businessGstin.value = bill.businessInfo.gstin || '';
        if (businessState) businessState.value = bill.businessInfo.state || 'Haryana (06)';
        
        // Populate customer info
        const customerName = document.getElementById('customer-name');
        const customerEmail = document.getElementById('customer-email');
        const customerPhone = document.getElementById('customer-phone');
        const customerAddress = document.getElementById('customer-address');
        const customerCity = document.getElementById('customer-city');
        const customerState = document.getElementById('customer-state');
        const customerPincode = document.getElementById('customer-pincode');
        const customerGstin = document.getElementById('customer-gstin');
        
        if (customerName) customerName.value = bill.customerInfo.name;
        if (customerEmail) customerEmail.value = bill.customerInfo.email || '';
        if (customerPhone) customerPhone.value = bill.customerInfo.phone || '';
        if (customerAddress) customerAddress.value = bill.customerInfo.address || '';
        if (customerCity) customerCity.value = bill.customerInfo.city || '';
        if (customerState) customerState.value = bill.customerInfo.state || '';
        if (customerPincode) customerPincode.value = bill.customerInfo.pincode || '';
        if (customerGstin) customerGstin.value = bill.customerInfo.gstin || '';
        
        // Populate bank details
        const bankName = document.getElementById('bank-name');
        const accountNumber = document.getElementById('account-number');
        const ifscCode = document.getElementById('ifsc-code');
        const branch = document.getElementById('branch');
        
        if (bankName) bankName.value = bill.bankDetails.bankName || '';
        if (accountNumber) accountNumber.value = bill.bankDetails.accountNumber || '';
        
        const accountHolderName = document.getElementById('account-holder-name');
        if (accountHolderName) accountHolderName.value = bill.bankDetails.accountHolderName || '';
        if (ifscCode) ifscCode.value = bill.bankDetails.ifscCode || '';
        if (branch) branch.value = bill.bankDetails.branch || '';
        
        // Populate terms
        const terms = document.getElementById('terms-conditions');
        if (terms) terms.value = bill.termsConditions || '';
        
        // Set template if available
        const templateSelect = document.getElementById('template-select');
        if (templateSelect && bill.template) {
            templateSelect.value = bill.template;
            this.selectedTemplate = bill.template;
        }
        
        // Clear existing items
        const itemsContainer = document.getElementById('items-container');
        if (itemsContainer) {
            itemsContainer.innerHTML = '';
            
            // Add items
            bill.items.forEach((item, index) => {
                console.log(`Adding item ${index}:`, item);
                
                // Always add a row for each item
                this.addItemRow();
                
                const itemRows = document.querySelectorAll('.item-row');
                const currentRow = itemRows[itemRows.length - 1];
                
                if (!currentRow) {
                    console.error('No current row found for item:', index);
                    return;
                }
                
                // Safely populate item fields
                const nameField = currentRow.querySelector('.item-name');
                const descField = currentRow.querySelector('.item-description');
                const qtyField = currentRow.querySelector('.item-quantity');
                const rateField = currentRow.querySelector('.item-rate');
                const discountField = currentRow.querySelector('.item-discount');
                const cgstField = currentRow.querySelector('.item-cgst');
                const sgstField = currentRow.querySelector('.item-sgst');
                const igstField = currentRow.querySelector('.item-igst');
                const hsnField = currentRow.querySelector('.item-hsn');
                const amountField = currentRow.querySelector('.item-amount');
                const amountValue = currentRow.querySelector('.amount-value');
                const taxValue = currentRow.querySelector('.tax-value');
                const totalValue = currentRow.querySelector('.total-value');
                
                if (nameField) nameField.value = item.name || '';
                if (descField) descField.value = item.description || '';
                if (qtyField) qtyField.value = item.quantity || 1;
                if (rateField) rateField.value = item.rate || 0;
                if (discountField) discountField.value = item.discount || 0;
                if (cgstField) cgstField.value = item.cgst || 9;
                if (sgstField) sgstField.value = item.sgst || 9;
                if (igstField) igstField.value = item.igst || 18;
                if (hsnField) hsnField.value = item.hsn || '';
                if (amountField) amountField.value = item.amount || 0;
                if (amountValue) amountValue.textContent = (item.amount || 0).toFixed(2);
                if (taxValue) taxValue.textContent = (item.taxAmount || 0).toFixed(2);
                if (totalValue) totalValue.textContent = (item.totalAmount || 0).toFixed(2);
                
                // Handle unit selection
                const unitSelect = currentRow.querySelector('.item-unit');
                const customUnitInput = currentRow.querySelector('.item-custom-unit');
                
                if (unitSelect && customUnitInput) {
                    if (['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'ft', 'hrs', 'days', 'sqm', 'sqft'].includes(item.unit)) {
                        unitSelect.value = item.unit;
                        customUnitInput.classList.add('hidden');
                        customUnitInput.required = false;
                    } else {
                        unitSelect.value = 'custom';
                        customUnitInput.classList.remove('hidden');
                        customUnitInput.value = item.unit || '';
                        customUnitInput.required = true;
                    }
                }
            });
        }
        
        // Update tax fields based on state selection
        this.updateTaxFields();
        
        // Calculate totals
        this.calculateTotals();
        
        console.log('Bill form populated successfully');
    }

    // Bill preview functions
    previewBill() {
        console.log('previewBill function called');
        try {
            // Ensure totals are calculated before collecting data
            this.calculateTotals();
            const billData = this.collectBillData();
            console.log('Bill data collected:', billData);
            this.generateBillPreview(billData);
            console.log('Bill preview generated');
            const modal = document.getElementById('bill-preview-modal');
            if (modal) {
                modal.classList.remove('hidden');
                console.log('Modal should be visible now');
            } else {
                console.error('Modal not found!');
            }
        } catch (error) {
            console.error('Error in previewBill:', error);
            this.showMessage('Error generating preview: ' + error.message, 'error');
        }
    }

    generateBillPreview(billData) {
        console.log('generateBillPreview called with:', billData);
        console.log('Rounding amount in billData:', billData.roundingAmount);
        console.log('Current this.roundingAmount:', this.roundingAmount);
        const previewContent = document.getElementById('bill-preview-content');
        console.log('Preview content element:', previewContent);
        
        if (!previewContent) {
            console.error('Preview content element not found!');
            return;
        }
        
        const template = billData.template || this.selectedTemplate;
        console.log('Using template:', template);
        
        try {
            const html = BillTemplates.generateBillPreview(billData, template);
            console.log('Generated HTML length:', html.length);
            previewContent.innerHTML = html;
            console.log('HTML set successfully');
        } catch (error) {
            console.error('Error generating template:', error);
            previewContent.innerHTML = '<p>Error generating preview: ' + error.message + '</p>';
        }
    }

    closeModal() {
        const modal = document.getElementById('bill-preview-modal');
        if (modal) modal.classList.add('hidden');
    }

    printBill() {
        const printContent = document.getElementById('bill-preview-content')?.innerHTML;
        if (!printContent) return;
        
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

    // ===============================
    // Warehouse Management Methods
    // ===============================
    
    async loadWarehouseItems() {
        try {
            await this.billManager.loadItems();
            this.displayWarehouseItems();
        } catch (error) {
            console.error('Error loading warehouse items:', error);
            this.showMessage(error.message, 'error');
        }
    }

    displayWarehouseItems() {
        const itemsContainer = document.getElementById('items-container-warehouse');
        if (!itemsContainer) {
            console.error('Items container not found!');
            return;
        }
        
        const items = this.billManager.getItems();
        console.log('Displaying warehouse items:', items);
        
        itemsContainer.innerHTML = '';
        
        if (items.length === 0) {
            console.log('No items found, showing empty message');
            itemsContainer.innerHTML = '<p class="text-center">No items found. Add your first item!</p>';
            return;
        }
        
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card';
            itemCard.innerHTML = `
                <div class="item-header">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p>HSN: ${item.hsn}</p>
                    </div>
                    <div class="item-price">₹${item.defaultRate.toFixed(2)}</div>
                </div>
                <div class="item-details">
                    <div class="item-detail">
                        <label>Unit</label>
                        <span>${item.defaultUnit}</span>
                    </div>
                    <div class="item-detail">
                        <label>Created</label>
                        <span>${this.formatDate(item.createdAt)}</span>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-sm edit-item-btn" data-item-id="${item.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-item-btn" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            itemsContainer.appendChild(itemCard);
        });
        
        // Add event listeners to the new buttons
        this.setupItemActionListeners();
    }

    setupItemActionListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.edit-item-btn').dataset.itemId;
                this.editItem(itemId);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.delete-item-btn').dataset.itemId;
                this.deleteItem(itemId);
            });
        });
    }

    showAddItemModal() {
        this.editingItemId = null;
        const modal = document.getElementById('item-modal');
        const modalTitle = document.getElementById('item-modal-title');
        const itemForm = document.getElementById('item-form');
        
        if (modalTitle) modalTitle.textContent = 'Add New Item';
        if (itemForm) itemForm.reset();
        if (modal) modal.classList.remove('hidden');
    }

    editItem(itemId) {
        const item = this.billManager.findItemById(itemId);
        if (item) {
            this.editingItemId = itemId;
            const modal = document.getElementById('item-modal');
            const modalTitle = document.getElementById('item-modal-title');
            
            if (modalTitle) modalTitle.textContent = 'Edit Item';
            if (modal) modal.classList.remove('hidden');
            
            // Populate form with item data
            this.populateItemForm(item);
        } else {
            this.showMessage('Item not found', 'error');
        }
    }

    populateItemForm(item) {
        const nameField = document.getElementById('item-name');
        const hsnField = document.getElementById('item-hsn');
        const unitField = document.getElementById('item-unit');
        const customUnitField = document.getElementById('item-custom-unit');
        const priceField = document.getElementById('item-price');
        
        if (nameField) nameField.value = item.name || '';
        if (hsnField) hsnField.value = item.hsn || '';
        if (priceField) priceField.value = item.defaultRate || 0;
        
        if (unitField && customUnitField) {
            const unit = item.defaultUnit || 'pcs';
            if (['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'ft', 'hrs', 'days', 'sqm', 'sqft'].includes(unit)) {
                unitField.value = unit;
                customUnitField.classList.add('hidden');
                customUnitField.required = false;
                customUnitField.value = '';
            } else {
                unitField.value = 'custom';
                customUnitField.classList.remove('hidden');
                customUnitField.required = true;
                customUnitField.value = unit;
            }
        }
    }

    async handleItemSubmit(e) {
        e.preventDefault();
        
        try {
            const itemData = this.collectItemData();
            
            if (this.editingItemId) {
                // Update existing item
                await this.billManager.updateItem(this.editingItemId, itemData);
                this.showMessage('Item updated successfully!', 'success');
                this.editingItemId = null;
            } else {
                // Create new item
                await this.billManager.saveItem(itemData);
                this.showMessage('Item added successfully!', 'success');
            }
            
            this.closeItemModal();
            this.loadWarehouseItems();
            // Refresh items datalist for bill creation
            this.populateDatalists();
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    collectItemData() {
        const unitField = document.getElementById('item-unit');
        const customUnitField = document.getElementById('item-custom-unit');
        
        return {
            name: document.getElementById('item-name')?.value || '',
            hsn: document.getElementById('item-hsn')?.value || '',
            defaultRate: parseFloat(document.getElementById('item-price')?.value) || 0,
            defaultUnit: unitField?.value === 'custom' ? customUnitField?.value : unitField?.value || 'pcs'
        };
    }

    async deleteItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await this.billManager.deleteItem(itemId);
                this.showMessage('Item deleted successfully', 'success');
                this.loadWarehouseItems();
                // Refresh items datalist for bill creation
                this.populateDatalists();
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        }
    }

    handleItemUnitChange(e) {
        const customUnitInput = document.getElementById('item-custom-unit');
        if (e.target.value === 'custom') {
            if (customUnitInput) {
                customUnitInput.classList.remove('hidden');
                customUnitInput.required = true;
            }
        } else {
            if (customUnitInput) {
                customUnitInput.classList.add('hidden');
                customUnitInput.required = false;
            }
        }
    }

    filterItems() {
        const searchTerm = document.getElementById('search-items')?.value || '';
        const items = this.billManager.getItems();
        
        const itemsContainer = document.getElementById('items-container-warehouse');
        if (!itemsContainer) return;
        
        const itemCards = itemsContainer.querySelectorAll('.item-card');
        
        if (!searchTerm) {
            // Show all items
            itemCards.forEach(card => card.style.display = 'block');
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.hsn.toLowerCase().includes(term) ||
            item.defaultUnit.toLowerCase().includes(term)
        );
        
        itemCards.forEach((card, index) => {
            if (index < filteredItems.length) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    closeItemModal() {
        const modal = document.getElementById('item-modal');
        if (modal) modal.classList.add('hidden');
        this.editingItemId = null;
    }

    // Utility functions
    formatDate(date) {
        if (!date) return 'N/A';
        
        let jsDate;
        
        if (date && typeof date.toDate === 'function') {
            jsDate = date.toDate();
        } else if (date instanceof Date) {
            jsDate = date;
        } else if (date) {
            jsDate = new Date(date);
        } else {
            return 'N/A';
        }
        
        if (isNaN(jsDate.getTime())) {
            return 'Invalid Date';
        }
        
        return jsDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        document.querySelectorAll('.error, .success, .info').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        // Insert at the top of the main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
        } else {
            document.body.insertBefore(messageDiv, document.body.firstChild);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Global functions for onclick handlers
window.switchTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    document.getElementById(`${tab}-form`).classList.remove('hidden');
};

// Global function for warehouse button (backup)
window.showWarehouse = function() {
    if (window.app) {
        window.app.showWarehouse();
    } else {
        console.error('App not available');
    }
};

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BillGeneratorApp();
    window.app = app; // Make app globally available for onclick handlers
});

    // Set S.R. Decor business information
    (function() {
        const businessInfo = {
            name: 'S. R. DECOR',
            address: 'SHOP NO. 3, DHANI RAM COMPLEX, NEAR METRO PILLAR NO. 54-55, Gurgaon, Haryana - 122002',
            email: 'srdecorofficial@gmail.com',
            phone: '+91-9811627334',
            pan: 'AFSPJ4994F',
            gstin: '06AFSPJ4994F1ZX',
            state: 'Haryana (06)'
        };
        
        // Set the form fields
        const businessName = document.getElementById('default-business-name');
        const businessAddress = document.getElementById('default-business-address');
        const businessEmail = document.getElementById('default-business-email');
        const businessPhone = document.getElementById('default-business-phone');
        const businessPan = document.getElementById('default-business-pan');
        const businessGstin = document.getElementById('default-business-gstin');
        const businessState = document.getElementById('default-business-state');
        
        if (businessName) businessName.value = businessInfo.name;
        if (businessAddress) businessAddress.value = businessInfo.address;
        if (businessEmail) businessEmail.value = businessInfo.email;
        if (businessPhone) businessPhone.value = businessInfo.phone;
        if (businessPan) businessPan.value = businessInfo.pan;
        if (businessGstin) businessGstin.value = businessInfo.gstin;
        if (businessState) businessState.value = businessInfo.state;
        
        this.showMessage('S.R. Decor business information set successfully!', 'success');
    })();
