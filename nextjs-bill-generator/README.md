# Bill Generator Pro - Next.js Version

A modern, responsive web application for generating and managing business invoices built with Next.js 14, React, TypeScript, and Firebase.

## Features

- **Authentication**: Email/password and Google sign-in
- **Bill Management**: Create, view, edit, and delete invoices and estimates
- **Warehouse Management**: Manage product catalog with HSN codes and pricing
- **Customer Management**: Store and manage customer information
- **Business Settings**: Configure default business information and terms
- **Multiple Templates**: Support for different bill formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-bill-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   ```

4. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Get your Firebase configuration and add it to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs-bill-generator/
├── app/                          # Next.js 13+ app directory
│   ├── admin/                    # Admin routes
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   ├── page.tsx             # Dashboard
│   │   ├── new-bill/            # Create new bill
│   │   ├── bills/               # List all bills
│   │   ├── warehouse/           # Manage products
│   │   ├── customers/           # Manage customers
│   │   └── settings/            # Business settings
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (auth)
│   └── providers.tsx            # Context providers
├── components/                   # Reusable components
│   ├── AuthPage.tsx             # Authentication page
│   ├── AdminHeader.tsx          # Admin header
│   ├── AdminSidebar.tsx         # Admin sidebar
│   ├── BillForm.tsx             # Bill creation form
│   └── BillPreview.tsx          # Bill preview modal
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication context
│   └── AppContext.tsx           # App state context
├── lib/                         # Utility libraries
│   └── firebase.ts              # Firebase configuration
└── public/                      # Static assets
```

## Available Routes

- `/` - Authentication page
- `/admin` - Dashboard
- `/admin/new-bill` - Create new bill
- `/admin/bills` - List all bills
- `/admin/warehouse` - Manage products
- `/admin/customers` - Manage customers
- `/admin/settings` - Business settings

## Features Overview

### Authentication
- Email/password registration and login
- Google OAuth integration
- Protected routes with automatic redirects

### Bill Management
- Create invoices and estimates
- Multiple bill templates
- Auto-calculation of taxes (CGST, SGST, IGST)
- Bill preview and printing
- Search and filter functionality

### Warehouse Management
- Add, edit, and delete products
- HSN code management
- Default pricing and tax rates
- Product search and filtering

### Customer Management
- Store customer information
- Auto-fill customer details in bills
- Customer search and filtering

### Business Settings
- Configure default business information
- Set up bank details
- Customize terms and conditions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Prettier for code formatting

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.

## Migration from Original App

This Next.js version includes all features from the original vanilla JavaScript app:

- ✅ Authentication system
- ✅ Bill creation and management
- ✅ Warehouse/product management
- ✅ Customer management
- ✅ Business settings
- ✅ Multiple bill templates
- ✅ Responsive design
- ✅ Firebase integration

The new version provides:
- Better code organization
- Type safety with TypeScript
- Modern React patterns
- Improved performance
- Better developer experience
- SEO optimization
- Server-side rendering capabilities
