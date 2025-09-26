# Bill Generator Pro

A modern, responsive web application for generating and managing business invoices with Firebase integration and customizable units. Built with ES6 modules for clean, maintainable code.

## Features

- 🔐 **Firebase Authentication** - Secure login and registration
- 📊 **Customizable Units** - Support for various units (pieces, kg, liters, hours, custom units, etc.)
- 💰 **Automatic Calculations** - Real-time calculation of amounts, taxes, and totals
- 💾 **Firebase Firestore** - Cloud storage for bills with user-specific data
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🖨️ **Print Functionality** - Print bills directly from the browser
- 🔍 **Search & Filter** - Find bills quickly with search functionality
- ✏️ **Edit & Delete** - Full CRUD operations for bill management
- 👁️ **Bill Preview** - Preview bills before saving or printing
- 🏗️ **ES6 Modules** - Clean, modular architecture for better maintainability

## Project Structure

```
bill-generator/
├── index.html              # Main application file
├── styles.css              # CSS styles
├── firebase-config.js      # Firebase configuration & exports
├── auth-manager.js         # Authentication management
├── bill-manager.js         # Bill CRUD operations
├── ui-utils.js             # UI utility functions
├── app.js                  # Main application class
├── serve.py                # Development server
├── package.json            # Project configuration
└── README.md               # This file
```

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in **Standard edition**
   - Set up security rules (see below)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web
   - Copy the configuration object

### 2. Update Firebase Configuration

Open `firebase-config.js` and replace the Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Set up the following security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bills/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Run the Application

**Option 1: Using the provided server (Recommended)**
```bash
python3 serve.py
```
Then open: http://localhost:8000

**Option 2: Using Python's built-in server**
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

**Option 3: Using Node.js (if you have it installed)**
```bash
npx http-server
```

## Usage

### Creating a Bill

1. **Business Information**: Enter your business details
2. **Customer Information**: Add customer details
3. **Items**: 
   - Add item name, description, quantity
   - Select unit from dropdown or enter custom unit
   - Enter rate per unit
   - Amount is calculated automatically
4. **Bill Summary**: Review subtotal, tax, and total amounts
5. **Save**: Save the bill to Firebase

### Managing Bills

- **View Bills**: See all your saved bills
- **Search**: Use the search bar to find specific bills
- **Edit**: Click edit to modify existing bills
- **Delete**: Remove bills you no longer need
- **Print**: Generate a printable version of any bill

### Supported Units

- Pieces (pcs)
- Weight: Kilograms (kg), Grams (g)
- Volume: Liters (l), Milliliters (ml)
- Length: Meters (m), Centimeters (cm), Feet (ft)
- Time: Hours (hrs), Days (days)
- Custom: Enter any custom unit

## Architecture

### ES6 Modules

The application is built using modern ES6 modules for better code organization:

- **`firebase-config.js`** - Firebase configuration and service exports
- **`auth-manager.js`** - Handles all authentication operations
- **`bill-manager.js`** - Manages bill CRUD operations
- **`ui-utils.js`** - UI utility functions and helpers
- **`app.js`** - Main application class that coordinates everything

### Benefits of This Architecture

- ✅ **No Global Namespace Pollution** - Clean global scope
- ✅ **Better Code Organization** - Each file has a single responsibility
- ✅ **Easier Maintenance** - Find and modify specific functionality quickly
- ✅ **Better Testing** - Each module can be tested independently
- ✅ **Team Collaboration** - Multiple developers can work on different modules
- ✅ **Scalability** - Easy to add new features without conflicts

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with modern features
- **JavaScript (ES6+)** - Application logic with modules
- **Firebase** - Authentication and database
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security Features

- User authentication required
- User-specific data isolation
- Secure Firebase rules
- Input validation
- XSS protection

## Customization

The application is highly customizable:

- Modify units in the dropdown options
- Change tax rates and calculations
- Customize styling in `styles.css`
- Add new fields to the bill form
- Modify the bill preview layout

## Troubleshooting

### Common Issues

1. **Firebase not connecting**: Check your configuration in `firebase-config.js`
2. **Authentication errors**: Verify email/password authentication is enabled in Firebase
3. **Bills not saving**: Check Firestore security rules and ensure user is authenticated
4. **Print not working**: Ensure pop-ups are allowed for the site
5. **Modules not loading**: Make sure you're running the app through a server (not file://)

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify Firebase configuration in `firebase-config.js`
3. Ensure all required Firebase services are enabled
4. Check Firestore security rules
5. Make sure you're using a web server (not opening files directly)

## Development

### Adding New Features

1. Create a new module file (e.g., `new-feature.js`)
2. Export your functions/classes from the module
3. Import and use them in `app.js`
4. Update the main application class as needed

### Code Style

- Use ES6+ features
- Follow the existing module pattern
- Keep functions focused and single-purpose
- Use meaningful variable and function names
- Add comments for complex logic

## License

This project is open source and available under the MIT License.
