'use client'

import { motion } from 'framer-motion'
import { ProductGrid } from '@/components/decor/ProductGrid'
import { getNewArrivals } from '@/data/products'
import { Sparkles } from 'lucide-react'

export default function NewArrivalsPage() {
  const newArrivals = getNewArrivals()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-light-accent dark:text-dark-accent" size={40} />
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text">
            New Arrivals
          </h1>
        </div>
        <p className="text-light-textMuted dark:text-dark-textMuted">
          Discover our latest additions to the collection
        </p>
      </motion.div>

      <ProductGrid products={newArrivals} />
    </div>
  )
}










