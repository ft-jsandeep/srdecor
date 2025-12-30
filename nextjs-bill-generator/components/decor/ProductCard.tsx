'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Product } from '@/data/products'
import { Tag } from './Tag'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-light-card dark:bg-dark-card rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 cursor-pointer">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isBestseller && <Tag variant="bestseller">Bestseller</Tag>}
              {product.isNewArrival && <Tag variant="new">New</Tag>}
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-serif text-xl font-semibold text-light-text dark:text-dark-text mb-2 group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-light-textMuted dark:text-dark-textMuted mb-4 line-clamp-2">
              {product.description}
            </p>
            <p className="text-2xl font-serif font-bold text-light-text dark:text-dark-text">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}










