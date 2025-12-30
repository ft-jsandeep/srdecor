# SR Décor - Premium Home Décor Website

A premium, elegant, and minimal UI for SR Décor home décor brand built with Next.js, TypeScript, TailwindCSS, and Framer Motion.

## 🎨 Features

- **Light & Dark Themes**: Elegant theme switching with smooth transitions
- **Fully Responsive**: Mobile-first design (360px → 1920px) for customer-facing pages
- **Admin Panel**: Desktop/tablet only (blocks mobile access < 768px)
- **Premium Design**: Inspired by Whispering Homes, D'Decor, and Dekor Company
- **Smooth Animations**: Framer Motion for micro-interactions and transitions

## 📁 Project Structure

```
app/
  (decor)/              # Customer-facing pages (route group)
    layout.tsx          # Shared layout with Navbar & Footer
    page.tsx            # Homepage
    about/              # About Us page
    products/           # Product portfolio
      page.tsx          # Products listing with filters
      [id]/page.tsx     # Product details
    bestseller/         # Bestseller page
    new-arrivals/       # New arrivals page
    contact/            # Contact page
  
  (admin)/              # Admin panel (route group)
    layout.tsx          # Admin layout with screen size guard
    login/              # Admin login
    dashboard/          # Admin dashboard
    products/           # Product management
      page.tsx          # Products list & management
      new/              # Add new product

components/
  decor/                # Customer-facing components
    Navbar.tsx
    Footer.tsx
    ProductCard.tsx
    ProductGrid.tsx
    Button.tsx
    ThemeToggle.tsx
    FilterSidebar.tsx
    SearchInput.tsx
    Modal.tsx
    Skeleton.tsx
    Tag.tsx
  
  admin/                # Admin components
    ScreenSizeGuard.tsx # Blocks mobile access
    ProtectedRoute.tsx  # Authentication guard
    AdminTable.tsx      # Product management table
    AdminForm.tsx       # Add/Edit product form

data/
  products.ts           # Mock product data

hooks/
  useMediaQuery.ts      # Media query hook for responsive checks
```

## 🚀 Getting Started

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:8000`

## 🎯 Routes

### Customer-Facing Routes

- `/` - Homepage (Note: Currently conflicts with bill generator app at root)
- `/about` - About Us
- `/products` - Product portfolio with filters
- `/products/[id]` - Product details
- `/bestseller` - Bestseller products
- `/new-arrivals` - New arrival products
- `/contact` - Contact form

### Admin Routes

- `/admin/login` - Admin login (Demo: admin@srdecor.com / admin123)
- `/admin/dashboard` - Admin dashboard
- `/admin/products` - Product management
- `/admin/products/new` - Add new product

**Note**: Admin panel is only accessible on screens ≥ 768px. Mobile users will see a blocking message.

## 🎨 Theme System

The app uses a custom theme system with:

- **Light Theme**: Off-white, beige, soft gray
- **Dark Theme**: Deep charcoal, warm black, muted browns
- **Typography**: Playfair Display (serif) for titles, Inter (sans-serif) for content
- **Accent Colors**: Gold/beige tones for both themes

Theme is managed via `next-themes` and can be toggled using the theme toggle in the navbar.

## 📱 Responsiveness

### Customer Pages
- **Mobile**: 360px - 767px (1-2 column grid)
- **Tablet**: 768px - 1023px (2-3 column grid)
- **Desktop**: 1024px+ (3-4 column grid)

### Admin Panel
- **Mobile**: < 768px (Blocked - shows message)
- **Tablet**: 768px+ (Full access)
- **Desktop**: 1024px+ (Optimized layout)

## 🔧 Customization

### Adding Products

Edit `/data/products.ts` to add or modify products. The data structure includes:

```typescript
{
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  isBestseller: boolean
  isNewArrival: boolean
  specifications?: {
    material?: string
    dimensions?: string
    color?: string
    weight?: string
  }
}
```

### Styling

- Theme colors are defined in `tailwind.config.js`
- Global styles in `app/globals.css`
- Component styles use Tailwind utility classes

## 🎭 Components

### Core Components

- **ProductCard**: Displays product with image, name, price, and tags
- **ProductGrid**: Responsive grid layout for products
- **FilterSidebar**: Category filtering (drawer on mobile, sidebar on desktop)
- **SearchInput**: Search functionality with icon
- **Button**: Primary, outline, and ghost variants
- **Modal**: Reusable modal component
- **Skeleton**: Loading states

### Admin Components

- **ScreenSizeGuard**: Blocks mobile access to admin
- **ProtectedRoute**: Authentication guard
- **AdminTable**: Product management table with actions
- **AdminForm**: Comprehensive product form

## 🔐 Admin Authentication

Currently uses localStorage for demo purposes. In production, integrate with your authentication system.

**Demo Credentials:**
- Email: `admin@srdecor.com`
- Password: `admin123`

## 📝 Notes

1. **Root Route Conflict**: The homepage at `app/(decor)/page.tsx` conflicts with the existing bill generator app at `app/page.tsx`. You may want to:
   - Move decor pages to a `/decor` prefix, or
   - Replace the root page with the decor homepage

2. **Image Sources**: Products use Unsplash images. Update `next.config.js` if you need additional image domains.

3. **Data Persistence**: Product management in admin currently uses local state. Integrate with your backend/database for persistence.

## 🎨 Design Philosophy

- **Minimal**: Clean, uncluttered interfaces
- **Elegant**: Premium feel with refined spacing and typography
- **Luxurious**: Subtle shadows, smooth transitions, high-quality imagery
- **Accessible**: Proper contrast, semantic HTML, keyboard navigation

## 🚧 Future Enhancements

- Shopping cart functionality
- User authentication for customers
- Payment integration
- Product reviews and ratings
- Wishlist feature
- Order management
- Analytics dashboard

---

Built with ❤️ for SR Décor










