// Enhanced Bill Templates with all new features
export class BillTemplates {
    static generateBillPreview(billData, template = 'default') {
        console.log('generateBillPreview called with billData:', billData);
        console.log('Place of Supply in billData:', billData.placeOfSupply);
        console.log('roundingAmount in billData:', billData.roundingAmount);
        switch (template) {
            case 'est-rt':
                return this.generateESTRTTemplate(billData);
            case 'ovies':
                return this.generateOVIESGlobalTemplate(billData);
            case 'default':
            default:
                return this.generateDefaultTemplate(billData);
        }
    }

    // Helper function to safely format numbers
    static safeToFixed(value, decimals = 2) {
        if (value === null || value === undefined || isNaN(value)) {
            return '0.00';
        }
        return parseFloat(value).toFixed(decimals);
    }

    // Helper function to safely get string values
    static safeString(value, defaultValue = '') {
        if (value === null || value === undefined) {
            return defaultValue;
        }
        return String(value);
    }

    // Helper function to check if any item has discount
    static hasAnyDiscount(items) {
        return items.some(item => parseFloat(item.discount) > 0);
    }

    // Helper function to check if business and customer are in same state
    static isSameState(businessState, customerState) {
        if (!businessState || !customerState) return false;
        
        // Extract state codes from the state strings (e.g., "Haryana (06)" -> "06")
        const businessStateCode = businessState.match(/\((\d+)\)/)?.[1];
        const customerStateCode = customerState.match(/\((\d+)\)/)?.[1];
        
        return businessStateCode === customerStateCode;
    }

    static generateDefaultTemplate(billData) {
        const hasDiscount = this.hasAnyDiscount(billData.items);
        
        const itemsHtml = billData.items.map(item => {
            let row = `
                <tr>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; font-size: 10px;">${this.safeString(item.name)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeString(item.quantity)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeString(item.unit)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.rate)}</td>`;
            
            if (hasDiscount) {
                row += `<td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeToFixed(item.discount)}%</td>`;
            }
            
            row += `<td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.amount)}</td>
                </tr>`;
            return row;
        }).join('');

        let tableHeader = `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 4px; text-align: left; border-bottom: 1px solid #ddd; font-size: 10px;">Item</th>
                        <th style="padding: 4px; text-align: center; border-bottom: 1px solid #ddd; font-size: 10px;">Quantity</th>
                        <th style="padding: 4px; text-align: center; border-bottom: 1px solid #ddd; font-size: 10px;">Unit</th>
                        <th style="padding: 4px; text-align: right; border-bottom: 1px solid #ddd; font-size: 10px;">Rate</th>`;
        
        if (hasDiscount) {
            tableHeader += `<th style="padding: 4px; text-align: center; border-bottom: 1px solid #ddd; font-size: 10px;">Discount</th>`;
        }
        
        tableHeader += `<th style="padding: 4px; text-align: right; border-bottom: 1px solid #ddd; font-size: 10px;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>`;

        return `
            <div class="bill-preview">
                <div class="bill-preview-header">
                    <h2>${this.safeString(billData.businessInfo.name)}</h2>
                    <p>${this.safeString(billData.businessInfo.email)} | ${this.safeString(billData.businessInfo.phone)}</p>
                    <p>${this.safeString(billData.businessInfo.address)}</p>
                </div>
                
                <div class="bill-preview-info">
                    <div>
                        <h3>Bill To:</h3>
                        <p><strong>${this.safeString(billData.customerInfo.name)}</strong></p>
                        <p>${this.safeString(billData.customerInfo.email)}</p>
                        <p>${this.safeString(billData.customerInfo.phone)}</p>
                        <p>${this.safeString(billData.customerInfo.address)}</p>
                        <p>${this.safeString(billData.customerInfo.city)} ${this.safeString(billData.customerInfo.state).replace(/\s*\(\d+\)/, '')} ${this.safeString(billData.customerInfo.pincode)}</p>
                    </div>
                    <div>
                        <h3>Bill Details:</h3>
                        <p><strong>Type:</strong> ${billData.billType === 'estimate' ? 'Estimate' : 'Invoice'}</p>
                        <p><strong>Number:</strong> ${this.safeString(billData.billNumber)}</p>
                        <p><strong>Date:</strong> ${this.formatDate(billData.billDate)}</p>
                        <p><strong>Place of Supply:</strong> ${this.safeString(billData.placeOfSupply, 'Haryana (06)')}</p>
                        <p><strong>Total:</strong> ₹${this.safeToFixed(billData.total)}</p>
                    </div>
                </div>
                
                ${this.renderShippingAddress(billData.shippingInfo)}
                
                <div class="bill-preview-items">
                    ${tableHeader}
                </div>
                
                <div class="bill-preview-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${this.safeToFixed(billData.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Total Tax:</span>
                        <span>₹${this.safeToFixed(billData.taxAmount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Rounding:</span>
                        <span>₹${this.safeToFixed(billData.roundingAmount !== undefined ? billData.roundingAmount : 0)}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>₹${this.safeToFixed(billData.total)}</span>
                    </div>
                </div>
                
                ${this.renderBankDetails(billData.bankDetails)}
                ${this.renderTermsConditions(billData.termsConditions)}
            </div>
        `;
    }

    static generateESTRTTemplate(billData) {
        const hasDiscount = this.hasAnyDiscount(billData.items);
        const isSameState = this.isSameState(billData.businessInfo.state, billData.customerInfo.state);
        
        const itemsHtml = billData.items.map(item => {
            let row = `
                <tr>
                    <td style="padding: 3px; border: 1px solid #000; text-align: left; font-size: 10px;">${this.safeString(item.name)}</td>
                    <td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeString(item.hsn)}</td>
                    <td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeString(item.quantity)}</td>
                    <td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeString(item.unit)}</td>
                    <td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.rate)}</td>`;
            
            if (hasDiscount) {
                row += `<td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeToFixed(item.discount)}%</td>`;
            }
            
            row += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.amount)}</td>`;
            
            if (isSameState) {
                // Same state: Show CGST and SGST
                row += `<td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeToFixed(item.cgst)}%</td>
                        <td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeToFixed(item.sgst)}%</td>`;
            } else {
                // Different state: Show IGST only
                row += `<td style="padding: 3px; border: 1px solid #000; text-align: center; font-size: 10px;">${this.safeToFixed(item.igst)}%</td>`;
            }
            
            row += `<td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.taxAmount)}</td>
                    <td style="padding: 3px; border: 1px solid #000; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.totalAmount)}</td>
                </tr>`;
            return row;
        }).join('');

        // Calculate totals with safe values
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;
        let totalTax = 0;
        
        billData.items.forEach(item => {
            const amount = parseFloat(item.amount) || 0;
            
            if (isSameState) {
                // Same state: Calculate CGST and SGST
                const cgst = parseFloat(item.cgst) || 0;
                const sgst = parseFloat(item.sgst) || 0;
                
                const cgstAmount = (amount * cgst) / 100;
                const sgstAmount = (amount * sgst) / 100;
                
                totalCGST += cgstAmount;
                totalSGST += sgstAmount;
                totalTax += cgstAmount + sgstAmount;
            } else {
                // Different state: Calculate IGST
                const igst = parseFloat(item.igst) || 0;
                const igstAmount = (amount * igst) / 100;
                
                totalIGST += igstAmount;
                totalTax += igstAmount;
            }
        });

        const billTypeText = billData.billType === 'estimate' ? 'ESTIMATE' : 'INVOICE';
        const billNumberText = this.safeString(billData.billNumber) || `SR/2025-26/0001`;

        let tableHeader = `
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 3px; border: 1px solid #000; text-align: left; font-weight: bold; font-size: 10px;">Item Description</th>
                        <th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">HSN/SAC</th>
                        <th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">Qty</th>
                        <th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">Unit</th>
                        <th style="padding: 3px; border: 1px solid #000; text-align: right; font-weight: bold; font-size: 10px;">Rate</th>`;
        
        if (hasDiscount) {
            tableHeader += `<th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">Disc%</th>`;
        }
        
        tableHeader += `<th style="padding: 3px; border: 1px solid #000; text-align: right; font-weight: bold; font-size: 10px;">Amount</th>`;
        
        if (isSameState) {
            // Same state: Show CGST and SGST columns
            tableHeader += `<th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">CGST%</th>
                            <th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">SGST%</th>`;
        } else {
            // Different state: Show IGST column only
            tableHeader += `<th style="padding: 3px; border: 1px solid #000; text-align: center; font-weight: bold; font-size: 10px;">IGST%</th>`;
        }
        
        tableHeader += `<th style="padding: 3px; border: 1px solid #000; text-align: right; font-weight: bold; font-size: 10px;">Tax</th>
                        <th style="padding: 3px; border: 1px solid #000; text-align: right; font-weight: bold; font-size: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>`;

        // Build totals section based on state
        let totalsSection = `
                <!-- Totals Section -->
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 250px;">
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>Subtotal:</span>
                                <span>₹${this.safeToFixed(billData.subtotal)}</span>
                            </div>`;
        
        if (isSameState) {
            // Same state: Show CGST and SGST breakdown
            totalsSection += `
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>CGST:</span>
                                <span>₹${this.safeToFixed(totalCGST)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>SGST:</span>
                                <span>₹${this.safeToFixed(totalSGST)}</span>
                            </div>`;
        } else {
            // Different state: Show IGST
            totalsSection += `
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>IGST:</span>
                                <span>₹${this.safeToFixed(totalIGST)}</span>
                            </div>`;
        }
        
        totalsSection += `
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>Total Tax:</span>
                                <span>₹${this.safeToFixed(totalTax)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 2px 0; border-bottom: 1px solid #ccc; font-size: 10px;">
                                <span>Rounding:</span>
                                <span>₹${this.safeToFixed(billData.roundingAmount !== undefined ? billData.roundingAmount : 0)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 5px 0; font-weight: bold; font-size: 12px; border-top: 1px solid #000;">
                                <span>Total:</span>
                                <span>₹${this.safeToFixed(billData.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>`;

        return `
            <div class="bill-preview" style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 10px; font-size: 11px;">
                <!-- Company Header -->
                <div style="text-align: center; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">
                    <h1 style="margin: 0; font-size: 18px; color: #333;">${this.safeString(billData.businessInfo.name)}</h1>
                    <p style="margin: 2px 0; font-size: 11px;">${this.safeString(billData.businessInfo.address)}</p>
                    <p style="margin: 2px 0; font-size: 11px;">Phone: ${this.safeString(billData.businessInfo.phone)} | Email: ${this.safeString(billData.businessInfo.email)}</p>
                    ${billData.businessInfo.gstin ? `<p style="margin: 2px 0; font-size: 11px;">GSTIN: ${this.safeString(billData.businessInfo.gstin)}</p>` : ''}
                    ${billData.businessInfo.pan ? `<p style="margin: 2px 0; font-size: 11px;">PAN: ${this.safeString(billData.businessInfo.pan)}</p>` : ''}
                </div>

                <!-- Bill Details -->
                <div style="margin-bottom: 10px;">
                    <h2 style="text-align: center; margin: 0; font-size: 16px; color: #333;">${billTypeText}</h2>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <div>
                            <p style="margin: 1px 0; font-size: 11px;"><strong>${billTypeText} No:</strong> ${billNumberText}</p>
                            <p style="margin: 1px 0; font-size: 11px;"><strong>Date:</strong> ${this.formatDate(billData.billDate)}</p>
                        </div>
                        <div>
                            <p style="margin: 1px 0; font-size: 11px;"><strong>Place of Supply:</strong> ${this.safeString(billData.placeOfSupply, 'Haryana (06)')}</p>
                        </div>
                    </div>
                </div>

                <!-- Bill To Section -->
                <div style="margin-bottom: 10px;">
                    <h3 style="margin: 0 0 5px 0; font-size: 12px;">Bill To:</h3>
                    <div style="border: 1px solid #000; padding: 8px;">
                        <p style="margin: 0; font-weight: bold; font-size: 12px;">${this.safeString(billData.customerInfo.name)}</p>
                        ${billData.customerInfo.address ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(billData.customerInfo.address)}</p>` : ''}
                        ${billData.customerInfo.city ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(billData.customerInfo.city)}</p>` : ''}
                        ${billData.customerInfo.state ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(billData.customerInfo.state).replace(/\s*\(\d+\)/, '')}</p>` : ''}
                        ${billData.customerInfo.pincode ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(billData.customerInfo.pincode)}</p>` : ''}
                        ${billData.customerInfo.gstin ? `<p style="margin: 2px 0; font-size: 10px;">GSTIN: ${this.safeString(billData.customerInfo.gstin)}</p>` : ''}
                        ${billData.customerInfo.phone ? `<p style="margin: 2px 0; font-size: 10px;">Phone: ${this.safeString(billData.customerInfo.phone)}</p>` : ''}
                        ${billData.customerInfo.email ? `<p style="margin: 2px 0; font-size: 10px;">Email: ${this.safeString(billData.customerInfo.email)}</p>` : ''}
                    </div>
                </div>

                ${this.renderShippingAddress(billData.shippingInfo)}

                <!-- Items Table -->
                <div style="margin-bottom: 10px;">
                    ${tableHeader}
                </div>

                ${totalsSection}

                <!-- Total in Words -->
                <div style="margin-bottom: 10px;">
                    <p style="margin: 0; font-size: 10px;"><strong>Total in Words:</strong> ${this.numberToWords(billData.total)}</p>
                </div>

                ${this.renderBankDetails(billData.bankDetails)}
                ${this.renderTermsAndSignatory(billData.termsConditions)}
            </div>
        `;
    }

    static generateOVIESGlobalTemplate(billData) {
        const hasDiscount = this.hasAnyDiscount(billData.items);
        
        const itemsHtml = billData.items.map(item => {
            let row = `
                <tr>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; font-size: 10px;">${this.safeString(item.name)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeString(item.quantity)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeString(item.unit)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.rate)}</td>`;
            
            if (hasDiscount) {
                row += `<td style="padding: 4px; border-bottom: 1px solid #eee; text-align: center; font-size: 10px;">${this.safeToFixed(item.discount)}%</td>`;
            }
            
            row += `<td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.amount)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.taxAmount)}</td>
                    <td style="padding: 4px; border-bottom: 1px solid #eee; text-align: right; font-size: 10px;">₹${this.safeToFixed(item.totalAmount)}</td>
                </tr>`;
            return row;
        }).join('');

        let tableHeader = `
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                    <tr style="background: #3498db; color: white;">
                        <th style="padding: 4px; text-align: left; font-size: 10px;">Item</th>
                        <th style="padding: 4px; text-align: center; font-size: 10px;">Quantity</th>
                        <th style="padding: 4px; text-align: center; font-size: 10px;">Unit</th>
                        <th style="padding: 4px; text-align: right; font-size: 10px;">Rate</th>`;
        
        if (hasDiscount) {
            tableHeader += `<th style="padding: 4px; text-align: center; font-size: 10px;">Discount</th>`;
        }
        
        tableHeader += `<th style="padding: 4px; text-align: right; font-size: 10px;">Amount</th>
                        <th style="padding: 4px; text-align: right; font-size: 10px;">Tax</th>
                        <th style="padding: 4px; text-align: right; font-size: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>`;

        return `
            <div class="bill-preview">
                <div class="bill-preview-header" style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2c3e50; margin: 0;">OVIES GLOBAL</h1>
                    <p style="margin: 5px 0; color: #7f8c8d;">Your Trusted Business Partner</p>
                    <p style="margin: 5px 0;">${this.safeString(billData.businessInfo.address)}</p>
                    <p style="margin: 5px 0;">Phone: ${this.safeString(billData.businessInfo.phone)} | Email: ${this.safeString(billData.businessInfo.email)}</p>
                </div>
                
                <div class="bill-preview-info">
                    <div>
                        <h3>Bill To:</h3>
                        <p><strong>${this.safeString(billData.customerInfo.name)}</strong></p>
                        <p>${this.safeString(billData.customerInfo.email)}</p>
                        <p>${this.safeString(billData.customerInfo.phone)}</p>
                        <p>${this.safeString(billData.customerInfo.address)}</p>
                        <p>${this.safeString(billData.customerInfo.city)} ${this.safeString(billData.customerInfo.state).replace(/\s*\(\d+\)/, '')} ${this.safeString(billData.customerInfo.pincode)}</p>
                    </div>
                    <div>
                        <h3>Bill Details:</h3>
                        <p><strong>Type:</strong> ${billData.billType === 'estimate' ? 'Estimate' : 'Invoice'}</p>
                        <p><strong>Number:</strong> ${this.safeString(billData.billNumber)}</p>
                        <p><strong>Date:</strong> ${this.formatDate(billData.billDate)}</p>
                        <p><strong>Place of Supply:</strong> ${this.safeString(billData.placeOfSupply, 'Haryana (06)')}</p>
                        <p><strong>Total:</strong> ₹${this.safeToFixed(billData.total)}</p>
                    </div>
                </div>
                
                ${this.renderShippingAddress(billData.shippingInfo)}
                
                <div class="bill-preview-items">
                    ${tableHeader}
                </div>
                
                <div class="bill-preview-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>₹${this.safeToFixed(billData.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Total Tax:</span>
                        <span>₹${this.safeToFixed(billData.taxAmount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Rounding:</span>
                        <span>₹${this.safeToFixed(billData.roundingAmount !== undefined ? billData.roundingAmount : 0)}</span>
                    </div>
                    <div class="total-row total-final">
                        <span>Total:</span>
                        <span>₹${this.safeToFixed(billData.total)}</span>
                    </div>
                </div>
                
                ${this.renderBankDetails(billData.bankDetails)}
                ${this.renderTermsConditions(billData.termsConditions)}
            </div>
        `;
    }

    static renderShippingAddress(shippingInfo) {
        if (!shippingInfo || (!shippingInfo.name && !shippingInfo.address && !shippingInfo.city)) {
            return '';
        }

        return `
            <div style="margin-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0; font-size: 12px;">Ship To:</h3>
                <div style="border: 1px solid #000; padding: 8px;">
                    ${shippingInfo.name ? `<p style="margin: 0; font-weight: bold; font-size: 12px;">${this.safeString(shippingInfo.name)}</p>` : ''}
                    ${shippingInfo.address ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(shippingInfo.address)}</p>` : ''}
                    ${shippingInfo.city ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(shippingInfo.city)}</p>` : ''}
                    ${shippingInfo.state ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(shippingInfo.state).replace(/\s*\(\d+\)/, '')}</p>` : ''}
                    ${shippingInfo.pincode ? `<p style="margin: 2px 0; font-size: 10px;">${this.safeString(shippingInfo.pincode)}</p>` : ''}
                    ${shippingInfo.phone ? `<p style="margin: 2px 0; font-size: 10px;">Phone: ${this.safeString(shippingInfo.phone)}</p>` : ''}
                </div>
            </div>
        `;
    }

    static renderBankDetails(bankDetails) {
        if (!bankDetails || (!bankDetails.bankName && !bankDetails.accountNumber && !bankDetails.ifscCode)) {
            return '';
        }

        return `
            <div style="margin-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0; font-size: 12px;">Bank Details:</h3>
                <div style="border: 1px solid #000; padding: 8px;">
                    ${bankDetails.bankName ? `<p style="margin: 0; font-size: 10px;"><strong>Bank Name:</strong> ${this.safeString(bankDetails.bankName)}</p>` : ''}
                    ${bankDetails.accountHolderName ? `<p style="margin: 2px 0; font-size: 10px;"><strong>A/c Holder Name:</strong> ${this.safeString(bankDetails.accountHolderName)}</p>` : ''}
                    ${bankDetails.accountNumber ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Account Number:</strong> ${this.safeString(bankDetails.accountNumber)}</p>` : ''}
                    ${bankDetails.ifscCode ? `<p style="margin: 2px 0; font-size: 10px;"><strong>IFSC Code:</strong> ${this.safeString(bankDetails.ifscCode)}</p>` : ''}
                    ${bankDetails.branch ? `<p style="margin: 2px 0; font-size: 10px;"><strong>Branch:</strong> ${this.safeString(bankDetails.branch)}</p>` : ''}
                </div>
            </div>
        `;
    }

    static renderTermsConditions(terms) {
        if (!terms || terms.trim() === '') {
            return '';
        }

        return `
            <div style="margin-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0; font-size: 12px;">Terms & Conditions:</h3>
                <div style="border: 1px solid #000; padding: 8px;">
                    <div style="white-space: pre-line; font-size: 10px;">${this.safeString(terms)}</div>
                </div>
            </div>
        `;
    }

    static renderAuthorizedSignatory() {
        return `
            <div style="margin-bottom: 10px;">
                <h3 style="margin: 0 0 5px 0; font-size: 12px;">Authorized Signatory:</h3>
                <div style="border: 1px solid #000; padding: 8px;">
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0; font-weight: bold; font-size: 10px;">For S. R. Decor</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; border-top: 1px solid #000; padding-top: 3px; width: 150px; margin-left: auto; font-size: 10px;">Authorized Signature</p>
                    </div>
                </div>
            </div>
        `;
    }

    static renderTermsAndSignatory(terms) {
        const hasTerms = terms && terms.trim() !== '';
        
        return `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; gap: 20px; align-items: flex-start;">
                    <!-- Terms & Conditions Section -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <h3 style="margin: 0 0 5px 0; font-size: 12px;">Terms & Conditions:</h3>
                        <div style="border: 1px solid #000; padding: 8px; flex: 1; min-height: 80px; display: flex; flex-direction: column;">
                            ${hasTerms ? `
                                <div style="white-space: pre-line; font-size: 10px; flex: 1;">${this.safeString(terms)}</div>
                            ` : `
                                <div style="flex: 1;"></div>
                            `}
                        </div>
                    </div>
                    
                    <!-- Authorized Signatory Section -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <h3 style="margin: 0 0 5px 0; font-size: 12px;">Authorized Signatory:</h3>
                        <div style="border: 1px solid #000; padding: 8px; flex: 1; min-height: 80px; display: flex; flex-direction: column; justify-content: space-between;">
                            <div style="text-align: right;">
                                <p style="margin: 0; font-weight: bold; font-size: 10px;">For S. R. Decor</p>
                            </div>
                            <div style="text-align: right;">
                                <hr style="margin: 0 0 5px 0; border: none; border-top: 1px solid #000; width: 150px; margin-left: auto;">
                                <p style="margin: 0; font-size: 10px;">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    }

    static numberToWords(num) {
        const safeNum = parseFloat(num) || 0;
        
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        
        if (safeNum === 0) return 'Zero';
        
        const integerPart = Math.floor(safeNum);
        const decimalPart = Math.round((safeNum - integerPart) * 100);
        
        let result = this.convertToWords(integerPart);
        if (decimalPart > 0) {
            result += ' and ' + this.convertToWords(decimalPart) + ' Paise';
        }
        
        return result + ' Rupees Only';
    }
    
    static convertToWords(num) {
        if (num === 0) return '';
        
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        
        if (num < 10) return ones[num];
        if (num < 20) return teens[num - 10];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + this.convertToWords(num % 100) : '');
        if (num < 100000) return this.convertToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + this.convertToWords(num % 1000) : '');
        if (num < 10000000) return this.convertToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + this.convertToWords(num % 100000) : '');
        return this.convertToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + this.convertToWords(num % 10000000) : '');
    }
}
