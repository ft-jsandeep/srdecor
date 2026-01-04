'use client'

import { useState } from 'react'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { getProductById, products } from '@/data/products'
import { ProductGrid } from '@/components/decor/ProductGrid'
import { Button } from '@/components/decor/Button'
import { Tag } from '@/components/decor/Tag'
import { QuotationRequestModal } from '@/components/decor/QuotationRequestModal'

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = getProductById(id)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="font-sans text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Product Not Found
        </h1>
        <Link href="/products">
          <Button variant="primary">Back to Products</Button>
        </Link>
      </div>
    )
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-light-textMuted dark:text-dark-textMuted hover:text-light-text dark:hover:text-dark-text mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-light-surface dark:bg-dark-surface">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-light-accent dark:border-dark-accent'
                      : 'border-transparent hover:border-light-border dark:hover:border-dark-border'
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            {product.isBestseller && <Tag variant="bestseller">Bestseller</Tag>}
            {product.isNewArrival && <Tag variant="new">New Arrival</Tag>}
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
            {product.name}
          </h1>
          <p className="text-light-textMuted dark:text-dark-textMuted mb-8 leading-relaxed">
            {product.description}
          </p>

          {product.specifications && (
            <div className="mb-8 p-6 bg-light-surface dark:bg-dark-surface rounded-2xl">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Specifications</h3>
              <div className="space-y-2 text-sm">
                {product.specifications.material && (
                  <div className="flex justify-between">
                    <span className="text-light-textMuted dark:text-dark-textMuted">Material:</span>
                    <span className="text-light-text dark:text-dark-text">{product.specifications.material}</span>
                  </div>
                )}
                {product.specifications.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-light-textMuted dark:text-dark-textMuted">Dimensions:</span>
                    <span className="text-light-text dark:text-dark-text">{product.specifications.dimensions}</span>
                  </div>
                )}
                {product.specifications.color && (
                  <div className="flex justify-between">
                    <span className="text-light-textMuted dark:text-dark-textMuted">Color:</span>
                    <span className="text-light-text dark:text-dark-text">{product.specifications.color}</span>
                  </div>
                )}
                {product.specifications.weight && (
                  <div className="flex justify-between">
                    <span className="text-light-textMuted dark:text-dark-textMuted">Weight:</span>
                    <span className="text-light-text dark:text-dark-text">{product.specifications.weight}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              variant="primary" 
              className="flex-1"
              onClick={() => setIsModalOpen(true)}
            >
              <MessageSquare size={20} className="mr-2" />
              Contact for Quotation
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-sans text-3xl font-bold text-light-text dark:text-dark-text mb-8">
            Related Products
          </h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}

      {/* Quotation Request Modal */}
      {product && (
        <QuotationRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
        />
      )}
    </div>
  )
}










