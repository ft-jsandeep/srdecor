'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

export type CategoryCard = {
  label: string
  href: string
  imageSrc: string
  imageAlt: string
}

export type CategoryTextBlock = {
  headline: string
  description: string
}

export function CategoryGrid({ 
  items, 
  textBlock 
}: { 
  items: CategoryCard[]
  textBlock?: CategoryTextBlock 
}) {
  // For the first 4 items, use special positioning to match the design
  // For additional items, use a standard grid layout
  const firstFourItems = items.slice(0, 4)
  const additionalItems = items.slice(4)
  
  const getGridClasses = (index: number, isFirstFour: boolean) => {
    if (!isFirstFour) {
      // Standard grid positioning for additional items
      return 'md:col-span-1 lg:col-span-1'
    }
    
    // Special positioning for first 4 items
    if (index === 0) {
      // Large vertical on left (bottom) - starts at row 2, spans 2 rows
      return 'md:row-start-2 md:row-span-2 md:col-span-1 lg:row-start-2 lg:row-span-2 lg:col-span-1'
    } else if (index === 1) {
      // Medium horizontal - top left
      return 'md:row-start-1 md:row-span-1 md:col-span-1 lg:row-start-1 lg:row-span-1 lg:col-span-1'
    } else if (index === 2) {
      // Medium horizontal - top right
      return 'md:row-start-1 md:row-span-1 md:col-span-1 lg:row-start-1 lg:row-span-1 lg:col-span-1'
    } else {
      // Large vertical on right (middle) - starts at row 1, spans 2 rows
      return 'md:row-start-1 md:row-span-2 md:col-span-1 lg:row-start-1 lg:row-span-2 lg:col-span-1'
    }
  }
  
  const getHeight = (index: number, isFirstFour: boolean) => {
    if (!isFirstFour) {
      return 'h-[300px] md:h-[350px]'
    }
    
    if (index === 0 || index === 3) {
      return 'h-[500px] md:h-[600px] lg:h-full'
    } else {
      return 'h-[300px] md:h-[350px] lg:h-full'
    }
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {/* First 4 items with special positioning */}
      {firstFourItems.map((item, index) => (
        <motion.div
          key={`${item.href}-${index}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={[
            'relative group overflow-hidden rounded-2xl',
            getGridClasses(index, true),
          ].join(' ')}
        >
          <Link href={item.href} className="block h-full">
            <div className={`relative ${getHeight(index, true)} min-h-[300px] overflow-hidden`}>
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Category label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-white text-xl md:text-2xl lg:text-2xl font-bold uppercase tracking-wider decoration-2">
                  {item.label}
                </h3>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {/* Text Block - fills bottom right space (only if there's empty space - exactly 4 items) */}
      {textBlock && items.length === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: firstFourItems.length * 0.1 }}
          className="relative rounded-2xl bg-light-card dark:bg-dark-card md:row-start-2 md:row-span-1 md:col-span-1 lg:row-start-2 lg:row-span-1 lg:col-span-1 flex items-center justify-center p-8 md:p-12 min-h-[300px]"
        >
          <div className="text-center md:text-left w-full">
            <h3 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text mb-4 leading-tight whitespace-pre-line">
              {textBlock.headline}
            </h3>
            <p className="text-base md:text-lg text-light-textMuted dark:text-dark-textMuted leading-relaxed">
              {textBlock.description}
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Additional items beyond the first 4 */}
      {additionalItems.map((item, index) => (
        <motion.div
          key={`${item.href}-${index + 4}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: (firstFourItems.length + index) * 0.1 }}
          className={[
            'relative group overflow-hidden rounded-2xl',
            getGridClasses(index, false),
          ].join(' ')}
        >
          <Link href={item.href} className="block h-full">
            <div className={`relative ${getHeight(index, false)} min-h-[300px] overflow-hidden`}>
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Category label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-white text-xl md:text-2xl lg:text-2xl font-bold uppercase tracking-wider decoration-2">
                  {item.label}
                </h3>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

