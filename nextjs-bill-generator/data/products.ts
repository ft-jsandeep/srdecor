export interface Product {
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

export const products: Product[] = [
  {
    id: '1',
    name: 'Luxury Velvet Sofa',
    description: 'Elegant velvet sofa with premium cushioning and gold-tone legs. Perfect centerpiece for your living room.',
    price: 89999,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    category: 'Furniture',
    isBestseller: true,
    isNewArrival: false,
    specifications: {
      material: 'Velvet, Solid Wood',
      dimensions: '220cm x 95cm x 85cm',
      color: 'Navy Blue',
      weight: '45kg',
    },
  },
  {
    id: '2',
    name: 'Modern Ceramic Vase Set',
    description: 'Handcrafted ceramic vases in minimalist design. Set of three in varying sizes.',
    price: 12999,
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7bbdf?w=800',
    ],
    category: 'Accessories',
    isBestseller: true,
    isNewArrival: false,
    specifications: {
      material: 'Ceramic',
      dimensions: 'Various sizes',
      color: 'Terracotta, Beige, White',
    },
  },
  {
    id: '3',
    name: 'Scandinavian Coffee Table',
    description: 'Minimalist oak coffee table with clean lines and natural wood finish.',
    price: 34999,
    images: [
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800',
    ],
    category: 'Furniture',
    isBestseller: false,
    isNewArrival: true,
    specifications: {
      material: 'Solid Oak',
      dimensions: '120cm x 60cm x 40cm',
      color: 'Natural Oak',
      weight: '18kg',
    },
  },
  {
    id: '4',
    name: 'Artisan Wall Mirror',
    description: 'Ornate gold-framed mirror with intricate detailing. Adds elegance to any space.',
    price: 24999,
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    ],
    category: 'Accessories',
    isBestseller: false,
    isNewArrival: true,
    specifications: {
      material: 'Glass, Gold-plated Frame',
      dimensions: '90cm x 120cm',
      color: 'Gold',
    },
  },
  {
    id: '5',
    name: 'Premium Linen Curtains',
    description: 'Luxurious linen curtains in neutral tones. Light-filtering fabric for elegant ambiance.',
    price: 18999,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      'https://images.unsplash.com/photo-1631889993957-2a9d7d069e0e?w=800',
    ],
    category: 'Textiles',
    isBestseller: true,
    isNewArrival: false,
    specifications: {
      material: '100% Linen',
      dimensions: 'Custom sizes available',
      color: 'Beige, Gray, Cream',
    },
  },
  {
    id: '6',
    name: 'Designer Floor Lamp',
    description: 'Modern arc floor lamp with adjustable height. Perfect for reading corners.',
    price: 15999,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    ],
    category: 'Lighting',
    isBestseller: false,
    isNewArrival: true,
    specifications: {
      material: 'Metal, Fabric Shade',
      dimensions: 'Height: 160cm',
      color: 'Black, Brass',
    },
  },
  {
    id: '7',
    name: 'Handwoven Rug',
    description: 'Artisan handwoven rug in geometric patterns. Adds warmth and texture to floors.',
    price: 42999,
    images: [
      'https://images.unsplash.com/photo-1556912172-45b7abe8b7e4?w=800',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800',
    ],
    category: 'Textiles',
    isBestseller: true,
    isNewArrival: false,
    specifications: {
      material: 'Wool, Cotton',
      dimensions: '200cm x 300cm',
      color: 'Multicolor',
    },
  },
  {
    id: '8',
    name: 'Minimalist Bookshelf',
    description: 'Open-shelf bookshelf in matte black finish. Perfect for displaying books and décor items.',
    price: 27999,
    images: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a798?w=800',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    ],
    category: 'Furniture',
    isBestseller: false,
    isNewArrival: true,
    specifications: {
      material: 'Metal, Wood',
      dimensions: '180cm x 30cm x 200cm',
      color: 'Matte Black',
      weight: '25kg',
    },
  },
]

export const categories = ['All', 'Furniture', 'Accessories', 'Textiles', 'Lighting']

export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id)
}

export const getBestsellers = (): Product[] => {
  return products.filter((p) => p.isBestseller)
}

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNewArrival)
}

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'All') return products
  return products.filter((p) => p.category === category)
}
















