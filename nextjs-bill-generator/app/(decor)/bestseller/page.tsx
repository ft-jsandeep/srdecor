'use client'

import { motion } from 'framer-motion'
import { ProductGrid } from '@/components/decor/ProductGrid'
import { getBestsellers } from '@/data/products'
import { Award } from 'lucide-react'

export default function BestsellerPage() {
  const bestsellers = getBestsellers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <Award className="text-light-accent dark:text-dark-accent" size={40} />
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text">
            Bestsellers
          </h1>
        </div>
        <p className="text-light-textMuted dark:text-dark-textMuted">
          Our most loved products, handpicked by our customers
        </p>
      </motion.div>

      <ProductGrid products={bestsellers} />
    </div>
  )
}










