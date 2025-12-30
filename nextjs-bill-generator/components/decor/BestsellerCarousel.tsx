'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Product } from '@/data/products'

interface BestsellerCarouselProps {
  products: Product[]
}

export function BestsellerCarousel({ products }: BestsellerCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const animationRef = useRef<number | null>(null)
  const scrollPositionRef = useRef(0)

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollContainerRef.current || isHovered) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const scroll = () => {
      if (!scrollContainerRef.current || isHovered) return

      const container = scrollContainerRef.current
      const scrollWidth = container.scrollWidth
      const oneThird = scrollWidth / 3

      scrollPositionRef.current += 1.8
      container.scrollLeft = scrollPositionRef.current

      if (scrollPositionRef.current >= oneThird * 2) {
        scrollPositionRef.current = oneThird
        container.scrollLeft = oneThird
      }

      animationRef.current = requestAnimationFrame(scroll)
    }

    animationRef.current = requestAnimationFrame(scroll)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [isHovered])

  // Duplicate for infinite loop
  const duplicatedProducts = [...products, ...products, ...products]

  // Initialize scroll position
  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current && scrollPositionRef.current === 0) {
        const container = scrollContainerRef.current
        const oneThird = container.scrollWidth / 3
        scrollPositionRef.current = oneThird
        container.scrollLeft = oneThird
      }
    })
  }, [products])

  return (
    <div
      className="relative w-full overflow-hidden py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-hidden no-scrollbar"
      >
        {duplicatedProducts.map((product, index) => (
          <motion.div
            key={`${product.id}-${index}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 w-[320px] md:w-[360px] lg:w-[380px]"
          >
            <Link href={`/products/${product.id}`}>
              <div className="group cursor-pointer">

                {/* CARD */}
                <div className="relative aspect-[3/4] rounded-t-[999px] overflow-hidden">

                  {/* IMAGE — FULL BLEED */}
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 320px, (max-width: 1024px) 360px, 380px"
                  />

                  {/* SUBTLE BOTTOM FADE */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* GOLD BORDER — ABOVE IMAGE */}
                  <div
                    className="
                      pointer-events-none
                      absolute inset-5
                      rounded-t-[999px]
                      border-[3px] border-[#c9a24d]
                      z-10
                    "
                  />

                  {/* INNER GOLD DETAIL */}
                  <div
                    className="
                      pointer-events-none
                      absolute inset-[26px]
                      rounded-t-[999px]
                      border border-[#e3c676]
                      opacity-80
                      z-10
                    "
                  />

                  {/* LABEL */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-white px-6 py-2 rounded-md shadow-md">
                      <h3 className="text-sm md:text-base font-medium text-gray-900 whitespace-nowrap">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
