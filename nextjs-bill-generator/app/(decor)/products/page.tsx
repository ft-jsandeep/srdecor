'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, X } from 'lucide-react'
import { ProductGrid } from '@/components/decor/ProductGrid'
import { FilterSidebar } from '@/components/decor/FilterSidebar'
import { SearchInput } from '@/components/decor/SearchInput'
import { products, getProductsByCategory } from '@/data/products'
import { ProductGridSkeleton } from '@/components/decor/Skeleton'

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'name'>('name')

  const filteredProducts = useMemo(() => {
    let result = getProductsByCategory(selectedCategory)
    
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      return a.name.localeCompare(b.name)
    })

    return result
  }, [selectedCategory, searchQuery, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-sans text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
          Our Products
        </h1>
        <p className="text-light-textMuted dark:text-dark-textMuted">
          Discover our curated collection of premium home décor
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter Button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SearchInput
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
            >
              <option value="name">Sort by Name</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-light-textMuted dark:text-dark-textMuted">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </div>

          {/* Product Grid */}
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="h-12 bg-light-surface dark:bg-dark-surface rounded-xl w-64 mb-4 animate-pulse" />
          <div className="h-6 bg-light-surface dark:bg-dark-surface rounded-lg w-96 animate-pulse" />
        </div>
        <ProductGridSkeleton />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}

