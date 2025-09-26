// UI utility functions
export class UIUtils {
    // Show message to user
    static showMessage(message, type = 'info') {
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

    // Show/hide elements
    static show(element) {
        element.classList.remove('hidden');
    }

    static hide(element) {
        element.classList.add('hidden');
    }

    // Toggle visibility
    static toggle(element) {
        element.classList.toggle('hidden');
    }

    // Get element by ID
    static getElement(id) {
        return document.getElementById(id);
    }

    // Get elements by class
    static getElements(className) {
        return document.querySelectorAll(`.${className}`);
    }

    // Add event listener with error handling
    static addEventListener(element, event, handler) {
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    // Format currency
    static formatCurrency(amount) {
        return `₹${amount.toFixed(2)}`;
    }

    // Format date - handles both Firestore Timestamps and regular dates
    static formatDate(date) {
        if (!date) return 'N/A';
        
        let jsDate;
        
        // Check if it's a Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            jsDate = date.toDate();
        } 
        // Check if it's already a JavaScript Date
        else if (date instanceof Date) {
            jsDate = date;
        } 
        // Check if it's a string or number that can be converted
        else if (date) {
            jsDate = new Date(date);
        } else {
            return 'N/A';
        }
        
        // Check if the date is valid
        if (isNaN(jsDate.getTime())) {
            return 'Invalid Date';
        }
        
        return jsDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format date and time - handles both Firestore Timestamps and regular dates
    static formatDateTime(date) {
        if (!date) return 'N/A';
        
        let jsDate;
        
        // Check if it's a Firestore Timestamp
        if (date && typeof date.toDate === 'function') {
            jsDate = date.toDate();
        } 
        // Check if it's already a JavaScript Date
        else if (date instanceof Date) {
            jsDate = date;
        } 
        // Check if it's a string or number that can be converted
        else if (date) {
            jsDate = new Date(date);
        } else {
            return 'N/A';
        }
        
        // Check if the date is valid
        if (isNaN(jsDate.getTime())) {
            return 'Invalid Date';
        }
        
        return jsDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate required fields
    static validateRequiredFields(fields) {
        const errors = [];
        fields.forEach(field => {
            if (!field.value.trim()) {
                errors.push(`${field.name || field.id} is required`);
            }
        });
        return errors;
    }
}
